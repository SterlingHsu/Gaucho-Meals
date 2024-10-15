const { sign, verify } = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.secret;

const createTokens = (user) => {
  const accessToken = sign({ _id: user._id }, secret, {});

  return accessToken;
};

const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];

  if (!accessToken)
    return res.status(403).json({ error: "User not authenticated!" });

  try {
    const validToken = verify(accessToken, secret);
    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports = { createTokens, validateToken, verify, secret };
