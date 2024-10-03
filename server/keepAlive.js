const axios = require("axios");
require("dotenv").config();

const BACKEND_URL = process.env.BACKEND_URL;
let tick = 0;
function keepAlive() {
  axios
    .get(BACKEND_URL)
    .then((response) => {
      // Log keep-alive ping once an hour
      if (tick >= 120) {
        console.log(
          `Keep-alive ping at ${new Date().toISOString()}: Status Code ${
            response.status
          }`
        );
        tick = 0;
      }
    })
    .catch((error) => {
      console.error(
        `Error pinging at ${new Date().toISOString()}:`,
        error.message
      );
    });
  tick++;
}

module.exports = keepAlive;
