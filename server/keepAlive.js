const axios = require("axios");
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

module.exports = keepAlive;
