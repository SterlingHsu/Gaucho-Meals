import React from "react";
import Navbar from "../Components/Navbar";
import { checkAuthStatus } from "../Utils/checkAuthStatus";
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import mapacheHello from "../Static/img/mapachehello.png";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return JSON.parse(localStorage.getItem("isAuthenticated")) || false;
  });
  // Store in local storage to prevent screen-tearing as the auth state is being determined
  // Crude fix, consider an improvement

  const [primaryItems, setPrimaryItems] = useState([]);

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchPrimaryItems = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/meals/primary-items`, {
        withCredentials: true,
      });
      console.log(response.data);
      setPrimaryItems(response.data.primaryItems);
    } catch (err) {
      console.error("Error fetching primary items:", err);
    }
  }, [apiUrl]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authStatus = await checkAuthStatus();
        setIsAuthenticated(authStatus);
        localStorage.setItem("isAuthenticated", JSON.stringify(authStatus));

        if (authStatus) {
          await fetchPrimaryItems();
        }
      } catch (error) {
        console.error("Error during authentication check:", error);
      }
    };

    verifyAuth();
  }, [fetchPrimaryItems]);

  const groupedPrimaryItems = useMemo(() => {
    const grouped = {};
    primaryItems.forEach((item) => {
      if (!grouped[item.diningHall]) {
        grouped[item.diningHall] = {};
      }
      grouped[item.diningHall][item.mealTime] = item.primaryItems;
    });
    return grouped;
  }, [primaryItems]);

  return (
    <>
      <Navbar />
      {isAuthenticated ? (
        <div className="container mt-4">
          <div className="row">
            {Object.entries(groupedPrimaryItems).map(
              ([diningHall, meals], index) => (
                <div key={index} className="col-md-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{diningHall}</h5>
                      {Object.entries(meals).map(
                        ([mealTime, items], mealIndex) => (
                          <div key={mealIndex} className="mb-3">
                            <h6 className="card-subtitle mb-2 text-muted text-capitalize">
                              {mealTime}
                            </h6>
                            <div className="d-flex flex-wrap">
                              {items.map((item, i) => (
                                <span
                                  key={i}
                                  className="badge bg-light text-dark me-2 mb-2"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <img src={mapacheHello} alt="" height="500" width="500"></img>
            <p className="fs-1 fw-bold"> Welcome to Gaucho Meals 🧑‍🍳👋 </p>
            <p>
              {" "}
              We're the home of California's healthiest nutrition nuts — and
              we're glad you're here!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
