const fs = require("fs");
const path = require("path");

function deleteUploads() {
  return new Promise((resolve, reject) => {
    const uploadDirectory = "dashboards"; // Adjust based on where uploads are stored

    // Read the directory
    fs.readdir(uploadDirectory, (err, files) => {
      if (err) {
        return reject(err); // Reject if there's an error reading the directory
      }

      // Create an array of delete promises for each file
      const deletePromises = files.map((file) => {
        return fs.promises.unlink(path.join(uploadDirectory, file)); // Delete each file
      });

      // Wait for all delete promises to resolve
      Promise.all(deletePromises)
        .then(() => resolve()) // Resolve when all files have been deleted
        .catch((deleteError) => reject(deleteError)); // Reject if any delete fails
    });
  });
}

module.exports = deleteUploads;
