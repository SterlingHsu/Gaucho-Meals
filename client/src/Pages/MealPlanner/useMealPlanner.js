import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const useMealPlanner = () => {
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
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [stickyTop, setStickyTop] = useState(0);

  useEffect(() => {
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
  }, [selectedItems]);

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

    const hallMeals = meals.find(
      (meal) => meal.diningHall === selectedDiningHall
    );
    if (!hallMeals) return [];

    if (selectedDiningHall === "Takeout at Ortega Commons") {
      return hallMeals.days[0].mealTimes[0].categories.filter(
        (category) => category.category !== "Primary Items"
      );
    } else if (selectedDay && selectedMealTime) {
      const selectedDayMeals = hallMeals.days.find(
        (day) => day.day === selectedDay
      );
      if (!selectedDayMeals) return [];

      const selectedMealTimeCategories = selectedDayMeals.mealTimes.find(
        (mealTime) => mealTime.mealTime === selectedMealTime
      );

      return selectedMealTimeCategories
        ? selectedMealTimeCategories.categories.filter(
            (category) => category.category !== "Primary Items"
          )
        : [];
    }
    return [];
  }, [meals, selectedDiningHall, selectedDay, selectedMealTime]);

  const getDiningHalls = useMemo(() => {
    return Array.from(new Set(meals.map((meal) => meal.diningHall)));
  }, [meals]);

  const getDays = useMemo(() => {
    if (!selectedDiningHall) return [];
    else if (selectedDiningHall === "Takeout at Ortega Commons")
      return Array.from(
        new Set(
          meals
            .find((meal) => meal.diningHall === "De La Guerra Dining Commons")
            .days.map((day) => day.day)
        )
      );
    else
      return Array.from(
        new Set(
          meals
            .find((meal) => meal.diningHall === selectedDiningHall)
            .days.map((day) => day.day)
        )
      );
  }, [meals, selectedDiningHall]);

  const getMealTimes = useMemo(() => {
    if (!selectedDiningHall || !selectedDay) return [];
    else if (selectedDiningHall === "Takeout at Ortega Commons")
      return ["Breakfast", "Lunch", "Dinner"];
    else
      return Array.from(
        new Set(
          meals
            .find((meal) => meal.diningHall === selectedDiningHall)
            .days.find((day) => day.day === selectedDay)
            .mealTimes.map((mealTime) => mealTime.mealTime)
        )
      );
  }, [meals, selectedDiningHall, selectedDay]);

  const addItemToCalculator = useCallback(
    (item) => {
      setSelectedItems((prevItems) => {
        const newItems = { ...prevItems };
        if (newItems[item.name]) {
          newItems[item.name] = {
            ...newItems[item.name],
            quantity: newItems[item.name].quantity + 1,
          };
        } else {
          newItems[item.name] = { ...item, quantity: 1 };
        }
        return newItems;
      });
    },
    [setSelectedItems]
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
          nutritionalInfo: {
            Calories: item.nutritionalInfo.Calories,
            Protein: item.nutritionalInfo.Protein,
            "Total Fat": item.nutritionalInfo["Total Fat"],
            "Total Carbohydrate": item.nutritionalInfo["Total Carbohydrate"],
          },
        })),
      };
      // console.log("Sending meal data:", JSON.stringify(mealData, null, 2));
      await axios.post(`${apiUrl}/api/meals/save-meal`, mealData, {
        withCredentials: true,
      });
      setIsMealSaved(true);
      localStorage.setItem("isMealSaved", true);
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

  // Votes for dishes
  const saveVote = useCallback(
    async (
      itemId,
      newVoteType,
      voteValue,
      selectedDay,
      selectedDiningHall,
      selectedMealTime
    ) => {
      try {
        await axios.post(
          `${apiUrl}/api/meals/vote/${itemId}`,
          { voteValue, selectedDay, selectedDiningHall, selectedMealTime },
          {
            withCredentials: true,
          }
        );

        setUserVotes((prevVotes) => {
          const currentVote = prevVotes[itemId];
          let newVotes;

          // Remove the vote if there was already one
          if (currentVote === newVoteType) {
            const { [itemId]: _, ...restVotes } = prevVotes;
            newVotes = restVotes;
          } else {
            newVotes = {
              ...prevVotes,
              [itemId]: newVoteType,
            };
          }

          saveVotesToStorage(
            newVotes,
            selectedDiningHall,
            selectedDay,
            selectedMealTime
          );

          return newVotes;
        });
      } catch (error) {
        console.error(
          "Error saving vote:",
          error.response?.data || error.message
        );
      }
    },
    // eslint-disable-next-line
    []
  );

  const STORAGE_KEY = "userVotesDictionary";
  const EXPIRATION_DAYS = 7;

  const getStorageKey = (diningHall, date, mealtime) => {
    return `${diningHall}_${date}_${mealtime}`;
  };

  const saveVotesToStorage = (votes, diningHall, date, mealtime) => {
    const storageKey = getStorageKey(diningHall, date, mealtime);
    const currentDictionary = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    currentDictionary[storageKey] = {
      votes,
      expiration: Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDictionary));
  };

  const getVotesFromStorage = useCallback((diningHall, date, mealtime) => {
    const storageKey = getStorageKey(diningHall, date, mealtime);
    const currentDictionary = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );
    const storedData = currentDictionary[storageKey];

    if (storedData && storedData.expiration > Date.now()) {
      return storedData.votes;
    }

    // If expired or not found, remove the entry and return null
    if (storedData) {
      delete currentDictionary[storageKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDictionary));
    }
    return null;
  }, []);

  const cleanExpiredVotes = () => {
    const currentDictionary = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );
    let hasChanges = false;

    Object.keys(currentDictionary).forEach((key) => {
      if (currentDictionary[key].expiration <= Date.now()) {
        delete currentDictionary[key];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDictionary));
    }
  };

  useEffect(() => {
    cleanExpiredVotes();

    const storedVotes = getVotesFromStorage(
      selectedDiningHall,
      selectedDay,
      selectedMealTime
    );
    if (storedVotes) {
      setUserVotes(storedVotes);
    }
  }, [selectedDiningHall, selectedDay, selectedMealTime, getVotesFromStorage]);

  const editMeal = useCallback(() => {
    setIsMealSaved(false);
    localStorage.setItem("isMealSaved", false);
  }, [setIsMealSaved]);

  const handleDiningHallChange = useCallback(
    (diningHall) => {
      setSelectedDiningHall(diningHall);
      setSelectedDay("");
      localStorage.setItem("selectedDay", "");
      setSelectedMealTime("");
      localStorage.setItem("selectedMealTime", "");
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
      localStorage.setItem("selectedDay", day);
      setSelectedMealTime("");
      localStorage.setItem("selectedMealTime", "");
      setSelectedItems({});
      setIsMealSaved(false);
    },
    [setSelectedDay, setSelectedMealTime, setSelectedItems, setIsMealSaved]
  );

  const handleMealTimeChange = useCallback(
    (mealTime) => {
      setSelectedMealTime(mealTime);
      localStorage.setItem("selectedMealTime", mealTime);
      setSelectedItems({});
      setIsMealSaved(false);
    },
    [setSelectedMealTime, setSelectedItems, setIsMealSaved]
  );

  const handleDietaryPreferenceChange = (preference) => {
    setDietaryPreferences((prev) =>
      prev.includes(preference)
        ? prev.filter((p) => p !== preference)
        : [...prev, preference]
    );
  };

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
    saveVote,
    userVotes,
    handleDiningHallChange,
    handleDayChange,
    handleMealTimeChange,
    dietaryPreferences,
    handleDietaryPreferenceChange,
    showIngredients,
    initializeEditMeal,
  };
};

export default useMealPlanner;
