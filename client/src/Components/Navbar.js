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
        expand="lg"
        className="py-3"
        style={{
          fontFamily: "'Roboto', sans-serif",
          color: "#1a1a1a",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Container fluid className="px-4">
          <Navbar.Brand as={Link} to="/" className="fw-semibold text-dark d-flex align-items-center">
            <img
              src={mapachehat}
              alt=""
              height="28px"
              class="me-2"
            ></img>
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
                  <Nav.Link as={Link} to="/login">
                    <FontAwesomeIcon icon={faSignIn} className="me-2" /> Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/sign-up">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Sign
                    Up
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
