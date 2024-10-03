const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

console.log(process.env.NODE_ENV);

const allowedOrigins = [
  process.env.FRONTEND_URL_PROD,
  process.env.FRONTEND_URL_DEV,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_DB_URL);

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const mealRoutes = require("./routes/mealRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meals", mealRoutes);

app.listen(PORT, () => {
  console.log(`Connected! Running on ${PORT}`);
});

const BACKEND_URL = process.env.BACKEND_URL
const interval = 30000;

function reloadWebsite() {
  axios.get(BACKEND_URL)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}

setInterval(reloadWebsite, interval);
