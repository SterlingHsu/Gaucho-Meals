import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import {
  FaHome,
  FaUtensils,
  FaCalendarAlt,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from "react-icons/fa";

const MainNavbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/check`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setIsAuthenticated(false);
        navigate("/");
      } else {
        const errorData = await response.json();
        console.error("Logout failed:", errorData.message);
      }
    } catch (error) {
      console.error("Error occured during logout:", error);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <Navbar
        className="navbar navbar-expand-lg px-2"
        style={{
          backgroundColor: "#1fd655",
          fontFamily: "'Roboto', sans-serif",
          color: "#1a1a1a",
        }}
      >
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbar">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className="nav-link ml-3 fw-semibold text-dark"
                id="home"
                to="/"
              >
                <FaHome className="me-2" /> The UC Meal Planner
              </Link>
            </li>
          </ul>
        </div>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbar"
        >
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" id="login" to="/meal-planner">
                    <FaUtensils className="me-2" /> Meal Planner
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" id="login" to="/saved-meals">
                    <FaCalendarAlt className="me-2" /> Planned Meals
                  </Link>
                </li>
                <li className="nav-item mr-3">
                  <button
                    className="nav-link btn btn-link"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" id="login" to="/login">
                    <FaSignInAlt className="me-2" /> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" id="sign-up" to="/sign-up">
                    <FaUserPlus className="me-2" /> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </Navbar>
    </>
  );
};

export default MainNavbar;
