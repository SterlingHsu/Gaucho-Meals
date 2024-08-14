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
    if (typeof carbs === 'string' && carbs.includes('<')) {
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
    <div id="calculator" className="border p-3">
      <h4>Selected Items</h4>
      <ul id="selected-items" className="list-group mb-3">
        {Object.values(selectedItems).map((item) => (
          <li
            key={item.name}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {item.name} <strong> x {item.quantity}</strong>
            </span>
            {!isMealSaved && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeItemFromCalculator(item.name)}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <h4>Nutritional Info</h4>
      <p>
        Calories: <span id="total-calories">{totalCalories}</span>
      </p>
      <p>
        Protein: <span id="total-protein">{totalProtein}g</span>
      </p>
      <p>
        Fat: <span id="total-fat">{totalFat}g</span>
      </p>
      <p>
        Carbs: <span id="total-carbs">{totalCarbs}g</span>
      </p>
      <div className="d-flex justify-content-end">
        {!isMealSaved ? (
          <button className="btn btn-success" onClick={() => saveMeal()}>
            Save Meal
          </button>
        ) : (
          <div>
            <button className="btn btn-primary mr-1" onClick={() => editMeal()}>
              Edit Meal
            </button>
            <button className="btn btn-success"> Saved ✅</button>
          </div>
        )}
      </div>
    </div>
  );
};
