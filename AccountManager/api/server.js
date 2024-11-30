const http = require("http");
const app = require("./app");
const port = 3000;
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const deleteDashboards = require("./delete-dashboards");

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

// Function to recursively get all CSV files in the directory and its subdirectories
const getCsvFiles = (directory) => {
  let csvFiles = [];
  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // If item is a directory, recursively search it
      csvFiles = csvFiles.concat(getCsvFiles(itemPath));
    } else if (item.endsWith(".csv")) {
      // If item is a CSV file, add it to the list
      csvFiles.push(itemPath);
    }
  });

  return csvFiles;
};

const addUsers = async (filePath) => {
  const formData = new FormData();
  formData.append("csvFiles", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      "http://localhost:3000/users/add-users-auto",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    // console.log(`Successfully uploaded ${filePath} to add-users-auto:`, response.data);
  } catch (error) {
    console.error(
      `Failed to upload ${filePath} to add-users-auto:`,
      error.code || error.message || error.response?.data
    );
  }
};


const uploadCsvFiles = async () => {
  const directoryPath = path.join(__dirname, "dashboards");

  try {
    const files = getCsvFiles(directoryPath);

    if (files.length === 0) {
      console.log("No CSV files found, skipping the upload process.");
      return;
    }

    await axios.delete("http://localhost:3000/accountDetails/");

    for (const filePath of files) {
      const formData = new FormData();
      formData.append("csvFiles", fs.createReadStream(filePath));

      try {
        // Upload to the accountDetails endpoint
        const accountResponse = await axios.post(
          "http://localhost:3000/accountDetails/add-acc-auto",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // console.log(`Successfully uploaded ${filePath} to add-acc-auto:`, accountResponse.data);
      } catch (error) {
        console.error(
          `Failed to upload ${filePath} to add-acc-auto:`,
          error.code || error.message || error.response?.data
        );
      }

      // Call the addUsers function
      await addUsers(filePath);
    }

    deleteDashboards();
  } catch (error) {
    console.error(`Error during CSV upload process: ${error.message}`);
  }
};



app.post("/upload-csv", async (req, res) => {
  try {
    const directoryPath = path.join(__dirname, "dashboards"); // Define the CSV folder path
    const files = getCsvFiles(directoryPath); // Get all CSV files

    // Check if there are any CSV files in the folder
    if (files.length === 0) {
      return res
        .status(200)
        .send("No CSV files found, skipping the upload process."); // Send response if no files found
    }

    await uploadCsvFiles(); // Call the upload function
    res.status(200).send("CSV files uploaded successfully.");
  } catch (error) {
    console.error(`Error uploading CSV files: ${error.message}`);
    res.status(500).send("Failed to upload CSV files.");
  }
});


// Function to handle the file upload, save it in the correct folder based on apexid
const uploadFile = (file, apexid) => {
  const folderPath = path.join(__dirname, "dashboards", apexid); // Folder path based on apexid

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // Create the folder if it doesn't exist
  }

  const filePath = path.join(folderPath, file.originalname); // Save the file with the original name

  // Use the file path to move the uploaded file
  return new Promise((resolve, reject) => {
    // If using diskStorage, the file is already written to disk with `file.path`
    fs.rename(file.path, filePath, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(filePath); // Return the final file path
    });
  });
};

// Endpoint to return the current time
app.get('/current-time', (req, res) => {
  const time = getFormattedTime();
  res.json({ time });
});


app.post("/upload-trade", upload.single("csvFile"), async (req, res) => {
  try {
      const { apexid } = req.body; // Retrieve apexid from the request body
      const file = req.file;

      // Log request body and file details
      console.log("Request body:", req.body);  // Should show apexid
      console.log("Uploaded file:", req.file);  // Should show file details

      if (!apexid) {
          return res.status(400).send("Apexid is required to upload the file.");
      }

      if (!file) {
          return res.status(400).send("No file uploaded.");
      }

      // Upload file to the correct folder based on apexid
      const filePath = await uploadFile(file, apexid);

      res.status(200).send(`CSV file uploaded successfully to ${filePath}`);
  } catch (error) {
      console.error("Error during CSV upload:", error);  // Log the actual error
      res.status(500).send("Failed to upload CSV file.");
  }
});



// Schedule the task to run every day at 12:00 AM PST
cron.schedule("0 8 * * *", () => {
  console.log("Running scheduled task to upload CSV files at 12:00 AM PST...");
  uploadCsvFiles();
});

// // Schedule the task to run every minute
// cron.schedule("* * * * *", () => {
//   console.log("Running scheduled task to upload CSV files...");
//   uploadCsvFiles();
// });


// HTTP server creation
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
