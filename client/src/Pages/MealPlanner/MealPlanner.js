import Navbar from "../../Components/Navbar";
import React, { useState, useEffect, useRef } from "react";
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
    saveVote,
    userVotes,
    handleDiningHallChange,
    handleDayChange,
    handleMealTimeChange,
    dietaryPreferences,
    handleDietaryPreferenceChange,
    showIngredients,
    initializeEditMeal,
  } = useMealPlanner();
  
  const [showCalculator, setShowCalculator] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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


  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const toggleCalculator = () => setShowCalculator(!showCalculator);

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4 px-5">
        <div className="row">
          <div className="col-md-9">
            <h2 style={{ display: "inline", marginRight: "15px" }}>
              Meal Planner
            </h2>
            {loading && (
              <span style={{ fontStyle: "italic" }}>Updating data...</span>
            )}
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
              dietaryPreferences={dietaryPreferences}
              handleDietaryPreferenceChange={handleDietaryPreferenceChange}
            ></SelectionForm>
            <MenuItems
              getCategorizedItems={getCategorizedItems}
              addItemToCalculator={addItemToCalculator}
              showIngredients={showIngredients}
              isMealSaved={isMealSaved}
              saveVote={saveVote}
              userVotes={userVotes}
              dietaryPreferences={dietaryPreferences}
            ></MenuItems>
          </div>
          {!isMobile && (
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
          )}
        </div>
      </div>
      <div>
        {isMobile && (
          <>
            <button
              onClick={toggleCalculator}
              className="btn btn-dark position-fixed bottom-0 end-0 m-3"
              style={{ zIndex: 1030 }}
            >
              Meal Calculator
            </button>
            <div
              className={`offcanvas offcanvas-bottom ${
                showCalculator ? "show" : ""
              }`}
              tabIndex="-1"
              id="mealCalculator"
              style={{ height: '90vh', transition: 'transform .3s ease-in-out' }}
            >
              <div className="offcanvas-header">
                <h5 className="offcanvas-title">Meal Calculator</h5>
                <button
                  type="button"
                  className="btn-close text-reset"
                  onClick={toggleCalculator}
                  aria-label="Close"
                ></button>
              </div>
              <div className="offcanvas-body">
                <MealCalculator
                  selectedItems={selectedItems}
                  removeItemFromCalculator={removeItemFromCalculator}
                  isMealSaved={isMealSaved}
                  saveMeal={saveMeal}
                  editMeal={editMeal}
                ></MealCalculator>
              </div>
            </div>
            {showCalculator && (
              <div
                className="offcanvas-backdrop fade show"
                onClick={toggleCalculator}
              ></div>
            )}
          </>
        )}
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
