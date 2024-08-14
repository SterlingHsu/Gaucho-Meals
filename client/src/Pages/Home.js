import Navbar from "../Components/Navbar";

const Home = () => {
  return (
      <div className="d-flex flex-column vh-100">
        <Navbar />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <p className="fs-1 fw-bold"> Welcome to the UC Meal Planner 🧑‍🍳👋 </p>
            <p>
              {" "}
              We're the home of California's healthiest nutrition nuts — and
              we're glad you're here!
            </p>
          </div>
        </div>
      </div>
  );
};

export default Home;
