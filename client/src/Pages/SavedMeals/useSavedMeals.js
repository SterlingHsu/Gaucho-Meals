import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useSavedMeals = () => {
  const [savedMeals, setSavedMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchSavedMeals = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/users/saved-meals`, {
        withCredentials: true,
      });

      const savedMeals = response.data.plannedMeals;

      setSavedMeals(savedMeals);
    } catch (err) {
      console.error("Error fetching saved meals:", err);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchSavedMeals();
  }, [fetchSavedMeals]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchSavedMeals();
      setLoading(false);
    };
    fetchData();
  }, [fetchSavedMeals]);

  const deleteSavedMeal = useCallback(async (mealId) => {
    try {
      await axios.delete(`${apiUrl}/api/meals/delete-meal/${mealId}`, {
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

  return { savedMeals, fetchSavedMeals, deleteSavedMeal, loading };
};
