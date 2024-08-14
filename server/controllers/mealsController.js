const Meal = require('../models/Meal');

const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({});
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMeals };