import Navbar from "../../Components/Navbar";
import React, { useEffect, useRef } from "react";
import { useMealPlanner } from "./useMealPlanner";
import { SelectionForm } from "./SelectionForm";
import { MealCalculator } from "./MealCalculator";
import { MenuItems } from "./MenuItems";
import { Modal } from "./Modal";
import { useLocation } from "react-router-dom";

const MealPlanner = () => {
  const {
    loading,
    // meals,
    // setMeals,
    selectedItems,
    // setSelectedItems,
    selectedDiningHall,
    // setSelectedDiningHall,
    selectedDay,
    // setSelectedDay,
    selectedMealTime,
    // setSelectedMealTime,
    isMealSaved,
    // setIsMealSaved,
    selectedIngredients,
    setSelectedIngredients,
    stickyTop,
    setStickyTop,
    getCategorizedItems,
    getDiningHalls,
    getDays,
    getMealTimes,
    addItemToCalculator,
    removeItemFromCalculator,
    saveMeal,
    editMeal,
    handleDiningHallChange,
    handleDayChange,
    handleMealTimeChange,
    showIngredients,
    initializeEditMeal,
  } = useMealPlanner();

  const sidebarRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.editMeal) {
      const { diningHall, day, mealTime, items } = location.state;
      initializeEditMeal(diningHall, day, mealTime, items);
    }
  }, [location, initializeEditMeal]);

  useEffect(() => {
    const handleScroll = () => {
      if (sidebarRef.current) {
        const navbarHeight = document.querySelector("nav").offsetHeight;
        const topOffset = navbarHeight > 0 ? navbarHeight : 0; // Adjust for navbar height
        const stickyOffset = sidebarRef.current.getBoundingClientRect().top;
        const newStickyTop = Math.max(0, topOffset - stickyOffset);
        setStickyTop(newStickyTop);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setStickyTop]);

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4 px-5">
        <div className="row">
          <div className="col-md-9">
            <h2>Meal Planner</h2>
            {loading ? (
              <h1>Retrieving data...</h1>
            ) : (
              <>
                <SelectionForm
                  selectedDiningHall={selectedDiningHall}
                  selectedDay={selectedDay}
                  selectedMealTime={selectedMealTime}
                  handleDiningHallChange={handleDiningHallChange}
                  handleDayChange={handleDayChange}
                  handleMealTimeChange={handleMealTimeChange}
                  getDiningHalls={getDiningHalls}
                  getDays={getDays}
                  getMealTimes={getMealTimes}
                ></SelectionForm>
                <MenuItems
                  getCategorizedItems={getCategorizedItems}
                  addItemToCalculator={addItemToCalculator}
                  showIngredients={showIngredients}
                  isMealSaved={isMealSaved}
                ></MenuItems>
              </>
            )}
          </div>
          <div
            className="col-md-3"
            ref={sidebarRef}
            style={{
              position: "sticky",
              top: `${stickyTop}px`,
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              transition: "top 0.1s ease",
            }}
          >
            <h2>Meal Calculator</h2>
            <MealCalculator
              selectedItems={selectedItems}
              removeItemFromCalculator={removeItemFromCalculator}
              isMealSaved={isMealSaved}
              saveMeal={saveMeal}
              editMeal={editMeal}
            ></MealCalculator>
          </div>
        </div>
      </div>
      <Modal
        isOpen={!!selectedIngredients}
        onClose={() => setSelectedIngredients(null)}
        title={
          selectedIngredients ? selectedIngredients.name + " Ingredients" : ""
        }
      >
        {selectedIngredients && (
          <p>{selectedIngredients.nutritionalInfo.Ingredients}</p>
        )}
      </Modal>
    </div>
  );
};

export default MealPlanner;
