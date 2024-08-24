from bs4 import BeautifulSoup
import re
import chromedriver_autoinstaller
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException, TimeoutException

import pymongo
from bson import ObjectId

from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')

chromedriver_autoinstaller.install()
options = ChromeOptions()
options.add_argument("--headless=new")
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

def getMenuItemInfo(driver):
    WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.ID, "nutritionLabel")))
    
    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")
    nutrient_table = soup.find("div", id="nutritionLabel")

    nutritional_info = {
        "Item": 0,
        "Calories": 0,
        "Total Fat": 0,
        "Saturated Fat": 0,
        "Trans Fat": 0,
        "Cholesterol": 0,
        "Sodium": 0,
        "Total Carbohydrate": 0,
        "Dietary Fiber": 0,
        "Total Sugars": 0,
        "Added Sugars": -1,
        "Protein": 0,
        "Ingredients": "None",
    }
    
    itemName = nutrient_table.find('td', class_="cbo_nn_LabelHeader").get_text().strip()
    nutritional_info["Item"] = itemName
    calories_span = nutrient_table.find('span', class_="font-16", string="Calories")
    if calories_span:
        calorie_count = calories_span.find_parent().find_next_sibling().get_text().strip()
        nutritional_info["Calories"] = calorie_count
    else:
        print("Calories information not found.")
    labels = nutrient_table.find_all(class_='cbo_nn_LabelBorderedSubHeader')
    for label in labels:
        nutri = label.find('span')
        if nutri:
            nutriName = nutri.get_text().strip()
            if "Added Sugars" in nutriName:
                if nutriName == "Include 0 g Added Sugars" or nutriName == "Include NA  Added Sugars":
                    nutritional_info["Added Sugars"] = "0g"
                else: 
                    match = re.search(r'\b(\d+)\s*g\b', label.get_text())
                    if match:
                        extracted_number = match.group(1)
                        nutritional_info["Added Sugars"] = extracted_number + "g"
                    else:
                        print("No match found.")
            else:
                if nutriName in nutritional_info:
                    nutriAmountSpan = nutri.find_next_sibling('span')
                    if nutriAmountSpan:
                        nutriAmount = nutriAmountSpan.get_text().strip()
                        if nutriAmount == "NA": 
                            nutriAmount = "0g"
                        nutritional_info[nutriName] = nutriAmount
                    else:
                        print("Nutritional quantity for", nutriName, " could not be found." )
        else: 
            print("Error parsing for nutrient names.")
    ingredientList = nutrient_table.find('span', class_="cbo_nn_LabelIngredients")
    if ingredientList:
        ingredients = ingredientList.get_text().replace("\xa0", " ").strip()
        nutritional_info["Ingredients"] = ingredients
    return nutritional_info

def getMenuItemsByCategory(driver):
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "cbo_nn_itemGroupRow")))
    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")
    category_rows = soup.find_all("tr", class_="cbo_nn_itemGroupRow")
    menu_items_by_category = {}
    for category_row in category_rows:
        category_name = category_row.find("div").get_text().strip()
        next_tr = category_row.find_next_sibling("tr")
        items_in_category = []
        while next_tr and "cbo_nn_itemGroupRow" not in next_tr.get("class", []):
            menu_item = next_tr.find("a").get_text().strip()
            menu_item_link_element = driver.find_element(By.XPATH, f"//a[contains(text(), \"{menu_item}\") and @title='Open the nutrition label for this item']")
            if menu_item_link_element:
                menu_item_link_element.click()
                nutritional_info = getMenuItemInfo(driver)
                items_in_category.append(nutritional_info)
                close_button = driver.find_element(By.ID, "btn_nn_nutrition_close")
                close_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "btn_nn_nutrition_close")))
                close_button.click()
            next_tr = next_tr.find_next_sibling("tr")
        menu_items_by_category[category_name] = items_in_category   
    return menu_items_by_category

def getMenuItemsByDay(driver, get_most_recent_only=True):
    wait = WebDriverWait(driver, 10)
    
    menuItemsByDay = {}

    days = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, '.card.mb-3.h4')))
    
    if get_most_recent_only:
        most_recent_day = days[-1]
        
        date_element = most_recent_day.find_element(By.CSS_SELECTOR, '.card-title.h4')
        date = date_element.text.strip()
        
        meal_links = most_recent_day.find_elements(By.CSS_SELECTOR, '.cbo_nn_menuLink')
        
        menuItemsByMeal = {}
        
        for i in range(len(meal_links)):
            days = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, '.card.mb-3.h4')))
            most_recent_day = days[-1]
            meal_links = most_recent_day.find_elements(By.CSS_SELECTOR, '.cbo_nn_menuLink')
            meal = meal_links[i]
            meal_name = meal.text.strip()
            meal.click()
            menuItemsByMeal[meal_name] = getMenuItemsByCategory(driver)
            back_button = wait.until(EC.element_to_be_clickable((By.ID, 'btn_Back*Menu Details')))
            actions = ActionChains(driver)
            actions.move_to_element(back_button).perform()
            back_button.click()
            
            menuItemsByDay[date] = menuItemsByMeal        
    
    else:
        for day_index in range(len(days)):
            days = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, '.card.mb-3.h4')))
            day = days[day_index]

            date_element = day.find_element(By.CSS_SELECTOR, '.card-title.h4')
            date = date_element.text.strip()

            # Find all meal links within the day
            meal_links = day.find_elements(By.CSS_SELECTOR, '.cbo_nn_menuLink')

            menuItemsByMeal = {}

            for i in range(len(meal_links)):
                days = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, '.card.mb-3.h4')))
                day = days[day_index]
                meal_links = day.find_elements(By.CSS_SELECTOR, '.cbo_nn_menuLink')
                meal = meal_links[i]
                meal_name = meal.text.strip()
                meal.click()
                menuItemsByMeal[meal_name] = getMenuItemsByCategory(driver)
                back_button = wait.until(EC.element_to_be_clickable((By.ID, 'btn_Back*Menu Details')))
                actions = ActionChains(driver)
                actions.move_to_element(back_button).perform()
                back_button.click()

            menuItemsByDay[date] = menuItemsByMeal
    return menuItemsByDay

