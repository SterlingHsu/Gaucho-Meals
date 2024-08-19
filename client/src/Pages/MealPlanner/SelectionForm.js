export const SelectionForm = ({
  selectedDiningHall,
  selectedDay,
  selectedMealTime,
  handleDiningHallChange,
  handleDayChange,
  handleMealTimeChange,
  getDiningHalls,
  getDays,
  getMealTimes,
}) => {
  return (
    <div className="container mt-3 pb-4">
      <div className="row g-3 align-items-end">
        <div className="col-md-4">
          <label htmlFor="diningHallSelect" className="form-label fw-bold">
            Select Dining Hall:
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
            Select Day:
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
            Select Meal Time:
          </label>
          <select
            id="mealTimeSelect"
            className="form-select form-select-lg shadow-sm"
            onChange={(e) => handleMealTimeChange(e.target.value)}
            value={selectedMealTime}
            disabled={!selectedDay}
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
    </div>
  );
};