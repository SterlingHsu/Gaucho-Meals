@echo off
call C:\Users\Ka\anaconda3\Scripts\activate.bat GauchoMeals
python C:\Users\Ka\GauchoMeals\scripts\GauchoMealsWebScraper.py >> C:\Users\Ka\GauchoMeals\scripts\scraper_log.txt 2>&1