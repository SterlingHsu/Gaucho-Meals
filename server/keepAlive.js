const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL; 
const interval = 30000; 

function keepAlive() {
  axios.get(BACKEND_URL)
    .then(response => {
      console.log(`Keep-alive ping at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error pinging at ${new Date().toISOString()}:`, error.message);
    });
}

setInterval(keepAlive, interval);

module.exports = keepAlive;