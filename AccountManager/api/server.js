const http = require("http");
const app = require("./app");
const port = 3000;
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Function to upload CSV files
const uploadCsvFiles = async () => {
  const directoryPath = path.join(__dirname, "path/to/your/csv/folder"); // Update to your CSV folder path
  const files = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".csv"));

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const formData = new FormData();
    formData.append("csvFiles", fs.createReadStream(filePath));

    try {
      await axios.post(
        "http://localhost:3000/accountDetails/add-accounts",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      await axios.post("http://localhost:3000/users/add-users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(`Uploaded ${file}`);
    } catch (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    }
  }
};

// Schedule the task to run every day at 5 PM
cron.schedule("0 17 * * *", () => {
  console.log("Running scheduled task to upload CSV files...");
  uploadCsvFiles();
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
