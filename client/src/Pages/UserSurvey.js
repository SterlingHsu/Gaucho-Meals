import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Static/Styles/styles.css";

const UserSurvey = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.API_URL;

  const [nutritionGoal, setNutritionGoal] = useState("");
  const [dietaryRestriction, setDietaryRestriction] = useState("");
  const [dailyCaloricIntake, setDailyCaloricIntake] = useState("");
  const [clickedNutritionButton, setClickedNutritionButton] = useState(null);
  const [clickedDietButton, setClickedDietButton] = useState(null);

  const handleDietButtonClick = (answer, index) => {
    setDietaryRestriction(answer);
    setClickedDietButton(index);
  };

  const handleNutritionButtonClick = (answer, index) => {
    setNutritionGoal(answer);
    setClickedNutritionButton(index);
  };

  const submit = (e) => {
    e.preventDefault();
    console.log("Submitting form with state values:");
    console.log("Nutrition Goal:", nutritionGoal);
    console.log("Dietary Restriction:", dietaryRestriction);
    console.log("Daily Caloric Intake:", dailyCaloricIntake);

    axios
      .post(`${apiUrl}/user-survey`, {
        nutritionGoal,
        dietaryRestriction,
        dailyCaloricIntake,
      })
      .then((res) => {
        if (res.data === "Success") {
          navigate("/dining-halls");
          //FIXME: Change error statements and messages
        } else if (res.data === "The email or password is incorrect") {
          alert("The email or password is incorrect. Please try again");
        } else if (
          res.data ===
          "The provided email is not associated with an existing user"
        ) {
          alert("The provided email is not associated with an existing user");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log("Current State Values:", {
    nutritionGoal,
    dietaryRestriction,
    dailyCaloricIntake,
    clickedNutritionButton,
    clickedDietButton,
  });

  return (
    <div class="d-flex flex-column vh-100">
      <div class="d-flex flex-grow-1 flex-column align-items-center justify-content-center">
        <div class="">
          <p class="body-text2">
            It's nice to meet you! Start supporting your nutrition goals by
            telling us a little bit about you.
          </p>
        </div>
        <form method="POST" class="border border-secondary-subtle p-4">
          <div class="">
            <label for="nutrition-goal" class="body-text2">
              What's your nutrition goal?
            </label>
            <div class=" mb-2">
              <button
                type="button"
                class={`btn btn-${
                  clickedNutritionButton === 0 ? "success" : "primary"
                } w-100 mb-2 me-2`}
                onClick={() => {
                  handleNutritionButtonClick("Lose weight", 0);
                }}
              >
                Lose weight
              </button>
              <button
                type="button"
                class={`btn btn-${
                  clickedNutritionButton === 1 ? "success" : "primary"
                } w-100 mb-2`}
                onClick={() => {
                  handleNutritionButtonClick("Gain weight", 1);
                }}
              >
                Gain weight
              </button>
            </div>
            <div class=" mb-2">
              <button
                type="button"
                class={`btn btn-${
                  clickedNutritionButton === 2 ? "success" : "primary"
                } w-100 mb-2 me-2`}
                onClick={() => {
                  handleNutritionButtonClick("Maintain weight", 2);
                }}
              >
                Maintain weight
              </button>
              <button
                type="button"
                class={`btn btn-${
                  clickedNutritionButton === 3 ? "success" : "primary"
                } w-100 mb-2`}
                onClick={() => {
                  handleNutritionButtonClick("Build muscle", 3);
                }}
              >
                Build muscle
              </button>
            </div>
          </div>
          <div class="">
            <label for="nutrition-goal" class="body-text2">
              Please select if you are any of the following:
            </label>
            <div class="">
              <button
                type="button"
                class={`btn btn-${
                  clickedDietButton === 0 ? "success" : "primary"
                } w-100 mb-2 me-2`}
                onClick={() => {
                  handleDietButtonClick("Vegetarian", 0);
                }}
              >
                Vegetarian
              </button>
              <button
                type="button"
                class={`btn btn-${
                  clickedDietButton === 1 ? "success" : "primary"
                } w-100 mb-2`}
                onClick={() => {
                  handleDietButtonClick("Vegan", 1);
                }}
              >
                Vegan
              </button>
            </div>
            <div class=" mb-2">
              <button
                type="button"
                class={`btn btn-${
                  clickedDietButton === 2 ? "success" : "primary"
                } w-100 mb-2 me-2`}
                onClick={() => {
                  handleDietButtonClick("Can not eat pork products", 2);
                }}
              >
                Can not eat pork products
              </button>
              <button
                type="button"
                class={`btn btn-${
                  clickedDietButton === 3 ? "success" : "primary"
                } w-100 mb-2 `}
                onClick={() => {
                  handleDietButtonClick("Test", 3);
                }}
              >
                Test
              </button>
            </div>
          </div>
          <div class="">
            <label for="nutrition-goal" class="body-text2">
              What is your target daily caloric intake?
            </label>
            <input
              onChange={(e) => {
                setDailyCaloricIntake(e.target.value);
              }}
              class=""
              placeholder="Daily Caloric Intake"
            ></input>
          </div>
          <button class="" type="submit" onClick={submit}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSurvey;
