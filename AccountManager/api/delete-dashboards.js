const fs = require("fs");
const path = require("path");

function deleteCSVFiles(uploadDirectory) {
  return new Promise((resolve, reject) => {
    // Read the upload directory
    fs.readdir(uploadDirectory, (err, files) => {
      if (err) {
        return reject(err); // Reject if there's an error reading the directory
      }

      // Filter CSV files
      const csvFiles = files.filter((file) => path.extname(file) === ".csv");

      // Create an array of delete promises for each CSV file
      const deletePromises = csvFiles.map((file) => {
        const filePath = path.join(uploadDirectory, file);
        return fs.promises.unlink(filePath); // Delete each CSV file
      });

      // Wait for all delete promises to resolve
      Promise.all(deletePromises)
        .then(() => resolve()) // Resolve when all CSV files have been deleted
        .catch((deleteError) => reject(deleteError)); // Reject if any delete fails
    });
  });
}

function deleteUploads() {
  const uploadDirectory = "dashboards";

  return deleteCSVFiles(uploadDirectory)
    .then(() => console.log("All CSV files deleted successfully."))
    .catch((error) => console.error("Error deleting CSV files:", error));
}

module.exports = deleteUploads;