const axios = require("axios");
const Meal = require("./models/Meal");
require("dotenv").config();

const BACKEND_URL = process.env.BACKEND_URL;
let tick = 0;
function keepAlive() {
  axios
    .get(BACKEND_URL)
    .then()
    .catch(() => {
      if (tick >= 120) {
        console.log(`Server pinged at ${new Date().toISOString()}:`);
        tick = 0;
      }
    });
  tick++;
}

async function cleanUpOutdatedMeals() {
  try {
    const today = new Date();
    const todayISOString = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    console.log(`Today's date: ${todayISOString}`);

    const result = await Meal.updateMany(
      { diningHall: { $ne: "Takeout at Ortega Commons" } },
      [
        {
          $set: {
            days: {
              $filter: {
                input: "$days",
                cond: {
                  $gte: [
                    {
                      $dateFromString: {
                        dateString: {
                          $dateToString: {
                            date: {
                              $dateFromString: { dateString: "$$this.day" },
                            },
                            format: "%Y-%m-%d",
                          },
                        },
                      },
                    },
                    { $dateFromString: { dateString: todayISOString } },
                  ],
                },
              },
            },
          },
        },
      ]
    );
    console.log(`Updated ${result.modifiedCount} meal records`);
  } catch (error) {
    console.error("Error removing past days from meals:", error);
  }
}

module.exports = { keepAlive, cleanUpOutdatedMeals };
