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
    <div>
      <div className="mb-3">
        <label htmlFor="diningHallSelect" className="form-label">
          Select Dining Hall:
        </label>
        <select
          id="diningHallSelect"
          className="form-select bg-light text-dark"
          onChange={(e) => {
            handleDiningHallChange(e.target.value);
          }}
          value={selectedDiningHall}
        >
          <option value=""> Select a Dining Hall </option>
          {getDiningHalls.map((diningHall, index) => (
            <option key={index} value={diningHall}>
              {diningHall}
            </option>
          ))}
        </select>
      </div>
      {selectedDiningHall && (
        <div className="mb-3">
          <label htmlFor="daySelect" className="form-label">
            Select Day:
          </label>
          <select
            id="daySelect"
            className="form-select bg-light text-dark"
            onChange={(e) => {
              handleDayChange(e.target.value);
            }}
            value={selectedDay}
            disabled={!selectedDiningHall}
          >
            <option value=""> Select a Day </option>
            {getDays.map((day, index) => (
              <option key={index} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedDiningHall && (
        <div className="mb-3">
          <label htmlFor="mealTimeSelect" className="form-label">
            Select Meal Time:
          </label>
          <select
            id="mealTimeSelect"
            className="form-select bg-light text-dark"
            onChange={(e) => {
              handleMealTimeChange(e.target.value);
            }}
            value={selectedMealTime}
            disabled={!selectedDay}
          >
            <option value=""> Select a Meal Time </option>
            {getMealTimes.map((mealTime, index) => (
              <option key={index} value={mealTime}>
                {mealTime}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
