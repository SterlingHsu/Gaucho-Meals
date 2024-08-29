import React from "react";
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
  dietaryPreferences
}) => {
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

  const toggleVote = (e, itemId) => {
    const storedVote = userVotes[itemId];

    const clickedButton = e.currentTarget;
    const newVoteType = clickedButton.classList.contains("vote-up")
      ? "positive"
      : "negative";

    let voteValue;
    if (storedVote) {
      // Ex. If going from positive to negative, we need to decrease the rating by 2 to account for the existing positive vote
      if (storedVote === "positive") {
        storedVote === newVoteType ? (voteValue = -1) : (voteValue = -2);
      } else {
        storedVote === newVoteType ? (voteValue = 1) : (voteValue = 2);
      }
    } else {
      newVoteType === "positive" ? (voteValue = 1) : (voteValue = -1);
    }

    saveVote(itemId, newVoteType, voteValue);
  };

  const filterItemsByPreferences = (item) => {
    if (dietaryPreferences.length === 0) return true;
    
    const noSeedOils = !dietaryPreferences.includes("No Seed Oils") || item.nutritionalInfo.noSeedOils;
    const noPreservatives = !dietaryPreferences.includes("No Preservatives") || item.nutritionalInfo.noPreservatives;
    
    return noSeedOils && noPreservatives;
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {getCategorizedItems.map((category, index) => (
        <div key={index} className="mb-4">
          <h4 className="mb-3">{category.category}</h4>
          {category.items.filter(filterItemsByPreferences).map((item) => (
            <div key={item.name} className="card mb-3 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">
                    {item.netRating > 20 && (
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-danger me-2"
                      />
                    )}
                    {item.netRating < -20 && (
                      <FontAwesomeIcon
                        icon={faThumbsDown}
                        className="text-primary me-2 tooltip"
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
                      onClick={() => addItemToCalculator(item.name)}
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
  );
};

export { MenuItems };
