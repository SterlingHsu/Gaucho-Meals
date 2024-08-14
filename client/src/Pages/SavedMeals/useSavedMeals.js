import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useSavedMeals = () => {
  const [savedMeals, setSavedMeals] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchSavedMeals = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/users/saved-meals`,
        {
          withCredentials: true,
        }
      );
      const savedMeals = response.data.plannedMeals;

      const mealsWithDetails = await Promise.all(
        savedMeals.map(async (meal) => {
          const itemsWithDetails = await Promise.all(
            meal.items.map(async (item) => {
              const itemResponse = await axios.get(
                `${apiUrl}/api/meals/item/${item._id}`
              );
              return { ...itemResponse.data, quantity: item.quantity };
            })
          );

          return {
            ...meal,
            items: itemsWithDetails,
          };
        })
      );

      setSavedMeals(mealsWithDetails);
    } catch (err) {
      console.error("Error fetching saved meals:", err);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchSavedMeals();
  }, [fetchSavedMeals]);

  const deleteSavedMeal = useCallback(async (mealId) => {
    try {
      await axios.delete(`${apiUrl}api/meals/delete-meal/${mealId}`, {
        withCredentials: true,
      });
      setSavedMeals((prevMeals) =>
        prevMeals.filter((meal) => meal._id !== mealId)
      );
    } catch (err) {
      console.error("Error deleting meal:", err);
    }
    // eslint-disable-next-line
  }, []);

  return { savedMeals, fetchSavedMeals, deleteSavedMeal };
};
