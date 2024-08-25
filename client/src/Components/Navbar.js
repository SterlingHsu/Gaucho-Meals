import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faCalendarAlt,
  faSignIn,
  faUserPlus,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import mapachehat from "../Static/img/mapachehat.png";

const MainNavbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return JSON.parse(localStorage.getItem("isAuthenticated")) || false;
  });
  // Store in local storage to prevent screen-tearing as the auth state is being determined
  // Crude fix, consider an improvement

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
        localStorage.setItem(
          "isAuthenticated",
          JSON.stringify(data.authenticated)
        );
      } else {
        setIsAuthenticated(false);
        localStorage.setItem("isAuthenticated", "false");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      localStorage.setItem("isAuthenticated", "false");
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
        localStorage.clear();
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
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
        rel="stylesheet"
      />
      <Navbar
        expand="lg"
        className="py-3"
        style={{
          fontFamily: "'Roboto', sans-serif",
          color: "#1a1a1a",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Container fluid className="px-4">
          <Navbar.Brand
            as={Link}
            to="/"
            className="fw-bold text-dark d-flex align-items-center"
          >
            <img src={mapachehat} alt="" height="28px" className="me-2"></img>
            Gaucho Meals
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar">
            <Nav className="ms-auto">
              {isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/meal-planner">
                    <FontAwesomeIcon icon={faUtensils} className="me-2" /> Meal
                    Planner
                  </Nav.Link>
                  <Nav.Link as={Link} to="/saved-meals">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />{" "}
                    Planned Meals
                  </Nav.Link>
                  <Nav.Link onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />{" "}
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="me-2">
                    <FontAwesomeIcon icon={faSignIn} className="me-2" /> Login
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/sign-up"
                    className="px-2"
                    style={{
                      width: "max-content",
                      backgroundColor: "#00FF00",
                      borderRadius: "10px",
                    }}
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Sign Up
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default MainNavbar;
