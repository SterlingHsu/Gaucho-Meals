import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

export const useMealPlanner = () => {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState(() => {
    const storedMeals = localStorage.getItem("meals");
    return storedMeals ? JSON.parse(storedMeals) : [];
  });
  const [selectedItems, setSelectedItems] = useState(() => {
    const savedItems = localStorage.getItem("selectedItems");
    return savedItems ? JSON.parse(savedItems) : {};
  });
  const [selectedDiningHall, setSelectedDiningHall] = useState(() => {
    return localStorage.getItem("selectedDiningHall") || "";
  });
  const [selectedDay, setSelectedDay] = useState(() => {
    return localStorage.getItem("selectedDay") || "";
  });
  const [selectedMealTime, setSelectedMealTime] = useState(() => {
    return localStorage.getItem("selectedMealTime") || "";
  });
  const [isMealSaved, setIsMealSaved] = useState(() => {
    const saved = localStorage.getItem("isMealSaved");
    return saved === "true";
  });
  const [selectedIngredients, setSelectedIngredients] = useState(null);
  const [stickyTop, setStickyTop] = useState(0);

  useEffect(() => {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
  }, [selectedItems]);

  useEffect(() => {
    localStorage.setItem("selectedDiningHall", selectedDiningHall);
  }, [selectedDiningHall]);

  useEffect(() => {
    localStorage.setItem("selectedDay", selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    localStorage.setItem("selectedMealTime", selectedMealTime);
  }, [selectedMealTime]);

  useEffect(() => {
    localStorage.setItem("isMealSaved", isMealSaved);
  }, [isMealSaved]);

  const initializeEditMeal = useCallback((diningHall, day, mealTime, items) => {
    setSelectedDiningHall(diningHall);
    setSelectedDay(day);
    setSelectedMealTime(mealTime);
    setSelectedItems(
      items.reduce((acc, item) => {
        acc[item.name] = item;
        return acc;
      }, {})
    );
    setIsMealSaved(false);
  }, []);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/meals/get-meals`);
        setMeals(response.data);
        localStorage.setItem("meals", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching meals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
    // eslint-disable-next-line
  }, []);

  const getCategorizedItems = useMemo(() => {
    if (!selectedDiningHall) return [];
    if (selectedDiningHall === "Take Out at Ortega Commons") {
      return meals
        .filter((meal) => meal.diningHall === selectedDiningHall)
        .flatMap((meal) => meal.categories);
    } else if (selectedDay && selectedMealTime) {
      return meals
        .filter((meal) => meal.diningHall === selectedDiningHall)
        .flatMap((meal) => meal.days)
        .filter((day) => day.day === selectedDay)
        .flatMap((day) => day.mealTimes)
        .filter((mealTime) => mealTime.mealTime === selectedMealTime)
        .flatMap((mealTime) => mealTime.categories);
    }
    return [];
  }, [meals, selectedDiningHall, selectedDay, selectedMealTime]);

  const getDiningHalls = useMemo(() => {
    return Array.from(new Set(meals.map((meal) => meal.diningHall)));
  }, [meals]);

  const getDays = useMemo(() => {
    if (!selectedDiningHall) return [];
    else if (selectedDiningHall === "Take Out at Ortega Commons")
      return Array.from(
        new Set(
          meals
            .filter((meal) => meal.diningHall === "De La Guerra Dining Commons")
            .flatMap((meal) => meal.days)
            .map((day) => day.day)
        )
      );
    else
      return Array.from(
        new Set(
          meals
            .filter((meal) => meal.diningHall === selectedDiningHall)
            .flatMap((meal) => meal.days)
            .map((day) => day.day)
        )
      );
  }, [meals, selectedDiningHall]);

  const getMealTimes = useMemo(() => {
    if (!selectedDiningHall || !selectedDay) return [];
    else if (selectedDiningHall === "Take Out at Ortega Commons")
      return ["Breakfast", "Lunch", "Dinner"];
    else
      return Array.from(
        new Set(
          meals
            .filter((meal) => meal.diningHall === selectedDiningHall)
            .flatMap((meal) => meal.days)
            .filter((day) => day.day === selectedDay)
            .flatMap((day) => day.mealTimes)
            .map((mealTime) => mealTime.mealTime)
        )
      );
  }, [meals, selectedDiningHall, selectedDay]);

  const addItemToCalculator = useCallback(
    (itemName) => {
      setSelectedItems((prevItems) => {
        const newItems = { ...prevItems };
        if (newItems[itemName]) {
          newItems[itemName] = {
            ...newItems[itemName],
            quantity: newItems[itemName].quantity + 1,
          };
        } else {
          const item = meals
            .flatMap((meal) =>
              meal.diningHall === "Take Out at Ortega Commons"
                ? meal.categories.flatMap((category) => category.items)
                : meal.days.flatMap((day) =>
                    day.mealTimes.flatMap((mealTime) =>
                      mealTime.categories.flatMap((category) => category.items)
                    )
                  )
            )
            .find((i) => i.name === itemName);
          newItems[itemName] = { ...item, quantity: 1 };
        }
        return newItems;
      });
    },
    [meals, setSelectedItems]
  );

  const removeItemFromCalculator = useCallback(
    (itemName) => {
      setSelectedItems((prevItems) => {
        const newItems = { ...prevItems };
        if (newItems[itemName].quantity > 1) {
          newItems[itemName] = {
            ...newItems[itemName],
            quantity: newItems[itemName].quantity - 1,
          };
        } else {
          delete newItems[itemName];
        }
        return newItems;
      });
    },
    [setSelectedItems]
  );

  const saveMeal = useCallback(async () => {
    try {
      const mealData = {
        diningHall: selectedDiningHall,
        day: selectedDay,
        mealTime: selectedMealTime,
        items: Object.values(selectedItems).map((item) => ({
          _id: item._id.$oid || item._id.toString(),
          name: item.name,
          quantity: item.quantity,
          calories: item.nutritionalInfo.Calories,
          protein: item.nutritionalInfo.Protein,
          fat: item.nutritionalInfo["Total Fat"],
          carbs: item.nutritionalInfo["Total Carbohydrate"],
        })),
      };
      // console.log("Sending meal data:", JSON.stringify(mealData, null, 2));
      await axios.post(`${apiUrl}/api/meals/save-meal`, mealData, {
        withCredentials: true,
      });
      setIsMealSaved(true);
    } catch (error) {
      console.error(
        "Error saving meal:",
        error.response?.data || error.message
      );
    }
    // eslint-disable-next-line
  }, [
    selectedDiningHall,
    selectedDay,
    selectedMealTime,
    selectedItems,
    setIsMealSaved,
  ]);

  const editMeal = useCallback(() => {
    setIsMealSaved(false);
  }, [setIsMealSaved]);

  const handleDiningHallChange = useCallback(
    (diningHall) => {
      setSelectedDiningHall(diningHall);
      setSelectedDay("");
      setSelectedMealTime("");
      setSelectedItems({});
      setIsMealSaved(false);
    },
    [
      setSelectedDiningHall,
      setSelectedDay,
      setSelectedMealTime,
      setSelectedItems,
      setIsMealSaved,
    ]
  );

  const handleDayChange = useCallback(
    (day) => {
      setSelectedDay(day);
      setSelectedMealTime("");
      setSelectedItems({});
      setIsMealSaved(false);
    },
    [setSelectedDay, setSelectedMealTime, setSelectedItems, setIsMealSaved]
  );

  const handleMealTimeChange = useCallback(
    (mealTime) => {
      setSelectedMealTime(mealTime);
      setSelectedItems({});
      setIsMealSaved(false);
    },
    [setSelectedMealTime, setSelectedItems, setIsMealSaved]
  );

  const showIngredients = useCallback(
    (item) => {
      setSelectedIngredients(item);
    },
    [setSelectedIngredients]
  );

  return {
    loading,
    meals,
    setMeals,
    selectedItems,
    setSelectedItems,
    selectedDiningHall,
    setSelectedDiningHall,
    selectedDay,
    setSelectedDay,
    selectedMealTime,
    setSelectedMealTime,
    isMealSaved,
    setIsMealSaved,
    selectedIngredients,
    setSelectedIngredients,
    stickyTop,
    setStickyTop,
    getCategorizedItems,
    getDiningHalls,
    getDays,
    getMealTimes,
    addItemToCalculator,
    removeItemFromCalculator,
    saveMeal,
    editMeal,
    handleDiningHallChange,
    handleDayChange,
    handleMealTimeChange,
    showIngredients,
    initializeEditMeal,
  };
};
