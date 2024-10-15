import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar.js";
import { useSavedMeals } from "./useSavedMeals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import mapachesad from "../../Static/img/mapachesad.png";

const SavedMeals = () => {
  const navigate = useNavigate();
  const { savedMeals, deleteSavedMeal, loading } = useSavedMeals();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const groupMealsByDate = (savedMeals) => {
    const mealOrder = ["Breakfast", "Lunch", "Dinner"];
    const groupedMeals = savedMeals.reduce((acc, meal) => {
      if (!acc[meal.day]) {
        acc[meal.day] = [];
      }
      acc[meal.day].push(meal);
      acc[meal.day].sort(
        (a, b) => mealOrder.indexOf(a.mealTime) - mealOrder.indexOf(b.mealTime)
      );
      return acc;
    }, {});

    // Move today to the beginning if it exists
    const dates = Object.keys(groupedMeals);
    if (dates.includes(today)) {
      const todayIndex = dates.indexOf(today);
      dates.unshift(dates.splice(todayIndex, 1)[0]);
    }

    return { groupedMeals, dates };
  };

  const { groupedMeals, dates } = groupMealsByDate(savedMeals);

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

  const calculateDailyNutrition = (meals) => {
    let dailyCalories = 0,
      dailyProtein = 0,
      dailyFat = 0,
      dailyCarbs = 0;

    meals.forEach((meal) => {
      const { totalCalories, totalProtein, totalFat, totalCarbs } =
        calculateTotalNutrition(meal.items);
      dailyCalories += totalCalories;
      dailyProtein += totalProtein;
      dailyFat += totalFat;
      dailyCarbs += totalCarbs;
    });

    return { dailyCalories, dailyProtein, dailyFat, dailyCarbs };
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

  const DailyNutritionSummary = ({ nutrition }) => (
    <div className="daily-nutrition-summary">
      <span className="text-muted me-2">Total:</span>
      <span className="badge bg-primary me-1">
        {nutrition.dailyCalories.toFixed(0)} Cal
      </span>
      <span className="badge bg-success me-1">
        {nutrition.dailyProtein.toFixed(0)}g Pro
      </span>
      <span className="badge bg-warning me-1">
        {nutrition.dailyFat.toFixed(0)}g Fat
      </span>
      <span className="badge bg-info">
        {nutrition.dailyCarbs.toFixed(0)}g Carb
      </span>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container-fluid px-5 mt-3">
        <h2 style={{ display: "inline", marginRight: "15px" }} className="fw-bold mb-3">
          Planned Meals
        </h2>
        {loading ? (
          <span style={{ fontStyle: "italic" }}>Updating data...</span>
        ) : savedMeals.length === 0 ? (
          <div className="text-center">
            <img
              src={mapachesad}
              alt="Sad Mapache"
              className="img-fluid"
              style={{ maxWidth: "100%", height: "auto", maxHeight: "100%" }}
            />
            <h1>No meals planned yet!</h1>
          </div>
        ) : (
          dates.map((date) => (
            <div key={date} className="mb-3">
              <div
                className={`d-flex flex-column align-items-md-center mb-2 p-2 ${
                  date === today ? "bg-light rounded" : ""
                }`}
              >
                <h4 className="mb-2 mb-md-0 me-md-3">
                  {date === today ? `Today - ${date}` : date}
                </h4>
                <DailyNutritionSummary
                  nutrition={calculateDailyNutrition(groupedMeals[date])}
                />
              </div>
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {groupedMeals[date].map((meal, mealIndex) => {
                  const { totalCalories, totalProtein, totalFat, totalCarbs } =
                    calculateTotalNutrition(meal.items);
                  return (
                    <div key={mealIndex} className="col">
                      <div className="card h-100 shadow">
                        <div className="card-header d-flex justify-content-between align-items-center py-3">
                          <span className="mb-0 fw-bold text-black">
                            {meal.mealTime} at {meal.diningHall}
                          </span>
                          <button
                            className="btn btn-outline-danger btn-sm float-right"
                            onClick={() => deleteSavedMeal(meal._id)}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between mb-2 ms-2">
                            <div className="nutrition-summary">
                              <span className="text-muted me-2">Total:</span>
                              <span className="badge bg-primary me-1">
                                {totalCalories.toFixed(0)} Cal
                              </span>
                              <span className="badge bg-success me-1">
                                {totalProtein.toFixed(0)}g Pro
                              </span>
                              <span className="badge bg-warning me-1">
                                {totalFat.toFixed(0)}g Fat
                              </span>
                              <span className="badge bg-info">
                                {totalCarbs.toFixed(0)}g Carb
                              </span>
                            </div>
                          </div>
                          <ul className="list-group list-group-flush">
                            {meal.items.map((item, idx) => (
                              <li
                                key={idx}
                                className="list-group-item p-2 py-1 d-flex justify-content-between align-items-center border-0"
                              >
                                <span>{item.name}</span>
                                <span className="badge bg-secondary">
                                  x {item.quantity || 1}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="card-footer bg-transparent border-top-0 text-end">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => editMeal(meal)}
                          >
                            Edit Meal
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`
        .nutrition-summary .badge,
        .daily-nutrition-summary .badge {
          font-size: 0.8rem;
        }
        @media (max-width: 576px) {
          .card-body {
            padding: 0.5rem !important;
          }
          .nutrition-summary,
          .daily-nutrition-summary {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.25rem;
          }
          .nutrition-summary .badge,
          .daily-nutrition-summary .badge {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </>
  );
};

export default SavedMeals;
