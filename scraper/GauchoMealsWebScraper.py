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
        "Added Sugars": 0,
        "Protein": 0,
        "Ingredients": "None",
        "isVegetarian": False,
        "isVegan": False,
        "hasSeedOils": False,
        "hasGums": False,
        "hasPreservatives": False
    }
    
    itemName = nutrient_table.find('td', class_="cbo_nn_LabelHeader").get_text().strip()
    nutritional_info["Item"] = itemName

    if "(v)" in itemName:
        nutritional_info["isVegetarian"] = True
    elif "(vgn)" in itemName:
        nutritional_info["isVegan"] = True

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
        ingredient_flags = processIngredients(ingredients)
        for category in ingredient_flags:
            nutritional_info[category] = ingredient_flags[category]
    return nutritional_info

def processIngredients(ingredients):
    categories = {
        "hasSeedOils" : ["canola", "sunflower", "palm", "cottonseed", "soybean", "peanut oil", "margarine", "vegetable shortening", "vegetable oil", "crisco", "corn oil"],
        "hasPreservatives" : ["potassium sorbate", "calcium disodium", "potassium metabisulfite", "sodium benzoate"],
        "hasGums": ["gum"]
    }    

    ingredients = ingredients.lower()

    results = {category: False for category in categories}
    for category, items in categories.items():
        for item in items:
            if item in ingredients:
                results[category] = True
                break

    return results

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
            menu_item_link_element = wait.until(EC.presence_of_element_located((By.XPATH, f"//a[contains(text(), \"{menu_item}\") and @title='Open the nutrition label for this item']")))
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
            if dining_hall == "Takeout at Ortega Commons":
                menu = getMenuItemsByCategory(driver)
            else:
                menu = getMenuItemsByDay(driver, get_most_recent_only)
    else:
        print(f"Failed to click dining hall link for {dining_hall}. Retrieval failed, will not include in data")
        return
    
    driver.quit()
    
    return menu

def getMenu(get_most_recent_only=True):
    dining_halls = ["Takeout at Ortega Commons", "De La Guerra Dining Commons", "Carrillo Dining Commons", "Portola Dining Commons"]
    menu = {}
    max_retries = 5
    base_delay = 2

    for dining_hall in dining_halls:
        retries = 0
        while retries < max_retries:
            try:
                print("Retrieving for", dining_hall)
                menu[dining_hall] = getMenuItemsByDiningHall(dining_hall, get_most_recent_only)
                print("Retrieved for", dining_hall)
                break
            except Exception as e:                
                retries += 1
                if retries == max_retries:
                    print(f"Retrieval unsuccessful after a max {max_retries} attempts for {dining_hall}")
                else:
                    delay = base_delay * (2 ** (retries - 1))  # Exponential backoff
                    print(f"Retrieval attempt {retries} failed. Error was {e}. Retrying in {delay} seconds...")
                    time.sleep(delay)
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
        'fries': '🍟',
        'rib': '🍖',
        'fajita': '🌮',
        'pad thai': '🍜',
        'noodle': '🍜',
        'sushi': '🍣',
        'soup': '🍲',
        'chowder': '🍲',
        'salad': '🥗',
        'chaufa': '🍚',
        'tamale': '🫔',
        'pie': '🥧',
        'curry': '🍛',
        'lasanga': '🍝',
        'paella': '🥘',
        'pasta': '🍝',
        'taco': '🌮',
        'sope': '🌮',
        'pita': '🥙',
        'falafel': '🧆',
        'pizza': '🍕',
        'chicken': '🍗',
        'turkey': '🦃',
        'beef': '🥩',
        'oatmeal': '🌾',
        'pancake': '🥞',
        'crepe': '🥞',
        'macaroni & cheese': '🧀',
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
        'brownie': '🟫',
        'sausage': '🌭',
        'broccoli': '🥦',
        'zucchini': '🥒',
        'roast': '🍖',
        'rice': '🍚',
        'tofu': '◻️',
        'potato': '🥔',
    }
    
    for keyword, emoji in keyword_emoji_map.items():
        if keyword in dish_name.lower():
            return f"{dish_name} {emoji}"

    return dish_name

def setPrimaryItems(menu):
    for dining_common_name, dining_common_data in menu.items():
        if dining_common_name != "Takeout at Ortega Commons":
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
        else:
            primary_items = []
            excluded_categories = ["Beverages", "Condiments"]
            for category, items in dining_common_data.items():
                if category not in excluded_categories:
                    for item in items:
                        primary_items.append(format_dish_with_emoji(item['Item']))

            menu["Takeout at Ortega Commons"]['Primary Items'] = primary_items          
    
    return menu

def printMenu(menu):
    for dining_common_name, dining_common_data in menu.items():
        if dining_common_name != "Takeout at Ortega Commons":
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
        if hall == "Takeout at Ortega Commons":
            hall_doc = {"diningHall": "Takeout at Ortega Commons", "days": []}
            day_doc = {"day": "", "mealTimes": []}
            meal_time_doc = {"mealTime": "", "categories": []}
            
            for category, items in days.items():
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
        if dining_hall == "Takeout at Ortega Commons":
            result = meals_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"days": []}}
            )
            
            if result.modified_count > 0:
                print(f"Successfully clear {dining_hall}")
            else:
                print(f"No update was made for {dining_hall}. The document may not exist or may have an empty categories array.")
            
            formatted_day = format_new_ortega_day(new_day_data)
            
            meals_collection.update_one(
                {"_id": doc["_id"]},
                {"$push": {"days": formatted_day}}
            )
            
        elif doc and "days" in doc and len(doc["days"]) > 0:
            formatted_day, day = format_new_day(new_day_data)
            
            meals_collection.update_one(
                {"_id": doc["_id"]},
                {"$push": {"days": formatted_day }}
            )

            print(f"Updated {dining_hall} with data for {day}.")
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
    return formatted_day, day

def format_new_ortega_day(day_data):
    day_doc = {"day": "", "mealTimes": []}
    meal_time_doc = {"mealTime": "", "categories": [], "primaryItems": []}

    for category, items in day_data.items():
        if category == "Primary Items":
            meal_time_doc["primaryItems"] = items
            continue
        
        category_doc = {"category": category, "items": []}

        for item in items:
            item_doc = {
                "_id": ObjectId(),
                "name": item["Item"],
                "nutritionalInfo": {k: v for k, v in item.items() if k != "Item"}
            }
            category_doc["items"].append(item_doc)
    
        meal_time_doc["categories"].append(category_doc)
    day_doc["mealTimes"].append(meal_time_doc)

    return day_doc

def scrape(get_most_recent_only=False):
    menu = getMenu(get_most_recent_only)

    if (get_most_recent_only):
        daily_update_db(menu)
    else:
        save_to_db(menu)

if __name__ == "__main__":
    scrape(get_most_recent_only=True)

