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
      columnClassName="my-masonry-grid-column"
    >
      {getCategorizedItems.map((category, index) => (
        <div key={index} className="col">
          <h4>{category.category}</h4>
          {category.items.map((item) => (
            <div key={item.name} className="menu-item card mb-3">
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">
                  Calories: {item.nutritionalInfo.Calories} | Protein:{" "}
                  {item.nutritionalInfo.Protein} | Fat:{" "}
                  {item.nutritionalInfo["Total Fat"]} | Carbs:{" "}
                  {item.nutritionalInfo["Total Carbohydrate"]}
                </p>
                {!isMealSaved && (
                  <div className="mt-2 d-flex justify-content-between">
                    <button
                      className="btn btn-primary"
                      onClick={() => addItemToCalculator(item.name)}
                    >
                      Add
                    </button>
                    <button
                      className="btn btn-transparent border"
                      onClick={() => showIngredients(item)}
                    >
                      View Ingredients
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
