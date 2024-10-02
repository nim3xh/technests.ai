const models = require("../models");
const fs = require("fs");
const csv = require("csv-parser");

function save(req, res) {
  const accountDetail = {
    account: req.body.account,
    accountBalance: req.body.accountBalance,
    status: req.body.status,
    accountNumber: req.body.accountNumber,
    trailingThreshold: req.body.trailingThreshold,
    PnL: req.body.PnL,
  };

  models.AccountDetail.create(accountDetail)
    .then((result) => {
      res.status(201).json({
        message: "Account created successfully",
        accountDetail: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

function importFromCSV(req, res) {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      console.log(data); // Log the data for debugging

      const account = data.Account;
      const accountBalance = parseFloat(
        data["Account Balance"] ? data["Account Balance"].replace(/,/g, "") : 0
      );
      const status = data.Status;
      const accountNameParts = data["Account Name"].split(" (");
      const accountNumber = accountNameParts[0];
      const name = accountNameParts[1] ? accountNameParts[1].slice(0, -1) : ""; // Remove the closing parenthesis

      const trailingThreshold = data["Trailing Threshold"]
        ? parseFloat(data["Trailing Threshold"].replace(/,/g, ""))
        : null;

      const PnL = data["PnL"]
        ? parseFloat(data["PnL"].replace(/,/g, ""))
        : null; // Change to null if PnL is missing

      results.push({
        account,
        accountBalance,
        status,
        accountNumber,
        name,
        trailingThreshold,
        PnL,
      });
    })
    .on("end", () => {
      // Log results to check for PnL values
      console.log("Parsed Results:", results);

      // Save all results to the database
      models.AccountDetail.bulkCreate(results)
        .then(() => {
          res.status(201).json({
            message: "Accounts imported successfully",
            importedAccounts: results,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Something went wrong while saving accounts",
            error: error,
          });
        });
    })
    .on("error", (error) => {
      res.status(500).json({
        message: "Error reading the CSV file",
        error: error,
      });
    });
}

async function importFromCSVs(req, res) {
  const results = [];
  const files = req.files; // Assuming multiple files are uploaded
  const failedFiles = []; // To keep track of files that failed

  // Function to process a single CSV file
  const processCSV = (filePath) => {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          console.log(data); // Log the data for debugging

          const account = data.Account || ""; // Safely access Account, default to empty string if undefined

          // Skip processing if Account is NULL or empty
          if (!account) {
            return; // Skip this row if Account is missing or empty
          }

          const accountBalance = parseFloat(
            data["Account Balance"]
              ? data["Account Balance"].replace(/,/g, "")
              : 0 // Default to 0 if "Account Balance" is missing
          );
          const status = data.Status || "unknown"; // Default to 'unknown' if Status is missing

          // Safely extract account number and name
          let accountNumber = "";
          let name = "";

          if (data["Account Name"]) {
            const accountNameParts = data["Account Name"].split(" (");
            accountNumber = accountNameParts[0];
            name = accountNameParts[1] ? accountNameParts[1].slice(0, -1) : ""; // Remove the closing parenthesis
          } else {
            // Handle missing "Account Name" by constructing a name from the Account column
            let accountParts = account.split("-"); // Split Account by hyphen

            // If the first part is "PA", skip it
            if (accountParts[0] === "PA") {
              accountParts = accountParts.slice(1); // Ignore the first part
            }

            // Check if there are at least two parts after the prefix is removed
            if (accountParts.length >= 2) {
              accountNumber = `${accountParts[0]}-${accountParts[1]}`; // Construct account number from the relevant parts
              name = `${accountNumber} (Unknown)`; // Append "(Unknown)" as name
            } else {
              accountNumber = account; // Fallback to the full account if the expected format is not found
              name = `${account} (Unknown)`; // Append "(Unknown)"
            }
          }

          const trailingThreshold = data["Auto Liquidate Threshold Value"]
            ? parseFloat(
                data["Auto Liquidate Threshold Value"].replace(/,/g, "")
              )
            : 0; // Default to 0 if missing

          const PnL = data["P&L"]
            ? parseFloat(data["P&L"].replace(/,/g, ""))
            : 0; // Default to 0 if missing

          results.push({
            account,
            accountBalance,
            status,
            accountNumber,
            name,
            trailingThreshold,
            PnL,
          });
        })
        .on("end", () => {
          console.log(`File processed successfully: ${filePath}`);
          resolve();
        })
        .on("error", (error) => {
          console.error(`Failed to process file: ${filePath}`, error);
          failedFiles.push(filePath); // Add the failed file to the list
          resolve(); // Continue to the next file
        });
    });
  };

  // Create an array of promises for each file
  const promises = files.map((file) => processCSV(file.path)); // Adjust based on how you upload files

  // Wait for all files to be processed
  await Promise.all(promises);

  try {
    // Retrieve existing accounts from the database to avoid duplicates
    const existingAccounts = await models.AccountDetail.findAll({
      attributes: ["account"], // Adjust according to your model
      raw: true,
    });
    const existingAccountSet = new Set(
      existingAccounts.map((acc) => acc.account)
    );

    // Filter results to only include new accounts
    const newAccounts = results.filter(
      (result) => !existingAccountSet.has(result.account)
    );

    // Log the new accounts for debugging
    console.log("New Accounts to Import:", newAccounts);

    // Save all new results to the database
    if (newAccounts.length > 0) {
      await models.AccountDetail.bulkCreate(newAccounts);
    }

    res.status(201).json({
      message: "Accounts imported successfully",
      importedAccounts: newAccounts,
      failedFiles, // Include the failed files in the response
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while processing accounts",
      error: error,
    });
  }
}

