export const MealCalculator = ({
  selectedItems,
  removeItemFromCalculator,
  isMealSaved,
  saveMeal,
  editMeal,
}) => {
  const calculateNutritionalInfo = () => {
    let totalCalories = 0,
      totalProtein = 0,
      totalFat = 0,
      totalCarbs = 0;

    Object.values(selectedItems).forEach((item) => {
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
                <span className="badge bg-secondary rounded-pill">
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

        <h5 className="card-title mb-3">Nutritional Info</h5>
        <ul className="list-group list-group-flush mb-4">
          <li className="list-group-item d-flex justify-content-between">
            <span>Calories:</span>
            <strong>{totalCalories.toFixed(2)}</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Protein:</span>
            <strong>{totalProtein.toFixed(2)}g</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Fat:</span>
            <strong>{totalFat.toFixed(2)}g</strong>
          </li>
          <li className="list-group-item d-flex justify-content-between">
            <span>Carbs:</span>
            <strong>{totalCarbs.toFixed(2)}g</strong>
          </li>
        </ul>

        <div className="d-flex justify-content-end">
          {!isMealSaved ? (
            <button className="btn btn-success" onClick={() => saveMeal()}>
              Save Meal
            </button>
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
