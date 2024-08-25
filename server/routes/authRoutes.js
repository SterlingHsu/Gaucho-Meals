const express = require("express");
const bcrypt = require("bcrypt");
const UserModel = require("../models/Users");
const { createTokens, validateToken } = require("../JWT");

const router = express.Router();

router.get("/check", validateToken, (req, res) => {
  res.status(200).json({ authenticated: true });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) {
      return res.json(
        "The provided email is not associated with an existing user"
      );
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.json("The email or password is incorrect");
    }

    const accessToken = createTokens(existingUser);
    res.cookie("access-token", accessToken, {
      maxAge: 604800000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    return res.json("Success");
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ error: "An error occured during login", details: error.message });
  }
});

router.post("/sign-up", async (req, res) => {
  const { firstName, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.json("Passwords Do Not Match");
  }

  try {
    const existingUser = await UserModel.findOne({ email: email });

    if (existingUser) {
      return res.json("User Already Exists");
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new UserModel({
      firstName: firstName,
      email: email,
      password: hash,
    });

    await user.save();

    const accessToken = createTokens(user);
    res.cookie("access-token", accessToken, {
      maxAge: 604800000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.json("Successfully Signed Up User");
  } catch (error) {
    console.error("Sign-up error:", error);
    return res.status(500).json("An error occured during sign-up");
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie("access-token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;
