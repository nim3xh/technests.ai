const http = require("http");
const app = require("./app");
const port = 3000;
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const deleteDashboards = require("./delete-dashboards");

// Function to upload and process CSV files
const uploadCsvFiles = async () => {
  const directoryPath = path.join(__dirname, "dashboards"); // CSV folder path

  try {
    // Check if there are any CSV files in the folder
    const files = fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith(".csv")); // Filter CSV files

    if (files.length === 0) {
      console.log("No CSV files found, skipping the upload process.");
      return; // Exit the function if no CSV files are found
    }

    // Clear the existing database before uploading
    await axios.delete('http://localhost:3000/accountDetails/');

    const uploadPromises = files.map(async (file) => {
      const filePath = path.join(directoryPath, file);
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

        // Post the CSV to the second endpoint
        await axios.post(
          "http://localhost:3000/users/add-users-auto",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } catch (error) {
        // Handle any errors during the upload
        console.error(`Failed to upload ${file}: ${error.message}`);
      }
    });

    // Wait for all files to be uploaded
    await Promise.all(uploadPromises);
    deleteDashboards(); // Delete the CSV files after uploading
  } catch (error) {
    // Handle errors during the database clearing
    console.error(`Failed to clear the database: ${error.message}`);
  }
};

app.post("/upload-csv", async (req, res) => {
  try {
    const directoryPath = path.join(__dirname, "dashboards"); // Define the CSV folder path
    const files = fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith(".csv")); // Check for CSV files

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


// Schedule the task to run every 1 hour
cron.schedule("0 * * * *", () => {
  console.log("Running scheduled task to upload CSV files...");
  uploadCsvFiles(); // Run the upload task every 1 hour
});

// HTTP server creation
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
