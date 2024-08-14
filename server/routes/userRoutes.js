const express = require("express");
const UserModel = require("../models/Users");
const { validateToken, verify, secret } = require("../JWT");

const router = express.Router();

router.post("/user-survey", validateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const nutritionGoal = req.body.nutritionGoal;
    const dietaryRestriction = req.body.dietaryRestriction;
    const dailyCaloricIntake = req.body.dailyCaloricIntake;

    await UserModel.findByIdAndUpdate(userId, {
      nutritionGoal,
      dietaryRestriction,
      dailyCaloricIntake,
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.get("/read", async (req, res) => {
  try {
    const result = await UserModel.find();
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/saved-meals", validateToken, async (req, res) => {
  try {
    const accessToken = req.cookies["access-token"];
    const decodedToken = verify(accessToken, secret);
    const userId = decodedToken._id;
    // console.log(userId);

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ plannedMeals: user.plannedMeals});
    // console.log(user.plannedMeals)
  } catch (error) {
    console.error("Error fetching saved meals:", error);
    res
      .status(500)
      .json({ message: "Error fetching saved meals", error: error.message });
  }
});

module.exports = router;
