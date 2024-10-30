import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar.js";
import { useSavedMeals } from "./useSavedMeals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faPencil } from "@fortawesome/free-solid-svg-icons";
import mapachesad from "../../Static/img/mapachesad.png";

const SavedMeals = () => {
  const navigate = useNavigate();
  const { savedMeals, deleteSavedMeal, loading } = useSavedMeals();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
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
      <span className="text-muted me-1">Total:</span>
      <span className="nutrition-badge calories">
        {nutrition.dailyCalories.toFixed(0)} Calories |
      </span>
      <span className="nutrition-badge protein">
        {nutrition.dailyProtein.toFixed(0)}g Protein |
      </span>
      <span className="nutrition-badge fat">
        {nutrition.dailyFat.toFixed(0)}g Fats |
      </span>
      <span className="nutrition-badge carbs">
        {nutrition.dailyCarbs.toFixed(0)}g Carbs
      </span>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container-fluid py-4 px-4">
        {!loading && savedMeals.length === 0 ? (
          <div className="text-center py-5">
            <div className="empty-state-container">
              <img
                src={mapachesad}
                alt="Sad Mapache"
                className="empty-state-image mb-4"
              />
              <h3 className="fw-bold text-muted">No meals planned yet!</h3>
              <p className="text-muted">
                Start planning your meals to see them here.
              </p>
            </div>
          </div>
        ) : (
          dates.map((date) => (
            <div key={date} className="meal-date-group mb-4">
              <div
                className={`date-header ${date === today ? "current-day" : ""}`}
              >
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between p-3">
                  <h4 className="fw-bold m-0 mb-1">
                    {date === today ? (
                      <span className="text-primary">Today - {date}</span>
                    ) : (
                      date
                    )}
                  </h4>
                  <DailyNutritionSummary
                    nutrition={calculateDailyNutrition(groupedMeals[date])}
                  />
                </div>
              </div>

              <div className="row g-4 mt-1">
                {groupedMeals[date].map((meal, mealIndex) => {
                  const { totalCalories, totalProtein, totalFat, totalCarbs } =
                    calculateTotalNutrition(meal.items);
                  return (
                    <div key={mealIndex} className="col-md-6 col-lg-4">
                      <div className="card shadow-sm">
                        <div className="meal-card-header">
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 meal-title">
                              <span className="meal-time">{meal.mealTime}</span>
                              <span className="text-muted mx-2">·</span>
                              <span className="dining-hall">
                                {meal.diningHall}
                              </span>
                            </h5>
                            <div className="meal-actions">
                              <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => editMeal(meal)}
                              >
                                <FontAwesomeIcon icon={faPencil} />
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => deleteSavedMeal(meal._id)}
                              >
                                <FontAwesomeIcon icon={faTrashCan} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="meal-card-nutrition py-2 px-3">
                          <small style={{ fontWeight: 500 }}>
                            {totalCalories.toFixed(0)} Calories |{" "}
                            {totalProtein.toFixed(0)}g Protein |{" "}
                            {totalFat.toFixed(0)}g Fats | {totalCarbs.toFixed(0)}
                            g Carbs
                          </small>
                        </div>

                        <div className="meal-items-list">
                          {meal.items.map((item, idx) => (
                            <div key={idx} className="meal-item">
                              <span>{item.name}</span>
                              <span className="badge bg-secondary">
                                × {item.quantity}
                              </span>
                            </div>
                          ))}
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
        .meal-date-group {
          background: white;
          overflow: hidden;
        }

        .date-header {
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .current-day {
          background: #e8f4ff;
        }

        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
          transition: transform 0.2s;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .meal-card-header {
          padding: 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .meal-title {
          font-size: 1rem;
          line-height: 1.4;
        }

        .meal-time {
          font-weight: 650;
          color: #2b3137;
        }

        .dining-hall {
          font-size: 0.9rem;
          color: #6c757d;
        }

        .meal-items-list {
          padding: 0 1rem 0.75rem;
        }

        .meal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0;
          font-size: 0.9rem;
          color: #495057;
        }

        .nutrition-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .nutrition-badge {
          padding: 0.25rem;
          border-radius: 6px;
          font-size: .9rem;
          font-weight: 500;
        }

        .empty-state-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .empty-state-image {
          max-width: 200px;
          height: auto;
        }
      `}</style>
    </>
  );
};

export default SavedMeals;
