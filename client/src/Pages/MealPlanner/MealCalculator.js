import React from "react";

const MealCalculator = ({
  selectedItems,
  removeItemFromCalculator,
  isMealSaved,
  saveMeal,
  editMeal,
  selectedDay,
  selectedMealTime,
}) => {
  const parseNutrientField = (item, nutrient) => {
    let nutrientData = item.nutritionalInfo[nutrient];
    if (typeof nutrientData === "string" && nutrientData.includes("<")) {
      nutrientData = 0;
    } else {
      nutrientData = parseFloat(nutrientData);
    }
    return nutrientData;
  };
  const calculateNutritionalInfo = () => {
    let totalCalories = 0,
      totalProtein = 0,
      totalFat = 0,
      totalCarbs = 0;

    Object.values(selectedItems).forEach((item) => {
      totalCalories +=
        parseFloat(item.nutritionalInfo.Calories) * item.quantity;
      totalProtein += parseNutrientField(item, "Protein") * item.quantity;
      totalFat += parseNutrientField(item, "Total Fat") * item.quantity;
      totalCarbs +=
        parseNutrientField(item, "Total Carbohydrate") * item.quantity;
    });

    return { totalCalories, totalProtein, totalFat, totalCarbs };
  };

  const { totalCalories, totalProtein, totalFat, totalCarbs } =
    calculateNutritionalInfo();

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">Selected Items</h5>
        <ul className="list-group mb-4">
          {Object.values(selectedItems).map((item) => (
            <li
              key={item.name}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>
                {item.name}{" "}
                <span className="badge bg-secondary">
                  x {item.quantity}
                </span>
              </span>
              {!isMealSaved && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeItemFromCalculator(item.name)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>

        <h5 className="card-title mb-1">Nutritional Info</h5>
        <ul className="list-group list-group-flush mb-2">
          <li className="list-group-item d-flex justify-content-between">
            <span>Calories</span>
            <strong>{totalCalories.toFixed(0)}</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Protein</span>
            <strong>{totalProtein.toFixed(0)}g</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Fat</span>
            <strong>{totalFat.toFixed(0)}g</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Carbs</span>
            <strong>{totalCarbs.toFixed(0)}g</strong>
          </li>
        </ul>

        <div className="d-flex justify-content-end align-items-center">
          {!isMealSaved ? (
            !(selectedDay && selectedMealTime) ? (
              <>
                <span className="me-2 fst-italic text-muted">
                  Please select a day and meal time
                </span>
                <button className="btn btn-danger" disabled>
                  Save Meal
                </button>
              </>
            ) : (
              <button className="btn btn-success" onClick={() => saveMeal()}>
                Save Meal
              </button>
            )
          ) : (
            <>
              <button
                className="btn btn-primary me-2"
                onClick={() => editMeal()}
              >
                Edit Meal
              </button>
              <button className="btn btn-success" disabled>
                Saved ✅ <i className="bi bi-check-circle-fill"></i>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MealCalculator);
