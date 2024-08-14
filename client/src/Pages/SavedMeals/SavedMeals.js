import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar.js";
import { useSavedMeals } from "./useSavedMeals";

const SavedMeals = () => {
  const navigate = useNavigate();
  const { savedMeals } = useSavedMeals();

  const calculateTotalNutrition = (items) => {
    let totalCalories = 0,
      totalProtein = 0,
      totalFat = 0,
      totalCarbs = 0;

    items.forEach((item) => {
      totalCalories +=
        parseFloat(item.nutritionalInfo.Calories) * item.quantity;
      totalProtein += parseFloat(item.nutritionalInfo.Protein) * item.quantity;
      totalFat += parseFloat(item.nutritionalInfo["Total Fat"]) * item.quantity;
      let carbs = item.nutritionalInfo["Total Carbohydrate"];
      if (typeof carbs === "string" && carbs.includes("<")) {
        carbs = 0;
      } else {
        carbs = parseFloat(carbs);
      }
      totalCarbs += carbs * item.quantity;
    });

    return { totalCalories, totalProtein, totalFat, totalCarbs };
  };

  const editMeal = (meal) => {
    navigate("/meal-planner", {
      state: {
        editMeal: true,
        diningHall: meal.diningHall,
        day: meal.day,
        mealTime: meal.mealTime,
        items: meal.items,
      },
    });
  };

  function groupMealsByDate(meals) {
    return meals.reduce((acc, meal) => {
      if (!acc[meal.day]) {
        acc[meal.day] = [];
      }
      acc[meal.day].push(meal);
      return acc;
    }, {});
  }

  return (
    <>
      <Navbar />
      <div className="container-fluid mt-3">
        <h2 className="mb-3">Saved Meals</h2>
        {Object.entries(groupMealsByDate(savedMeals)).map(
          ([date, meals], dateIndex) => (
            <div key={date} className="mb-4">
              <h4 className="mb-3">{date}</h4>
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {meals.map((meal, mealIndex) => {
                  const { totalCalories, totalProtein, totalFat, totalCarbs } =
                    calculateTotalNutrition(meal.items);
                  return (
                    <div key={mealIndex} className="col">
                      <div className="card h-100 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center bg-light py-2">
                          <span className="fw-bold">
                            {meal.mealTime} at {meal.diningHall}
                          </span>
                        </div>
                        <div className="card-body p-3">
                          <div className="row g-2">
                            <div className="col-sm-7">
                              <h6 className="card-subtitle mb-2 text-muted">
                                Items
                              </h6>
                              <ul className="list-unstyled mb-0">
                                {meal.items.map((item, idx) => (
                                  <li key={idx} className="small">
                                    {item.name} x {item.quantity || 1}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="col-sm-5">
                              <h6 className="card-subtitle mb-2 text-muted">
                                Nutrition
                              </h6>
                              <ul className="list-unstyled small mb-0">
                                <li>
                                  Calories:{" "}
                                  <strong>{totalCalories.toFixed(0)}</strong>
                                </li>
                                <li>
                                  Protein:{" "}
                                  <strong>{totalProtein.toFixed(0)}g</strong>
                                </li>
                                <li>
                                  Fat: <strong>{totalFat.toFixed(0)}g</strong>
                                </li>
                                <li>
                                  Carbs:{" "}
                                  <strong>{totalCarbs.toFixed(0)}g</strong>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        {dateIndex < 7 && (
                          <div className="card-footer bg-transparent border-top-0">
                            <button
                              className="btn btn-primary btn-sm w-10"
                              onClick={() => editMeal(meal)}
                            >
                              Edit Meal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default SavedMeals;
