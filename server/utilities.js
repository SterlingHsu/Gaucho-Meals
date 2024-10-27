const axios = require("axios");
const Meal = require("./models/Meal");
const Users = require("./models/Users")
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
    const todayFormatted = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "America/Los_Angeles",
    }).format(today);

    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoFormatted = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "America/Los_Angeles",
    }).format(sevenDaysAgo);

    console.log(`Today's date: ${todayFormatted}`);
    console.log(`Cleaning up meals older than: ${sevenDaysAgoFormatted}`);

    // Update meal records to remove days older than today in the new format
    const mealResult = await Meal.updateMany(
      { diningHall: { $ne: "Takeout at Ortega" } },
      [
        {
          $set: {
            days: {
              $filter: {
                input: "$days",
                cond: {
                  $gte: [
                    "$$this.day",
                    todayFormatted,
                  ],
                },
              },
            },
          },
        },
      ]
    );
    console.log(`Updated ${mealResult.modifiedCount} meal records`);

    // Remove planned meals older than seven days ago in the Users collection
    const userResult = await Users.updateMany(
      {},
      {
        $pull: {
          plannedMeals: {
            mealDate: { $lt: sevenDaysAgoFormatted },
          },
        },
      }
    );
    console.log(`Updated ${userResult.modifiedCount} user records`);
  } catch (error) {
    console.error("Error removing outdated meals:", error);
  }
}

module.exports = { keepAlive, cleanUpOutdatedMeals };
