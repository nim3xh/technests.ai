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
const resultRouter = require("./routes/result.route");
const tradeDataRouter = require("./routes/tradedata.route");
const todaystrade = require("./routes/todaystrade.route");

// Define your allowed origin
const allowedOrigin = "http://localhost:5173";

// Use CORS middleware to allow requests from your frontend
app.use(cors({
    origin: allowedOrigin, // Allow only this origin
    credentials: true,     // Allow credentials (cookies, authorization headers)
}));

// //need to allow for all
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     next();
// });

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
app.use("/results", resultRouter);
app.use("/tradeData", tradeDataRouter);
app.use("/todaystrade", todaystrade);


// Optional: A basic health check route
app.get("/", (req, res) => {
  res.send("Welcome to Technest Account Manager API");
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

const timeZone = 'America/Los_Angeles'; // Pacific Standard Time (PST)

const getFormattedTime = () => {
  const now = new Date();
  
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone, // Set to America/Los_Angeles
  }).format(now);

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone, // Set to America/Los_Angeles
  }).format(now);

  // Return formatted date and time separately
  return `${formattedDate} ${formattedTime}`; 
};

// Endpoint to return the current time
app.get('/current-time', (req, res) => {
  const time = getFormattedTime();
  res.json({ time });
});

//for download _EVAL.csv and _PA.csv files relevent to account number from dashboards folder, account number equals to folder name
// Endpoint to download _EVAL.csv and _PA.csv files
app.get('/download/:accountNumber', (req, res) => {
  try {
    const { accountNumber } = req.params;
    console.log(accountNumber);
    
    const dashboardsPath = path.join(__dirname, 'dashboards', accountNumber);
    
    console.log(`Checking for files for account number ${accountNumber} in folder:`);
     // Check if the folder exists
    if (!fs.existsSync(dashboardsPath)) {
      return res.status(404).send(`No folder found for account number ${accountNumber}.`);
    }

    // Find the relevant files in the folder
    const files = fs.readdirSync(dashboardsPath).filter((file) =>
      file.endsWith('_EVAL.csv') || file.endsWith('_PA.csv')
    );

    if (files.length === 0) {
      return res.status(404).send(`No _EVAL.csv or _PA.csv files found for account number ${accountNumber}.`);
    }

    // Serve multiple files as a ZIP for download
    const archiver = require('archiver'); // Ensure `archiver` is installed

    const zipFileName = `${accountNumber}_files.zip`;
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });

    // Handle archive stream errors
    archive.on('error', (err) => {
      console.error('Error creating ZIP archive:', err);
      res.status(500).send('Failed to create ZIP file.');
    });

    // Pipe archive data to the response
    archive.pipe(res);

    // Add files to the archive
    files.forEach((file) => {
      const filePath = path.join(dashboardsPath, file);
      archive.file(filePath, { name: file });
    });

    // Finalize the archive
    archive.finalize();
  } catch (error) {
    console.error(`Error while downloading files for account number ${req.params.accountNumber}:`, error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

// Endpoint to append input to a file
app.post('/alert-hook', (req, res) => {
  try {
    const dashboardsPath = path.join(__dirname, 'dashboards', 'test');
    const filePath = path.join(dashboardsPath, 'test.txt');

    // Ensure the test folder exists
    if (!fs.existsSync(dashboardsPath)) {
      fs.mkdirSync(dashboardsPath, { recursive: true });
    }

    // Prepare the input data with a newline
    const inputData = JSON.stringify(req.body) + '\n';

    // Append the input data to the file
    fs.appendFileSync(filePath, inputData);

    console.log('Data appended to file:', inputData.trim());
    res.status(200).send('Data appended successfully.');
  } catch (error) {
    console.error('Error appending data:', error);
    res.status(500).send('Failed to append data.');
  }
});


// Catch-all route to handle SPA (Single Page Application) routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export the app
module.exports = app;