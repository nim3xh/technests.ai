const jwt = require("jsonwebtoken");
const { errorHandler } = require("./error");
const dotenv = require("dotenv");

dotenv.config();

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization; // Get Authorization header
  const token = authHeader && authHeader.split(" ")[1]; // Extract token if header exists
  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized x",
      });
    }
    req.user = user; // Attach the user object to the request
    next(); // Proceed to the next middleware
  });
}

module.exports = verifyToken;
