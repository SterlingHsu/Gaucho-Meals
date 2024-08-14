const express = require("express");
const { validateToken } = require("../JWT");

const router = express.Router();

router.get("/meal-planner", validateToken, (req, res) => {
  res.json({ message: "Mealplanner Data" });
});

module.exports = router;
