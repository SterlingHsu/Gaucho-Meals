import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import Navbar from "../../Components/Navbar";
import "../../Static/Styles/styles.css";

const Signup = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");

  const submit = (e) => {
    //TODO: Add error checking for invalid sign-up arguments
    e.preventDefault();

    if (!email || !password || !confirmPassword || !firstName) {
      alert("Please fill in all fields.");
      return;
    }

    Axios.post(`${apiUrl}/api/auth/sign-up`, {
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      firstName: firstName,
    }, { withCredentials: true })
      .then((res) => {
        if (res.data === "User Already Exists") {
          alert(
            "These credentials are already associated with an existing account."
          );
        } else if (res.data === "Passwords Do Not Match") {
          alert("Passwords do not match. Please try again.");
        } else if (res.data === "Successfully Signed Up User") {
          navigate("/meal-planner");
        }
      })
      .catch((e) => {
        alert("An error occured. Please try again.");
        console.log(e);
      });
  };

  return (
    <body className="d-flex flex-column vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1 flex-column align-items-center justify-content-center">
        <form className="border border-secondary-subtle p-4 rounded">
          <h3 align="center">Sign Up</h3>
          <div className="mb-2">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>

          <div className="mb-2">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              placeholder="Enter first name"
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password1">Password</label>
            <input
              type="password"
              className="form-control"
              id="password1"
              name="password1"
              placeholder="Enter password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Password (Confirm)</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm password"
              autoComplete="new-password"
              required
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
          </div>
          <br />
          <button type="submit" onClick={submit} className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </body>
  );
};

export default Signup;
