const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors"); // Import the CORS package
const app = express();
const fs = require("fs");
const path = require("path");
const csv = require('csv-parser');

const Stripe = require("stripe");
require("dotenv").config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

// app.get("/api/download-drmarkets", (req, res) => {
//   try {
//     const dllPath = path.resolve(__dirname, "dll", "DrMarkets.dll"); // api/dll/DrMarkets.dll

//     if (!fs.existsSync(dllPath)) {
//       return res.status(404).send("DrMarkets.dll not found");
//     }

//     // Send as attachment
//     res.download(dllPath, "DrMarkets.dll", (err) => {
//       if (err) {
//         console.error("[download-drmarkets] Error:", err);
//         if (!res.headersSent) res.status(500).send("Error downloading DrMarkets.dll");
//       }
//     });
//   } catch (e) {
//     console.error("[download-drmarkets] Unexpected error:", e);
//     res.status(500).send("Internal server error");
//   }
// });

// // Download TradeRx.zip
// app.get("/api/download-traderx", (req, res) => {
//   try {
//     const zipPath = path.resolve(__dirname, "dll", "TradeRx.zip"); // api/dll/TradeRx.zip

//     if (!fs.existsSync(zipPath)) {
//       return res.status(404).send("TradeRx.zip not found");
//     }

//     res.download(zipPath, "TradeRx.zip", (err) => {
//       if (err) {
//         console.error("[download-traderx] Error:", err);
//         if (!res.headersSent) res.status(500).send("Error downloading TradeRx.zip");
//       }
//     });
//   } catch (e) {
//     console.error("[download-traderx] Unexpected error:", e);
//     res.status(500).send("Internal server error");
//   }
// });


app.get("/download/proptraderpro", (req, res) => {
  const filePath = path.resolve(__dirname, "dll", "indicator.zip");
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }
  res.download(filePath, "indicator.zip");
});

// ---------------- PRODUCT DOWNLOADS ----------------

// Exact product names (same as folders)
const PRODUCT_NAMES = [
  "Prop Trade Planner - Dr.Markets",
  "TradeRx",
  "JournalX",
  "TradeCam",
  "Trade Video Recorder",
  "Regular Updates",
  "White-Glove Prop Trading Environment Setup",
  "Custom Strategy Development (Advisory)",
  "One-on-one Prop Firm Journey Coaching",
  "Prop Trade Planner Dr.Markets Trial",
  "TradeRx - Trial",
  "JournalX Trial",
  "TradeCam Trial",
  "Trade Video Recorder Trial",
  "Core Bundle Trial — Planner + TradeRx + JournalX",
  "Core Bundle — Planner + TradeRx + JournalX",
];

// GET /download/:productName
app.get("/download/:productName", (req, res) => {
  const requested = req.params.productName;

  // Find an exact match (case-insensitive)
  const match = PRODUCT_NAMES.find(
    (name) => name.toLowerCase() === requested.toLowerCase()
  );

  if (!match) {
    return res
      .status(404)
      .send("Invalid product name. Please use an exact name.");
  }

  const folderPath = path.resolve(__dirname, "products", match);
  const filePath = path.join(folderPath, `${match}.zip`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found.");
  }

  res.download(filePath, `${match}.zip`);
});


// app.get("/stripe/subscription-status", async (req, res) => {
//   const { email } = req.query;

//   if (!email) {
//     return res.status(400).json({ success: false, message: "Email is required." });
//   }

//   try {
//     // Search for customers by email
//     const customers = await stripe.customers.list({
//       email,
//       limit: 1,
//     });

//     if (customers.data.length === 0) {
//       return res.status(404).json({ success: false, message: "Customer not found." });
//     }

//     const customer = customers.data[0];

//     // List subscriptions for the customer
//     const subscriptions = await stripe.subscriptions.list({
//       customer: customer.id,
//       status: "all",
//       limit: 10,
//     });

//     const activeSubscription = subscriptions.data.find(
//       (sub) => sub.status === "active" || sub.status === "trialing"
//     );

//     if (!activeSubscription) {
//       return res.status(200).json({
//         success: false,
//         message: "No active subscription found.",
//       });
//     }

//     const item = activeSubscription.items.data[0];
//     const plan = item?.plan || {};

//     // Get product name (plan nickname)
//     let planNickname = plan.nickname || "N/A";
//     if (plan.product) {
//       try {
//         const product = await stripe.products.retrieve(plan.product);
//         planNickname = product.name || plan.nickname || "N/A";
//       } catch (err) {
//         console.warn(`Failed to retrieve product for plan ${plan.id}: ${err.message}`);
//       }
//     }

