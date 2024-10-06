const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the CORS package
const app = express();

// Import routers
const usersRouter = require("./routes/users.route");
const accountDetailRouter = require("./routes/accountDetail.route");
const authRouter = require("./routes/auth.route");

// Define your allowed origin
const allowedOrigin = "http://localhost:5173";

// Use CORS middleware to allow requests from your frontend
app.use(cors({
    origin: allowedOrigin, // Allow only this origin
    credentials: true,     // Allow credentials (cookies, authorization headers)
}));

// Middleware to parse JSON requests
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Define routes
app.use("/users", usersRouter);
app.use("/accountDetails", accountDetailRouter);
app.use("/auth", authRouter);

// Optional: A basic health check route
app.get("/", (req, res) => {
  res.send("API is running!");
});

// Export the app
module.exports = app;
