import React from "react";
import Navbar from "../Components/Navbar";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const Home = () => {
  const [groupedPrimaryItems, setGroupedPrimaryItems] = useState(() => {
    const storedGroupedItems = localStorage.getItem("groupedPrimaryItems");
    return storedGroupedItems ? JSON.parse(storedGroupedItems) : {};
  });

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchPrimaryItems = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/meals/primary-items`, {
        withCredentials: true,
      });
      // console.log(response.data);
      return response.data.primaryItems;
    } catch (err) {
      console.error("Error fetching primary items:", err);
    }
  }, [apiUrl]);

  const groupItems = (items) => {
    const grouped = {};
    items.forEach((hall) => {
      if (!grouped[hall.diningHall]) {
        grouped[hall.diningHall] = {};
      }
      grouped[hall.diningHall][hall.mealTime] = hall.primaryItems;
    });
    return grouped;
  };

  useEffect(() => {
    async function fetchData() {
      const fetchedItems = await fetchPrimaryItems();
      if (fetchedItems) {
        const groupedItems = groupItems(fetchedItems);
        setGroupedPrimaryItems(groupedItems);
        localStorage.setItem(
          "groupedPrimaryItems",
          JSON.stringify(groupedItems)
        );
      }
    }

    fetchData();
  }, [fetchPrimaryItems]);

  return (
    <>
      <div className="d-flex flex-column min-vh-100 overflow-hidden">
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 overflow-auto">
          <div className="container mt-4">
            <div className="row">
              {groupedPrimaryItems &&
                Object.entries(groupedPrimaryItems).map(
                  ([diningHall, meals], index) => (
                    <div key={index} className="col-md-3 mb-4">
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
                                  {items &&
                                    items.map((item, i) => (
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
        </div>
      </div>
    </>
  );
};

export default Home;