//     return res.status(200).json({
//       customer_id: customer.id,
//       email: customer.email,
//       subscription_id: activeSubscription.id,
//       status: activeSubscription.status,
//       subscription_start_date: activeSubscription.start_date
//         ? new Date(activeSubscription.start_date * 1000).toISOString()
//         : "N/A",
//       current_period_start: item?.current_period_start
//         ? new Date(item.current_period_start * 1000).toISOString()
//         : "N/A",
//       current_period_end: item?.current_period_end
//         ? new Date(item.current_period_end * 1000).toISOString()
//         : "N/A",
//       plan_id: plan.id || "N/A",
//       plan_nickname: planNickname,
//       plan_amount:
//         plan.amount !== undefined ? (plan.amount / 100).toFixed(2) : "N/A",
//       currency: plan.currency || "N/A",
//     });
//   } catch (error) {
//     console.error("Error checking subscription status:", error.message);
//     return res.status(500).json({ success: false, message: "Internal server error." });
//   }
// });


// Permanent whitelist emails
const PERMANENT_EMAILS = [
  "Sachin.techpro@gmail.com"
];

// Temporary whitelist emails (valid until Dec 31, 2025)
const TEMPORARY_EMAILS = [
  "amaribelgaum@gmail.com",
  "rajitthetrader@gmail.com",
  "kirankgururaj@gmail.com",
  "umesh24trading@gmail.com",
  "josephreddy2024@gmail.com",
  "nishlionking@gmail.com",
  "reuviethetrader@gmail.com",
  "manoyennam@gmail.com",
  "sindhushivalik@gmail.com",
  "aktradingmillion@gmail.com",
  "anantbelgaum@gmail.com"
];

const TEMPORARY_EXPIRATION = new Date('2025-12-31T23:59:59');

// Helper function to check if email is whitelisted
function isWhitelistedEmail(email) {
  const emailLower = email.toLowerCase();
  
  // Check permanent emails
  if (PERMANENT_EMAILS.map(e => e.toLowerCase()).includes(emailLower)) {
    return { whitelisted: true, isTemporary: false };
  }
  
  // Check temporary emails with expiration
  if (TEMPORARY_EMAILS.map(e => e.toLowerCase()).includes(emailLower)) {
    const now = new Date();
    if (now <= TEMPORARY_EXPIRATION) {
      return { whitelisted: true, isTemporary: true };
    }
  }
  
  return { whitelisted: false, isTemporary: false };
}


// Helper to build the hardcoded payload
function makeHardcodedResponse(email, isTemporary = false) {
  const now = new Date();
  const currentDateTime = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    timeZone: "America/New_York", // Eastern Standard Time
  }).format(now);

  // Use Dec 31, 2025 as end date for temporary emails
  const endDate = isTemporary 
    ? "2025-12-31T23:59:59.000Z" 
    : "2025-09-01T08:00:00.000Z";

  return {
    customer_id: "cus_TEST123456789",
    email,
    subscription_id: "sub_TEST987654321",
    status: "active",
    subscription_start_date: "2025-01-15T08:00:00.000Z",
    current_period_start: "2025-08-01T08:00:00.000Z",
    current_period_end: endDate,
    plan_id: "price_TEST001",
    plan_amount: "499.00",
    currency: "usd",
    current_time: currentDateTime,
  };
}

