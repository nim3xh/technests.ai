const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the CORS package
const app = express();
const fs = require("fs");
const path = require("path");

app.use(express.static('dist'))

// Import routers
const usersRouter = require("./routes/users.route");
const accountDetailRouter = require("./routes/accountDetail.route");
const authRouter = require("./routes/auth.route");
const userCredentialsRouter = require("./routes/userCredentials.route");
const tradeRouter = require("./routes/trade.route");
const tradeTypeRouter = require("./routes/tradetype.route");

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
app.use("/userCredentials", userCredentialsRouter);
app.use("/trades", tradeRouter);
app.use("/tradeType", tradeTypeRouter);


// Optional: A basic health check route
app.get("/", (req, res) => {
  res.send("API is running!");
});


app.get('/file-creation-time', async (req, res) => {
  try {
    const dashboardsPath = path.join(__dirname, 'dashboards');
    console.log("Checking if dashboards folder exists:", fs.existsSync(dashboardsPath));

    if (!fs.existsSync(dashboardsPath)) {
      return res.status(404).send("Dashboards folder not found.");
    }

    const apexidFolders = fs.readdirSync(dashboardsPath).filter((item) =>
      fs.statSync(path.join(dashboardsPath, item)).isDirectory()
    );
    console.log("Apexid folders found:", apexidFolders);

    if (apexidFolders.length === 0) {
      return res.status(404).send("No apexid folders found.");
    }

    const allFileDetails = [];
    for (const apexid of apexidFolders) {
      const folderPath = path.join(dashboardsPath, apexid);
      const files = fs.readdirSync(folderPath);

      console.log(`Files in folder ${apexid}:`, files);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        allFileDetails.push({
          apexid: apexid,
          fileName: file,
          createdAt: stats.birthtime.toISOString(),
        });
      }
    }

    if (allFileDetails.length === 0) {
      return res.status(404).send("No files found in any apexid folder.");
    }

    res.status(200).json(allFileDetails);
  } catch (error) {
    console.error('Error fetching file creation times:', error);
    res.status(500).send('Failed to retrieve file creation times.');
  }
});

// Helper function to get the current formatted time
const getFormattedTime = () => {
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  }).format(now);

  // Return formatted date and time separately
  return `${formattedDate} ${formattedTime}`; // This should return a string like "November 30, 2024 12:48 PM"
};

// Endpoint to return the current time
app.get('/current-time', (req, res) => {
  const time = getFormattedTime();
  res.json({ time });
});

// Catch-all route to handle SPA (Single Page Application) routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export the app
module.exports = app;
