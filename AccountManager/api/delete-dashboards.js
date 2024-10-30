const fs = require("fs");
const path = require("path");

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

function moveCSVFiles(uploadDirectory, backupDirectory) {
  return new Promise((resolve, reject) => {
    // Read the upload directory
    fs.readdir(uploadDirectory, (err, files) => {
      if (err) {
        return reject(err); // Reject if there's an error reading the directory
      }

      // Filter CSV files
      const csvFiles = files.filter((file) => path.extname(file) === ".csv");

      // Create an array of promises to move and rename CSV files
      const movePromises = csvFiles.map((file) => {
        const oldPath = path.join(uploadDirectory, file);
        const timestamp = getTimestamp(); // Get the current timestamp
        const fileNameWithoutExt = path.parse(file).name;
        const newFileName = `${fileNameWithoutExt}_${timestamp}.csv`; // Append timestamp to filename
        const newPath = path.join(backupDirectory, newFileName);
        return fs.promises.rename(oldPath, newPath); // Move and rename the file
      });

      // Wait for all move promises to resolve
      Promise.all(movePromises)
        .then(() => resolve()) // Resolve when all files are moved
        .catch((moveError) => reject(moveError)); // Reject if any move fails
    });
  });
}

function deleteUploads() {
  return new Promise((resolve, reject) => {
    const uploadDirectory = "dashboards";
    const backupDirectory = "dashboards.old";

    // Check if the backup directory exists
    fs.access(backupDirectory, fs.constants.F_OK, (err) => {
      if (err) {
        // Directory does not exist, so create it
        fs.mkdir(backupDirectory, { recursive: true }, (err) => {
          if (err) {
            return reject(err); // Reject if there's an error creating the directory
          }
          moveCSVFiles(uploadDirectory, backupDirectory)
            .then(() => deleteRemainingFiles(uploadDirectory, resolve, reject))
            .catch((moveError) => reject(moveError)); // Reject if moving CSV files fails
        });
      } else {
        // Directory exists, just move the files
        moveCSVFiles(uploadDirectory, backupDirectory)
          .then(() => deleteRemainingFiles(uploadDirectory, resolve, reject))
          .catch((moveError) => reject(moveError)); // Reject if moving CSV files fails
      }
    });
  });
}

function deleteRemainingFiles(directory, resolve, reject) {
  // Read the directory to delete remaining files
  fs.readdir(directory, (err, files) => {
    if (err) {
      return reject(err); // Reject if there's an error reading the directory
    }

    // Create an array of delete promises for each file
    const deletePromises = files.map((file) => {
      return fs.promises.unlink(path.join(directory, file)); // Delete each file
    });

    // Wait for all delete promises to resolve
    Promise.all(deletePromises)
      .then(() => resolve()) // Resolve when all files have been deleted
      .catch((deleteError) => reject(deleteError)); // Reject if any delete fails
  });
}

module.exports = deleteUploads;
