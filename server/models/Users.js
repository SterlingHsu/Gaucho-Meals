const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  nutritionGoal: {
    type: String,
    required: false,
  },
  dietaryRestriction: {
    type: String,
    required: false,
  },
  dailyCaloricIntake: {
    type: String,
    required: false,
  },
  plannedMeals: [
    {
      diningHall: String,
      day: String,
      // day is difficult to use in sorting, so we have a new mealDate 
      mealDate: Date,
      mealTime: String,
      items: [
        {
          item: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
          quantity: Number,
        },
      ],
    },
  ],
});

const Users = mongoose.model("users", UserSchema);

module.exports = Users;
