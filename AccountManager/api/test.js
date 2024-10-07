const fs = require("fs");
const path = require("path");

const uploadDir = "uploads";

fs.readdir(uploadDir, (err, files) => {
  if (err) {
    return console.error("Error reading uploads folder", err);
  }

  console.log("Files to delete:", files);

  files.forEach((file) => {
    const filePath = path.join(uploadDir, file);
    fs.unlink(filePath, (err) => {
      if (err) {
        return console.error(`Error deleting file: ${filePath}`, err);
      }
      console.log(`Deleted file: ${filePath}`);
    });
  });
});
