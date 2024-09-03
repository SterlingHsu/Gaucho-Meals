import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Components/Navbar";

const Login = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    console.log("Submit login");
    e.preventDefault();
    axios
      .post(
        `${apiUrl}/api/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data === "Success") {
          console.log("Login success");
          navigate("/");
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
        console.log("Error response:", err.response);
      });
  };

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1 flex-column align-items-center justify-content-center">
        <form
          method="POST"
          className="border border-secondary-subtle p-4 rounded shadow-sm"
        >
          <h3 align="left">Log In</h3>
          <div className="mb-3">
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

          <div className="mb-3">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Enter password"
              autoComplete="current-password"
              required
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <br />
            <button type="submit" className="btn btn-primary" onClick={submit}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
