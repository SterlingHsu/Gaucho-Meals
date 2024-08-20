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
      <div className="h-100 container-fluid px-5 mt-3">
        <h2 className="fw-bold mb-3">Saved Meals</h2>
        {loading ? (
          <h1>Loading saved meals...</h1>
        ) : savedMeals.length === 0 ? (
          <div className="text-center">
            <img
              src={mapachesad}
              alt="Sad Mapache"
              className="img-fluid"
              style={{ maxWidth: "500px" }}
            />
            <h1>No meals saved yet!</h1>
          </div>
        ) : (
          Object.entries(groupMealsByDate(savedMeals)).map(
            ([date, meals], dateIndex) => (
              <div key={date} className="mb-3">
                <h4 className="mb-2 p-3 text-black">{date}</h4>
                <div className="row row-cols-1 row-cols-md-3 g-4">
                  {meals.map((meal, mealIndex) => {
                    const {
                      totalCalories,
                      totalProtein,
                      totalFat,
                      totalCarbs,
                    } = calculateTotalNutrition(meal.items);
                    return (
                      <div key={mealIndex} className="col">
                        <div className="card h-100 shadow">
                          <div className="card-header d-flex justify-content-between align-items-center py-3">
                            <span className="fw-bold text-black">
                              {meal.mealTime} at {meal.diningHall}
                            </span>
                            <button
                              className="btn btn-outline-danger btn-sm float-right"
                              onClick={() => deleteSavedMeal(meal._id)}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </button>
                          </div>
                          <div className="card-body p-4">
                            <div className="row g-3">
                              <div className="col-sm-7">
                                <h6 className="card-subtitle mb-3 text-muted">
                                  Items
                                </h6>
                                <ul className="list-group list-group-flush">
                                  {meal.items.map((item, idx) => (
                                    <li
                                      key={idx}
                                      className="list-group-item px-0 py-1 border-0"
                                    >
                                      {item.name} x {item.quantity || 1}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="col-sm-5">
                                <h6 className="card-subtitle mb-3 text-muted">
                                  Nutrition
                                </h6>
                                <ul className="list-group list-group-flush">
                                  <li className="list-group-item px-0 py-1 d-flex justify-content-between align-items-center border-0">
                                    <span>Calories:</span>
                                    <span className="badge bg-primary rounded-pill">
                                      {totalCalories.toFixed(0)}
                                    </span>
                                  </li>
                                  <li className="list-group-item px-0 py-1 d-flex justify-content-between align-items-center border-0">
                                    <span>Protein:</span>
                                    <span className="badge bg-success rounded-pill">
                                      {totalProtein.toFixed(0)}g
                                    </span>
                                  </li>
                                  <li className="list-group-item px-0 py-1 d-flex justify-content-between align-items-center border-0">
                                    <span>Fat:</span>
                                    <span className="badge bg-warning rounded-pill">
                                      {totalFat.toFixed(0)}g
                                    </span>
                                  </li>
                                  <li className="list-group-item px-0 py-1 d-flex justify-content-between align-items-center border-0">
                                    <span>Carbs:</span>
                                    <span className="badge bg-info rounded-pill">
                                      {totalCarbs.toFixed(0)}g
                                    </span>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer bg-transparent border-top-0 text-end">
                            {dateIndex < 7 && (
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => editMeal(meal)}
                              >
                                Edit Meal
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )
        )}
      </div>
    </>
  );
};

export default SavedMeals;