function show(req, res) {
  const id = req.params.id;
  models.AccountDetail.findByPk(id)
    .then((result) => {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: "Account not found",
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
  models.AccountDetail.findAll()
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
  const updatedAccountDetail = {
    account: req.body.account,
    accountBalance: req.body.accountBalance,
    status: req.body.status,
    accountNumber: req.body.accountNumber,
    trailingThreshold: req.body.trailingThreshold,
    PnL: req.body.PnL,
  };

  models.AccountDetail.update(updatedAccountDetail, { where: { id: id } })
    .then((result) => {
      res.status(200).json({
        message: "Account updated successfully",
        accountDetail: updatedAccountDetail,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

//update by account number
function updateByACnu(req, res) {
  const account = req.params.account;
  const updatedAccountDetail = {
    account: req.body.account,
    accountBalance: req.body.accountBalance,
    status: req.body.status,
    accountNumber: req.body.accountNumber,
    trailingThreshold: req.body.trailingThreshold,
    PnL: req.body.PnL,
  };

  models.AccountDetail.update(updatedAccountDetail, {
    where: { account: account },
  })
    .then((result) => {
      res.status(200).json({
        message: "Account updated successfully",
        accountDetail: updatedAccountDetail,
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
  models.AccountDetail.destroy({ where: { id: id } })
    .then((result) => {
      res.status(200).json({
        message: "Account deleted successfully",
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

// Get account details by account number
function showByACnu(req, res) {
  const account = req.params.account;

  models.AccountDetail.findAll({ where: { accountNumber: account } })
    .then((result) => {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: "Account not found",
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

function destroyAll(req, res) {
  models.AccountDetail.destroy({
    where: {}, // No condition means all records will be deleted
    truncate: true, // This will delete all records and reset auto-increment keys
  })
    .then((result) => {
      res.status(200).json({
        message: "All account details deleted successfully",
        deletedRecords: result, // Number of records deleted
      });
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
  destroyAll: destroyAll,
  showByACnu: showByACnu,
  updateByACnu: updateByACnu,
  importFromCSV: importFromCSV,
  importFromCSVs: importFromCSVs,
};
