const express = require("express");
const { getMeals } = require("../controllers/mealsController");
const { validateToken, verify, secret } = require("../JWT");
const { ObjectId } = require("mongodb");
const Users = require("../models/Users");
const Meal = require("../models/Meal");
const router = express.Router();

router.get("/get-meals", getMeals);

router.post("/save-meal", validateToken, async (req, res) => {
  try {
    const accessToken = req.cookies["access-token"];
    const decodedToken = verify(accessToken, secret);
    const userId = decodedToken._id;

    const { diningHall, day, mealTime, items } = req.body;

    const mealDate = new Date(day);

    const newMeal = {
      diningHall,
      day,
      mealDate,
      mealTime,
      items,
    };

    const user = await Users.findOne({ _id: userId }, { plannedMeals: 1 });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const insertIndex = user.plannedMeals.findIndex(
      (meal) => new Date(meal.day) < mealDate
    );

    const updateQuery = {
      $set: {},
      $push: {},
    };

    const existingIndex = user.plannedMeals.findIndex(
      (meal) => meal.day === day && meal.mealTime === mealTime
    );

    if (existingIndex !== -1) {
      updateQuery.$set[`plannedMeals.${existingIndex}`] = newMeal;
    } else {
      if (insertIndex === -1) {
        updateQuery.$push.plannedMeals = {
          $each: [newMeal],
          $position: user.plannedMeals.length,
        };
      } else {
        updateQuery.$push.plannedMeals = {
          $each: [newMeal],
          $position: insertIndex,
        };
      }
    }

    await Users.updateOne({ _id: userId }, updateQuery);

    res.status(200).json({ message: "Meal saved successfully" });
  } catch (error) {
    console.error("Error saving meal:", error);
    res
      .status(500)
      .json({ message: "Error saving meal", error: error.message });
  }
});

router.delete("/delete-meal/:id", validateToken, async (req, res) => {
  const id = new ObjectId(req.params.id);

  try {
    const result = await Users.updateOne(
      { "plannedMeals._id": id },
      { $pull: { plannedMeals: { _id: id } } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Meal not found" });
    }

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Meal couldn't be deleted" });
    }

    res.status(200).json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/item/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);

    const result = await Meal.findOne(
      { "days.mealTimes.categories.items._id": id },
      { "days.$": 1 }
    );

    if (!result) {
      console.log("Meal item not found");
      return res.status(404).json({ error: "Meal item not found" });
    }

    const item = result.days[0].mealTimes
      .flatMap((mealTime) => mealTime.categories)
      .flatMap((category) => category.items)
      .find((item) => item._id.equals(id));

    if (!item) {
      console.log("Meal item not found in the result");
      return res.status(404).json({ error: "Meal item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