def click_with_retry(driver, xpath, retries=3, delay=1):
    for attempt in range(retries):
        try:
            element = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, xpath)))
            element.click()
            return True
        except (StaleElementReferenceException, TimeoutException, NoSuchElementException) as e:
            time.sleep(delay)
        except Exception as e:
            print(f"Unexpected error during attempt {attempt + 1}: {e}")
            time.sleep(delay)
    return False

def getMenuItemsByDiningHall(dining_hall, get_most_recent_only=True):
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 10)
    driver.implicitly_wait(10)
    menu = {}

    driver.get("https://nutrition.info.dining.ucsb.edu/NetNutrition/1#")
    if click_with_retry(driver, f"//a[@class='text-white' and contains(text(), '{dining_hall}')]", retries=3):
        if click_with_retry(driver, "//a[@class='text-white']", retries=3):
            if dining_hall == "Take Out at Ortega Commons":
                menu = getMenuItemsByCategory(driver)
            else:
                menu = getMenuItemsByDay(driver, get_most_recent_only)
    else:
        print(f"Failed to click dining hall link for {dining_hall}")
    
    driver.quit()
    
    return menu

def getMenu(get_most_recent_only=True):
    dining_halls = ["Take Out at Ortega Commons", "De La Guerra Dining Commons", "Carrillo Dining Commons", "Portola Dining Commons"]
    menu = {}
    
    for dining_hall in dining_halls:
        try:
            print("Retrieving for", dining_hall)
            menu[dining_hall] = getMenuItemsByDiningHall(dining_hall, get_most_recent_only)
            print("Retrieved for", dining_hall)
        except:
            print("Retrieval unsuccessful")
    
    setPrimaryItems(menu)
    
    return menu

def format_dish_with_emoji(dish_name):
    keyword_emoji_map = {
        'sandwich': '🥪',
        'burger': '🍔',
        'burrito': '🌯',
        'wrap': '🌯',
        'tostada': '🌮',
        'enchilada': '🌯',
        'fajita': '🌮',
        'noodle': '🍜',
        'soup': '🍲',
        'chowder': '🍲',
        'salad': '🥗',
        'chaufa': '🍚',
        'pie': '🥧',
        'curry': '🍛',
        'lasanga': '🍝',
        'pasta': '🍝',
        'taco': '🌮',
        'sope': '🌮',
        'pizza': '🍕',
        'chicken': '🍗',
        'beef': '🥩',
        'oatmeal': '🌾',
        'pancake': '🥞',
        'waffle': '🧇',
        'pork': '🥓',
        'fish': '🐟',
        'ahi': '🐟',
        'cod': '🐟',
        'bacon': '🥓',
        'salmon': '🐟',
        'steak': '🥩',
        'egg': '🍳',
        'bread': '🍞',
        'cereal': '🥣',
        'muffin': '🍞',
        'roll': '🥐',
        'cookie': '🍪',
        'cake': '🍰',
        'sausage': '🌭',
        'roast': '🍖',
        'rice': '🍚',
        'tofu': '◻️',
        'potato': '🥔',
        'broccoli': '🥦'
    }
    
    for keyword, emoji in keyword_emoji_map.items():
        if keyword in dish_name.lower():
            return f"{dish_name} {emoji}"

    return dish_name

def setPrimaryItems(menu):
    for dining_common_name, dining_common_data in menu.items():
        if dining_common_name != "Take Out at Ortega Commons":
            for date, meals in dining_common_data.items():
                for meal, categories in meals.items():
                    primary_items = []
                    if isinstance(categories, dict):
                        for category, items in categories.items():
                            if items:
                                primary_items.append(format_dish_with_emoji(items[0]['Item']))  # Add the first item
                                if len(items) > 1:  # If there's more than one item
                                    primary_items.append(format_dish_with_emoji(items[1]['Item']))  # Add the second item

                    meals[meal]['Primary Items'] = primary_items

    return menu

