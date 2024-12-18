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

// Function to recursively get all CSV files with "_Result" in their names
const getResultCsvFiles = (directory) => {
  let csvFiles = [];
  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      csvFiles = csvFiles.concat(getResultCsvFiles(itemPath)); // Recursively get files
    } else if (item.endsWith(".csv") &&  (item.includes("_Results") || item.includes("_results"))) {
      //if created date less than today date ignore file
      // const createdDate = new Date(stats.birthtime);
      // if(createdDate < new Date()){
      //  console.log("File is older than today's date, ignoring file",itemPath,createdDate);
      // }else{
        csvFiles.push(itemPath); // Add CSV file to the list
      // }
    }
  });
  return csvFiles;
};

// Function to process and upload all "_Result" CSV files
const processAndUploadResultCsvFiles = async () => {
  const directoryPath = path.join(__dirname, "dashboards"); // Define your directory path

  try {
    const files = getResultCsvFiles(directoryPath); // Get all CSV files with "_Results"

    if (files.length === 0) {
      console.log("No '_Results' CSV files found for processing.");
      return;
    }

    console.log(`Found ${files.length} '_Results' CSV files for processing.`);
    
    // Prepare form data for all files
    const formData = new FormData();
    files.forEach((filePath) => {
      const apexid = path.basename(path.dirname(filePath)); // Extract apexid from folder name
      formData.append("csvFiles", fs.createReadStream(filePath)); // Add file stream
      formData.append("apexids", apexid); // Append the apexid
    });

    try {
      // Make a single request to upload all files
      console.log("Uploading all '_Results' CSV files...");
      const response = await axios.post(
        "http://localhost:3000/results/add-results",
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      console.log("Successfully uploaded all '_Results' CSV files:", response.data);
    } catch (error) {
      console.error("Failed to upload '_Results' CSV files:", error.message || error.response?.data);
    }
  } catch (error) {
    console.error(`Error processing '_Results' CSV files: ${error.message}`);
  }
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
    } else if (item.endsWith(".csv") && /^\d+\.csv$/.test(item)) {
      // If item is a CSV file and its name is entirely numeric
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
    // Get all CSV files from the directory
    const files = getCsvFiles(directoryPath);

    if (files.length === 0) {
      console.log("No CSV files found, skipping the upload process.");
      return;
    }

    // Filter out empty files and keep track of ignored files
    const validFiles = files.filter((filePath) => {
      const fileContent = fs.readFileSync(filePath, "utf8");
      if (!fileContent) {
        console.log("File content is empty, ignoring file:", filePath);
        return false; // Ignore empty file
      }
      return true;
    });

    if (validFiles.length === 0) {
      console.log("All files were empty. Skipping further processing.");
      return;
    }

    // Delete accounts data for valid files only
    for (const filePath of validFiles) {
      const apexid = path.basename(path.dirname(filePath));
      try {
        await axios.delete(`http://localhost:3000/accountDetails/account/APEX-${apexid}`);
      } catch (error) {
        console.error(
          `Failed to delete accounts for apexid ${apexid}:`,
          error.code || error.message || error.response?.data
        );
      }
    }

    // If all files are non-empty, delete all account data
    const allFilesNotEmpty = files.every((filePath) => {
      const fileContent = fs.readFileSync(filePath, "utf8");
      return fileContent.trim().length > 0;
    });

    if (allFilesNotEmpty) {
      try {
        await axios.delete("http://localhost:3000/accountDetails/");
      } catch (error) {
        console.error(
          "Failed to delete all accounts:",
          error.code || error.message || error.response?.data
        );
      }
    }

    // Upload valid files and call addUsers for each file
    for (const filePath of validFiles) {
      const formData = new FormData();
      formData.append("csvFiles", fs.createReadStream(filePath));

      try {
        const accountResponse = await axios.post(
          "http://localhost:3000/accountDetails/add-acc-auto",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(`Successfully uploaded ${filePath}:`, accountResponse.data);
      } catch (error) {
        console.error(
          `Failed to upload ${filePath} to add-acc-auto:`,
          error.code || error.message || error.response?.data
        );
      }

      try {
        await addUsers(filePath); // Assuming addUsers is defined elsewhere
      } catch (error) {
        console.error(
          `Failed to process addUsers for ${filePath}:`,
          error.message
        );
      }
    }

    // Call deleteDashboards after all uploads
    try {
      await deleteDashboards(); // Assuming deleteDashboards is defined elsewhere
    } catch (error) {
      console.error("Failed to delete dashboards:", error.message);
    }
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



// // Schedule the task to run every day at 12:00 AM PST
// cron.schedule("0 8 * * *", () => {
//   console.log("Running scheduled task to upload CSV files at 12:00 AM PST...");
//   uploadCsvFiles();
// });

// Schedule the task to run every minute
// cron.schedule("* * * * *", () => {
//   console.log("Running scheduled task to upload CSV files...");
//   uploadCsvFiles();
// });

// Schedule the task to run every hour
cron.schedule("0 * * * *", () => {
  console.log("Running scheduled task to upload CSV files...");
  uploadCsvFiles();
});

// Schedule the task to run every 15 minutes for '_Result' CSV files
cron.schedule("0 13 * * *", () => {
  console.log("Running scheduled task to process and upload '_Result' CSV files at 1 PM PST...");
  processAndUploadResultCsvFiles();
}, {
  timezone: "America/Los_Angeles" // Set the timezone to PST
});

// cron.schedule("* * * * *", ()  => {
//   console.log("Running scheduled task to process and upload '_Results' CSV files...");
//   processAndUploadResultCsvFiles();
// });

// HTTP server creation
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