app.get("/stripe/subscription-status", async (req, res) => {
  const rawEmail = (req.query.email || "").toString().trim();
  if (!rawEmail) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  // 1) Hardcoded responses for whitelisted emails
  const whitelistCheck = isWhitelistedEmail(rawEmail);
  if (whitelistCheck.whitelisted) {
    return res.status(200).json(makeHardcodedResponse(rawEmail, whitelistCheck.isTemporary));
  }

  // 2) Otherwise, do the normal Stripe lookup
  try {
    const customers = await stripe.customers.list({ email: rawEmail, limit: 1 });
    if (customers.data.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const customer = customers.data[0];
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
    });

    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSubscription) {
      return res.status(200).json({
        success: false,
        message: "No active subscription found.",
      });
    }

    const item = activeSubscription.items.data[0];
    const plan = item?.plan || {};

    // Get current date and time in Eastern Standard Time
    const now = new Date();
    const currentDateTime = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZone: "America/New_York", // Eastern Standard Time
    }).format(now);

    return res.status(200).json({
      customer_id: customer.id,
      email: customer.email,
      subscription_id: activeSubscription.id,
      status: activeSubscription.status,
      subscription_start_date: activeSubscription.start_date
        ? new Date(activeSubscription.start_date * 1000).toISOString()
        : "N/A",
      // NOTE: current_period_* are on the subscription, not the item
      current_period_start: activeSubscription.current_period_start
        ? new Date(activeSubscription.current_period_start * 1000).toISOString()
        : "N/A",
      current_period_end: activeSubscription.current_period_end
        ? new Date(activeSubscription.current_period_end * 1000).toISOString()
        : "N/A",
      plan_id: plan.id || "N/A",
      plan_amount:
        plan.amount !== undefined ? (plan.amount / 100).toFixed(2) : "N/A",
      currency: plan.currency || "N/A",
      current_time: currentDateTime,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
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

app.get('/download/demo', (req, res) => {
  const filePath = path.join(__dirname, 'upload_sample.csv');  // Absolute path to the file
  const fileName = 'dashboard_data_sample.csv';  // Name of the file for download

  // Set headers for the file download
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
  res.setHeader('Content-Type', 'text/csv');  // Correct MIME type for CSV files

  // Create a read stream for the file and pipe it to the response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  // Handle any file reading errors
  fileStream.on('error', (err) => {
    console.error('Error reading the file:', err);
    res.status(500).send('Failed to read the file.');
  });
});

//for download _EVAL.csv and _PA.csv files relevent to account number from dashboards folder, account number equals to folder name
// Endpoint to download a single _Trades.csv file relevant to account number
app.get('/download/:accountNumber', (req, res) => {
  try {
    const { accountNumber } = req.params;
    console.log(accountNumber);

    const dashboardsPath = path.join(__dirname, 'dashboards', accountNumber);
    console.log(`Checking for files for account number ${accountNumber} in folder: ${dashboardsPath}`);

    // Check if the folder exists
    if (!fs.existsSync(dashboardsPath)) {
      return res.status(404).send(`No folder found for account number ${accountNumber}.`);
    }

    // Find the relevant _Trades.csv file in the folder
    const files = fs.readdirSync(dashboardsPath).filter((file) => file.endsWith('_Trades.csv'));

    if (files.length === 0) {
      return res.status(404).send(`No _Trades.csv file found for account number ${accountNumber}.`);
    }

    if (files.length > 1) {
      return res.status(400).send(`Multiple _Trades.csv files found for account number ${accountNumber}. Please ensure only one file exists.`);
    }

    // Serve the single _Trades.csv file for download
    const filePath = path.join(dashboardsPath, files[0]);
    const fileName = files[0];

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/csv');

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle file stream errors
    fileStream.on('error', (err) => {
      console.error('Error reading the file:', err);
      res.status(500).send('Failed to read the file.');
    });
  } catch (error) {
    console.error(`Error while downloading _Trades.csv file for account number ${req.params.accountNumber}:`, error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.get('/events/by-date', (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Date query is required. Format: YYYY-MM-DD' });
  }

  const csvFilePath = path.join(__dirname, 'events', '2025-events.csv');
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Normalize date for comparison
      const eventDate = row['Date']?.trim();
      if (eventDate === date) {
        results.push({
          date: eventDate,
          event: row['Event Name']?.trim(),
          start_time: row['Start Time (EST)']?.trim(),
          duration: row['Duration']?.trim(),
        });
      }
    })
    .on('end', () => {
      if (results.length > 0) {
        res.json({ success: true, events: results });
      } else {
        res.status(404).json({ success: false, message: 'No events found for the given date.' });
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    });
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

app.get('/is-holiday', (req, res) => {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, message: "Date is required in YYYY-MM-DD format." });
  }

  const [year, month, day] = date.split('-');
  const formattedInput = `${parseInt(month)}/${parseInt(day)}/${year}`;

  const holidaysPath = path.join(__dirname, 'holidays', 'holidays.csv');
  let isHoliday = false;
  let holidayName = '';

  fs.createReadStream(holidaysPath)
    .pipe(csv())
    .on('data', (row) => {
      const observedDate = row['Observed Date']?.trim();
      if (observedDate === formattedInput) {
        isHoliday = true;
        holidayName = row['Holiday Name']?.trim();
      }
    })
    .on('end', () => {
      if (isHoliday) {
        res.json({ success: true, isHoliday: true, holidayName });
      } else {
        res.json({ success: true, isHoliday: false, message: "Not a holiday." });
      }
    })
    .on('error', (err) => {
      console.error('Error reading holidays CSV:', err);
      res.status(500).json({ success: false, message: "Internal server error while reading holiday data." });
    });
});

app.get('/samplefiles/:filename', (req, res) => {
  const { filename } = req.params;

  // Sanitize filename to prevent directory traversal
  if (!/^[\w\-\.]+\.csv$/.test(filename)) {
    return res.status(400).send('Invalid file name.');
  }

  const filePath = path.join(__dirname, 'samplefiles', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`File "${filename}" not found.`);
  }

  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', 'text/csv');

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on('error', (err) => {
    console.error('Error streaming file:', err);
    res.status(500).send('Failed to read the file.');
  });
});


// Catch-all route to handle SPA (Single Page Application) routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export the app
module.exports = app;