def printMenu(menu):
    for dining_common_name, dining_common_data in menu.items():
        if dining_common_name != "Take Out at Ortega Commons":
            print("Name of Dining Common:", dining_common_name)
            for date, meals in dining_common_data.items():
                print("\nMeals for", date)
                for meal, categories in meals.items():
                    print("\n", meal)
                    for category, items in categories.items():
                        print("\n", category, "\n")
                        if category == "Primary Items":
                            for item in items:
                                print(item, "\n")
                        else:
                            for item in items:
                                print("-", item['Item'])

def save_to_db(data):
    client = pymongo.MongoClient(MONGO_URI)
    db = client["UCMealPlannerApp"]
    meals_collection = db["meals"]
    
    meals_collection.delete_many({})  # Clear the collection

    for hall, days in data.items():
        if hall == "Take Out at Ortega Commons":
            hall_doc = {"diningHall": hall, "categories": []}
            
            for category, items in days.items():
                category_doc = {"category": category, "items": []}
                
                for item in items:
                    item_doc = {
                        "_id": ObjectId(),
                        "name": item["Item"],
                        "nutritionalInfo": {k: v for k, v in item.items() if k != "Item"}
                    }
                    category_doc["items"].append(item_doc)
                
                hall_doc["categories"].append(category_doc)
            
            meals_collection.insert_one(hall_doc)
            
        else:
            hall_doc = {"diningHall": hall, "days": []}

            for day, meal_times in days.items():
                day_doc = {"day": day, "mealTimes": []}
                
                for meal_time, categories in meal_times.items():
                    meal_time_doc = {"mealTime": meal_time, "categories": [], "primaryItems": []}
                    
                    for category, items in categories.items():
                        category_doc = {"category": category, "items": []}
                        if category == "Primary Items": 
                            meal_time_doc["primaryItems"] = items
                        else:
                            for item in items:
                                item_doc = {
                                    "_id": ObjectId(),
                                    "name": item["Item"],
                                    "nutritionalInfo": {k: v for k, v in item.items() if k != "Item"}
                                }
                                category_doc["items"].append(item_doc)

                            meal_time_doc["categories"].append(category_doc)

                    day_doc["mealTimes"].append(meal_time_doc)

                hall_doc["days"].append(day_doc)

            meals_collection.insert_one(hall_doc)

def daily_update_db(data):
    client = pymongo.MongoClient(MONGO_URI)
    db = client["UCMealPlannerApp"]
    meals_collection = db["meals"]
    
    for dining_hall, new_day_data in data.items():
        doc = meals_collection.find_one({"diningHall": dining_hall})
        if dining_hall == "Take Out at Ortega Commons":
            result = meals_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"categories": []}}
            )
            
            if result.modified_count > 0:
                print(f"Successfully clear {dining_hall}")
            else:
                print(f"No update was made for {dining_hall}. The document may not exist or may have an empty categories array.")
            
            formatted_day = format_new_ortega_day(new_day_data)
            
            meals_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"categories": formatted_day}}
            )
            
        elif doc and "days" in doc and len(doc["days"]) > 0:
            result = meals_collection.update_one(
                {"_id": doc["_id"]},
                {"$pop": {"days": -1}}
            )
            
            if result.modified_count > 0:
                print(f"Successfully removed the first day from {dining_hall}")
            else:
                print(f"No update was made for {dining_hall}. The document may not exist or may have an empty days array.")
            
            formatted_day = format_new_day(new_day_data)
            
            meals_collection.update_one(
                {"_id": doc["_id"]},
                {"$push": {"days": formatted_day }}
            )

            print(f"Updated {dining_hall} with new day data.")
        else:
            print(f"No existing data found for {dining_hall} or empty days array.")

def format_new_day(day_data):
    day, meals = next(iter(day_data.items()))
    formatted_day = {
        "day": day,
        "mealTimes": []
    }
    for meal_time, categories in meals.items():
        meal_time_doc = {
            "mealTime": meal_time,
            "categories": [], 
            "primaryItems": []
        }
        for category, items in categories.items():
            category_doc = {
                "category": category,
                "items": []
            }
            if category == "Primary Items": 
                meal_time_doc["primaryItems"] = items
            else: 
                for item in items:
                    item_doc = {
                        "_id": ObjectId(),
                        "name": item["Item"],
                        "nutritionalInfo": {k: v for k, v in item.items() if k != "Item"}
                    }
                    category_doc["items"].append(item_doc)
                meal_time_doc["categories"].append(category_doc)
        formatted_day["mealTimes"].append(meal_time_doc)
    return formatted_day

def format_new_ortega_day(day_data):
    categories = []
    for category, items in day_data.items():
        category_doc = {"category": category, "items": []}

        for item in items:
            item_doc = {
                "_id": ObjectId(),
                "name": item["Item"],
                "nutritionalInfo": {k: v for k, v in item.items() if k != "Item"}
            }
            category_doc["items"].append(item_doc)
        categories.append(category_doc)

    return categories

if __name__ == "__main__":
    menu = getMenu(get_most_recent_only=True)
    daily_update_db(menu)

