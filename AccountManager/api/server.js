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

// Function to upload and process CSV files
const uploadCsvFiles = async () => {
  const directoryPath = path.join(__dirname, "dashboards"); // Root CSV folder path

  try {
    // Get all CSV files in the directory and its subdirectories
    const files = getCsvFiles(directoryPath);

    if (files.length === 0) {
      console.log("No CSV files found, skipping the upload process.");
      return; // Exit the function if no CSV files are found
    }

    // Clear the existing database before uploading
    await axios.delete("http://localhost:3000/accountDetails/");

    const uploadPromises = files.map(async (filePath) => {
      const formData = new FormData();
      formData.append("csvFiles", fs.createReadStream(filePath));

      try {
        // Post the CSV to the first endpoint
        await axios.post(
          "http://localhost:3000/accountDetails/add-acc-auto",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // // Post the CSV to the second endpoint
        // await axios.post(
        //   "http://localhost:3000/users/add-users-auto",
        //   formData,
        //   {
        //     headers: { "Content-Type": "multipart/form-data" },
        //   }
        // );
      } catch (error) {
        // Handle any errors during the upload
        console.error(
          `Failed to upload ${filePath}:`,
          error.code || error.message || error.response?.status
        );
      }
    });

    // Wait for all files to be uploaded
    await Promise.all(uploadPromises);
    deleteDashboards(); // Delete the CSV files after uploading
  } catch (error) {
    // Handle errors during the database clearing or upload process
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

// Schedule the task to run every day at 12:00 AM PST
cron.schedule("0 8 * * *", () => {
  console.log("Running scheduled task to upload CSV files at 12:00 AM PST...");
  uploadCsvFiles();
});

// HTTP server creation
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
