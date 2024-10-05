const SelectionForm = ({
  selectedDiningHall,
  selectedDay,
  selectedMealTime,
  handleDiningHallChange,
  handleDayChange,
  handleMealTimeChange,
  dietaryPreferences,
  handleDietaryPreferenceChange,
  getDiningHalls,
  getDays,
  getMealTimes,
}) => {
  return (
    <div className="container mt-3 pb-4">
      <div className="row g-3 align-items-end">
        <div className="col-md-4">
          <label htmlFor="diningHallSelect" className="form-label fw-bold">
            Dining Hall
          </label>
          <select
            id="diningHallSelect"
            className="form-select form-select-lg shadow-sm"
            onChange={(e) => handleDiningHallChange(e.target.value)}
            value={selectedDiningHall}
          >
            <option value="">Select a Dining Hall</option>
            {getDiningHalls.map((diningHall, index) => (
              <option key={index} value={diningHall}>
                {diningHall}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="daySelect" className="form-label fw-bold">
            Day
          </label>
          <select
            id="daySelect"
            className="form-select form-select-lg shadow-sm"
            onChange={(e) => handleDayChange(e.target.value)}
            value={selectedDay}
            disabled={!selectedDiningHall}
          >
            <option value="">Select a Day</option>
            {getDays.map((day, index) => (
              <option key={index} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="mealTimeSelect" className="form-label fw-bold">
            Meal Time
          </label>
          <select
            id="mealTimeSelect"
            className="form-select form-select-lg shadow-sm"
            onChange={(e) => handleMealTimeChange(e.target.value)}
            value={selectedMealTime}
            disabled={!selectedDay || !selectedDiningHall}
          >
            <option value="">Select a Meal Time</option>
            {getMealTimes.map((mealTime, index) => (
              <option key={index} value={mealTime}>
                {mealTime}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <label className="form-label fw-bold">Dietary Preferences</label>
          <div className="d-flex flex-wrap">
            {[
              "No Seed Oils",
              "No Preservatives",
              "No Gums",
              "Vegetarian",
              "Vegan",
            ].map((preference) => (
              <div key={preference} className="form-check me-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={preference.replace(/\s+/g, "-").toLowerCase()}
                  checked={dietaryPreferences.includes(preference)}
                  onChange={() => handleDietaryPreferenceChange(preference)}
                />
                <label
                  className="form-check-label"
                  htmlFor={preference.replace(/\s+/g, "-").toLowerCase()}
                >
                  {preference}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionForm;
