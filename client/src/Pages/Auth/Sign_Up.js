import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import Navbar from "../../Components/Navbar";
import "../../Static/Styles/styles.css";
import validator from "validator";
import zxcvbn from "zxcvbn";

const Signup = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  console.log(apiUrl)

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(zxcvbn(newPassword).score);
  };

  const submit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!email || !password || !confirmPassword || !firstName) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validator.isEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (passwordStrength < 2) {
      setError("Please choose a stronger password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    Axios.post(
      `${apiUrl}/api/auth/sign-up`,
      {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        firstName: firstName,
      },
      { withCredentials: true }
    )
      .then((res) => {
        if (res.data === "User Already Exists") {
          setError(
            "These credentials are already associated with an existing account."
          );
        } else if (res.data === "Successfully Signed Up User") {
          navigate("/");
        }
      })
      .catch((e) => {
        setError("An error occurred. Please try again.");
        console.log(e);
      });
  };

  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1 flex-column align-items-center justify-content-center">
        <form className="border border-secondary-subtle p-4 rounded shadow-sm">
          <h3 align="center">Sign Up</h3>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <div className="mb-2">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setFirstName(e.target.value)}
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
              onChange={handlePasswordChange}
            />
            {password && (
              <small className="form-text text-muted">
                Password strength:{" "}
                {
                  ["Very weak", "Weak", "Fair", "Strong", "Very strong"][
                    passwordStrength
                  ]
                }
              </small>
            )}
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
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <br />
          <button type="submit" onClick={submit} className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
