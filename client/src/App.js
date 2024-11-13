import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./Pages/Auth/ProtectedRoute";
import Login from "./Pages/Auth/Log_In";
import Signup from "./Pages/Auth/Sign_Up";
import Home from "./Pages/Home";
import NoPage from "./Pages/NoPage";
import ForbiddenPage from "./Pages/ForbiddenPage";
import MealPlanner from "./Pages/MealPlanner/MealPlanner";
import SavedMeals from "./Pages/SavedMeals/SavedMeals";

export default function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<Signup />} />
      <Route
        path="/meal-planner"
        element={
          <ProtectedRoute>
            <MealPlanner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-meals"
        element={
          <ProtectedRoute>
            <SavedMeals />
          </ProtectedRoute>
        }
      />
      <Route path="/forbidden-page" element={<ForbiddenPage />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
}
