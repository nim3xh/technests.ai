const models = require("../models");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

function save(req, res) {
  const user = {
    accountNumber: req.body.accountNumber,
    name: req.body.name,
  };

  models.User.create(user)
    .then((result) => {
      res.status(201).json({
        message: "User created successfully",
        user: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

// Add users from a CSV file
async function addUserFromCsv(req, res) {
  const csvFilePath = req.file.path; 
  const users = [];
  const uniqueAccountNumbers = new Set(); // To track unique account numbers

  try {
    // Fetch existing accounts from the database
    const existingUsers = await models.User.findAll({
      attributes: ['accountNumber']
    });
    const existingAccountNumbers = new Set(existingUsers.map(user => user.accountNumber));

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        // Extract the relevant fields from the CSV row
        const fullAccountName = row["Account Name"];

        // Extract the account number and name from the Account Name
        const accountNumberMatch = fullAccountName.match(/^([^ ]+) \(/); // Match the account number before the space and parentheses
        const nameMatch = fullAccountName.match(/\(([^)]+)\)/); // Match the name inside parentheses

        const accountNumber = accountNumberMatch ? accountNumberMatch[1] : null; // Get account number
        const name = nameMatch ? nameMatch[1].trim() : null; // Get name

        // Ensure both account number and name are extracted
        if (accountNumber && name) {
          // Check if the account number is already processed or exists in the database
          if (!uniqueAccountNumbers.has(accountNumber) && !existingAccountNumbers.has(accountNumber)) {
            // Create user object only if the account number is unique and doesn't exist
            const user = {
              accountNumber: accountNumber,
              accountBalance: row["Account Balance"].replace(/,/g, ""), // Remove commas for balance
              status: row.Status,
              name: name, // Use the extracted name
            };
            users.push(user);
            uniqueAccountNumbers.add(accountNumber); // Mark this account number as processed
          }
        }
      })
      .on("end", async () => {
        // After reading the file, save all unique users to the database
        try {
          await models.User.bulkCreate(users);
          res.status(201).json({
            message: "Users created successfully",
            users: users,
          });
        } catch (error) {
          res.status(500).json({
            message: "Something went wrong while saving users",
            error: error,
          });
        }
      })
      .on("error", (error) => {
        res.status(500).json({
          message: "Error reading CSV file",
          error: error,
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching existing users",
      error: error,
    });
  }
}

// Add users from multiple CSV files
async function addUsersFromCsv(req, res) {
  const users = [];
  const uniqueAccountNumbers = new Set(); // To track unique account numbers
  const csvFiles = req.files; // Array of uploaded files

  // Check if any files were uploaded
  if (!csvFiles || csvFiles.length === 0) {
    return res.status(400).json({ message: "No CSV files uploaded." });
  }

  try {
    // Fetch existing accounts from the database
    const existingUsers = await models.User.findAll({
      attributes: ["accountNumber"],
    });
    const existingAccountNumbers = new Set(
      existingUsers.map((user) => user.accountNumber)
    );

    const processFile = (file) => {
      const csvFilePath = file.path; // Get the path of the uploaded file

      return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on("data", (row) => {
            // Extract the relevant fields from the CSV row
            const fullAccountName = row["Account Name"];

            // Ensure fullAccountName is defined before attempting to match
            if (fullAccountName) {
              // Extract the account number and name from the Account Name
              const accountNumberMatch = fullAccountName.match(/^([^ ]+) \(/); // Match the account number before the space and parentheses
              const nameMatch = fullAccountName.match(/\(([^)]+)\)/); // Match the name inside parentheses

              const accountNumber = accountNumberMatch
                ? accountNumberMatch[1]
                : null; // Get account number
              const name = nameMatch ? nameMatch[1].trim() : null; // Get name

              // Ensure both account number and name are extracted
              if (accountNumber && name) {
                // Check if the account number is already processed or exists in the database
                if (
                  !uniqueAccountNumbers.has(accountNumber) &&
                  !existingAccountNumbers.has(accountNumber)
                ) {
                  // Create user object only if the account number is unique and doesn't exist
                  const user = {
                    accountNumber: accountNumber,
                    accountBalance: row["Account Balance"]
                      ? row["Account Balance"].replace(/,/g, "") // Remove commas for balance
                      : "0", // Default to "0" if balance is missing
                    status: row.Status || "unknown", // Default status if missing
                    name: name, // Use the extracted name
                  };
                  users.push(user);
                  uniqueAccountNumbers.add(accountNumber); // Mark this account number as processed
                }
              }
            }
          })
          .on("end", resolve) // Resolve promise when file processing is done
          .on("error", reject); // Reject promise on error
      });
    };

    // Process all CSV files in parallel
    await Promise.all(csvFiles.map(processFile));

    // After reading all files, save all unique users to the database
    await models.User.bulkCreate(users);
    res.status(201).json({
      message: "Users created successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while saving users",
      error: error,
    });
  }
}

function show(req, res) {
  const id = req.params.id;
  models.User.findByPk(id)
    .then((result) => {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

function index(req, res) {
  models.User.findAll()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

function update(req, res) {
  const id = req.params.id;
  const UpdatedUser = {
    accountNumber: req.body.accountNumber,
    name: req.body.name,
  };

  models.User.update(UpdatedUser, { where: { id: id } })
    .then((result) => {
      res.status(200).json({
        message: "User updated successfully",
        user: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

//update user by account number
function updateByAccount(req, res) {
  const account = req.params.accountNumber;
  const UpdatedUser = {
    accountNumber: req.body.accountNumber,
    name: req.body.name,
  };
  models.User.update(UpdatedUser, { where: { accountNumber: account } })
    .then((result) => {
      res.status(200).json({
        message: "User updated successfully",
        user: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

function destroy(req, res) {
  const id = req.params.id;
  models.User.destroy({ where: { id: id } })
    .then((result) => {
      res.status(200).json({
        message: "User deleted successfully",
        user: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

// get account details by account number
function showByAccount(req, res) {
  const account = req.params.accountNumber;
  models.User.findOne({ where: { accountNumber: account } })
    .then((result) => {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

module.exports = {
  save: save,
  show: show,
  index: index,
  update: update,
  destroy: destroy,
  showByAccount: showByAccount,
  updateByAccount: updateByAccount,
  addUserFromCsv: addUserFromCsv,
  addUsersFromCsv: addUsersFromCsv,
};
