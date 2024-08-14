const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

console.log(process.env.NODE_ENV);
console.log(process.env.FRONTEND_URL)

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
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
const otherRoutes = require("./routes/otherRoutes");
const mealRoutes = require("./routes/mealRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/others", otherRoutes);
app.use("/api/meals", mealRoutes);

app.listen(PORT, () => {
  console.log(`You are connected! Running on ${PORT}`);
});
