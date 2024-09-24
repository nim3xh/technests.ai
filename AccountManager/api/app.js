const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the CORS package
const app = express();

// Import routers
const usersRouter = require("./routes/users.route");
const accountDetailRouter = require("./routes/accountDetail.route");

// Use CORS middleware to allow requests from your frontend
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
  })
);

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Define routes
app.use("/users", usersRouter);
app.use("/accountDetails", accountDetailRouter);

// Optional: A basic health check route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Export the app
module.exports = app;
