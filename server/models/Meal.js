const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  diningHall: String,
  days: [
    {
      day: String,
      mealTimes: [
        {
          mealTime: String,
          categories: [
            {
              category: String,
              items: [
                {
                  _id: mongoose.Schema.Types.ObjectId,
                  name: String,
                  nutritionalInfo: mongoose.Schema.Types.Mixed,
                  rating: {
                    positiveRaters: [ mongoose.Schema.Types.ObjectId ],
                    negativeRaters: [ mongoose.Schema.Types.ObjectId ],
                    display: Boolean,
                    netRatingIsPositive: Boolean,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const Meal = mongoose.model("Meal", mealSchema, "meals");

module.exports = Meal;
