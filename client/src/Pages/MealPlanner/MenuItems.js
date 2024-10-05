import React, { useState } from "react";
import Masonry from "react-masonry-css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faThumbsDown,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

const MenuItems = ({
  getCategorizedItems,
  addItemToCalculator,
  showIngredients,
  isMealSaved,
  saveVote,
  userVotes,
  dietaryPreferences,
  selectedDiningHall,
  selectedDay,
  selectedMealTime,
}) => {
  const [animations, setAnimations] = useState({});

  const breakpointColumnsObj = {
    default: 3,
    992: 2,
    768: 1,
  };

  const getButtonClass = (itemId, isUpvote) => {
    const vote = userVotes[itemId];
    if (isUpvote) {
      return vote === "positive" ? "btn-success" : "btn-outline-success";
    } else {
      return vote === "negative" ? "btn-danger" : "btn-outline-danger";
    }
  };

  const handleAddItem = (item, event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const buttonCenter = rect.left + rect.width * (1 / 4);

    const animationId = `${item._id}-${Date.now()}`;

    setAnimations((prev) => ({
      ...prev,
      [animationId]: {
        top: rect.top,
        left: buttonCenter,
      },
    }));

    setTimeout(() => {
      setAnimations((prev) => {
        const newAnimations = { ...prev };
        delete newAnimations[animationId];
        return newAnimations;
      });
    }, 1000);

    addItemToCalculator(item);
  };

  const toggleVote = (e, itemId) => {
    const storedVote = userVotes[itemId];
    const clickedButton = e.currentTarget;
    const newVoteType = clickedButton.classList.contains("vote-up")
      ? "positive"
      : "negative";

    let voteValue;
    if (storedVote) {
      if (storedVote === "positive") {
        storedVote === newVoteType ? (voteValue = -1) : (voteValue = -2);
      } else {
        storedVote === newVoteType ? (voteValue = 1) : (voteValue = 2);
      }
    } else {
      newVoteType === "positive" ? (voteValue = 1) : (voteValue = -1);
    }

    saveVote(
      itemId,
      newVoteType,
      voteValue,
      selectedDay,
      selectedDiningHall,
      selectedMealTime
    );
  };

  const filterItemsByPreferences = (item) => {
    if (dietaryPreferences.length === 0) return true;

    const noSeedOils =
      !dietaryPreferences.includes("No Seed Oils") ||
      !item.nutritionalInfo.hasSeedOils;
    const noPreservatives =
      !dietaryPreferences.includes("No Preservatives") ||
      !item.nutritionalInfo.hasPreservatives;
    const noGums =
      !dietaryPreferences.includes("No Gums") || !item.nutritionalInfo.hasGums;
    const isVegetarian =
      !dietaryPreferences.includes("Vegetarian") ||
      item.nutritionalInfo.isVegetarian ||
      item.nutritionalInfo.isVegan;
    const isVegan =
      !dietaryPreferences.includes("Vegan") || item.nutritionalInfo.isVegan;

    return noSeedOils && noPreservatives && noGums && isVegetarian && isVegan;
  };

  return (
    <>
      <style>{`
        .my-masonry-grid {
          display: flex;
          margin-left: -15px;
          width: auto;
        }

        .my-masonry-grid_column {
          padding-left: 15px;
          background-clip: padding-box;
        }

        .floating-plus {
          position: fixed;
          pointer-events: none;
          color: #28a745;
          font-weight: bold;
          z-index: 1000;
          animation: floatAndFade 1s ease-out forwards;
        }

        @keyframes floatAndFade {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-35px);
            opacity: 0;
          }
        }

        @media (max-width: 992px) {
          .my-masonry-grid {
            margin-left: -10px;
          }
          .my-masonry-grid_column {
            padding-left: 10px;
          }
        }

        @media (max-width: 768px) {
          .my-masonry-grid {
            margin-left: 0;
          }
          .my-masonry-grid_column {
            padding-left: 0;
          }
        }
      `}</style>

      {Object.entries(animations).map(([id, position]) => (
        <div
          key={id}
          className="floating-plus"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          +1
        </div>
      ))}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {selectedDay &&
          selectedMealTime &&
          getCategorizedItems.map((category, index) => (
            <div key={index} className="mb-4">
              <h4 className="mb-3">{category.category}</h4>
              {category.items.filter(filterItemsByPreferences).map((item) => (
                <div key={item.name} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title mb-0">
                        {item.netRating > 30 && (
                          <FontAwesomeIcon
                            icon={faHeart}
                            className="text-danger me-2"
                          />
                        )}
                        {item.netRating < -30 && (
                          <FontAwesomeIcon
                            icon={faThumbsDown}
                            className="text-primary me-2"
                          />
                        )}
                        {item.name}
                      </h5>
                      <div className="d-flex align-items-center vote-container">
                        <button
                          className={`btn btn-sm mx-1 vote-up ${getButtonClass(
                            item._id,
                            true
                          )}`}
                          onClick={(e) => toggleVote(e, item._id)}
                        >
                          <FontAwesomeIcon icon={faThumbsUp} />
                        </button>
                        <button
                          className={`btn btn-sm mx-1 vote-down ${getButtonClass(
                            item._id,
                            false
                          )}`}
                          onClick={(e) => toggleVote(e, item._id)}
                        >
                          <FontAwesomeIcon icon={faThumbsDown} />
                        </button>
                      </div>
                    </div>
                    <p className="card-text">
                      <small>
                        Calories: {item.nutritionalInfo.Calories} | Protein:{" "}
                        {item.nutritionalInfo.Protein} | Fat:{" "}
                        {item.nutritionalInfo["Total Fat"]} | Carbs:{" "}
                        {item.nutritionalInfo["Total Carbohydrate"]}
                      </small>
                    </p>
                    {!isMealSaved && (
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => showIngredients(item)}
                        >
                          View Ingredients
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) => handleAddItem(item, e)}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </Masonry>
    </>
  );
};

export default React.memo(MenuItems);
