import Masonry from "react-masonry-css";

const MenuItems = ({
  getCategorizedItems,
  addItemToCalculator,
  showIngredients,
  isMealSaved,
}) => {
  const breakpointColumnsObj = {
    default: 3,
    992: 2,
    768: 1,
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
          {category.items.map((item) => (
            <div key={item.name} className="card mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
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
