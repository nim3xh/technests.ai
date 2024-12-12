const models = require("../models");
const fs = require("fs");
const csv = require("csv-parser");
const deleteUploads = require("../delete-uploads");

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

const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const accountNameMap = new Map(); // Map to store base account numbers and their corresponding names
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // Skip lines that start with "Updated:"
        if (Object.values(data).some((value) => value.startsWith("Updated:"))) {
          return; // Skip this row
        }

        const account = data.Account || ""; // Get the Account field
        if (!account) return; // Skip rows with no account

        // console.log("Processing account:", account);

        const Balance = data["Account Balance"] || 0; // Get the Account Balance field
        if (!Balance) return; // Skip rows with no balance

        // console.log('balance:', Balance);
        // Extract base account number (removing the last segment after the last dash)
        const accountParts = account.split("-");
        let baseAccountNumber = accountParts.slice(0, -1).join("-"); // Base account number (e.g., APEX-182660)

        const isPAAccount = accountParts[0] === "PA"; // Check if the account starts with PA
        if (isPAAccount) {
          baseAccountNumber = accountParts.slice(1, -1).join("-"); // Treat PA-APEX-XXXX as APEX-XXXX
        }

        const accountBalance = parseFloat(
          data["Account Balance"]
            ? data["Account Balance"].replace(/,/g, "")
            : 0
        );
        const status = data.Status || "unknown";

        // Skip rows where status is "unknown"
        if (status.toLowerCase() === "unknown") return; // Skip this row

        const trailingThreshold = data["Auto Liquidate Threshold Value"]
          ? parseFloat(data["Auto Liquidate Threshold Value"].replace(/,/g, ""))
          : 0;
        const PnL = data["P&L"] ? parseFloat(data["P&L"].replace(/,/g, "")) : 0;

        // Extract account name
        let name = "Unknown"; // Default name
        if (data["Account Name"]) {
          const accountName = data["Account Name"];
          const nameParts = accountName.match(/\((.*?)\)/); // Extract name from parenthesis, e.g., "(Kiran Gururaj)"
          if (nameParts) {
            name = nameParts[1]; // Set the extracted name
            accountNameMap.set(baseAccountNumber, name); // Store base account number and name in map
          }
        }

        // If a name exists for this base account number, use it
        if (accountNameMap.has(baseAccountNumber)) {
          name = accountNameMap.get(baseAccountNumber);
        }

        // If the account is prefixed with 'PA-', replace name with the base account's name
        if (
          isPAAccount &&
          accountNameMap.has(baseAccountNumber.replace("PA-", ""))
        ) {
          name = accountNameMap.get(baseAccountNumber.replace("PA-", ""));
        }

        // Prepare the output format
        const outputAccountNumber = isPAAccount ? account : baseAccountNumber; // Full account number
        const outputName = baseAccountNumber + " " + name; // Base account name

        results.push({
          account: account, // Keep the original account number (e.g., PA-APEX-182660-07 or APEX-182660-07)
          accountBalance,
          status,
          accountNumber: baseAccountNumber, // Base account number (e.g., APEX-182660)
          name: outputName, // Base account name
          trailingThreshold,
          PnL,
        });
      })
      .on("end", () => {
        console.log(`File processed successfully: ${filePath}`);
        resolve(results);
      })
      .on("error", (error) => {
        console.error(`Failed to process file: ${filePath}`, error);
        resolve([]); // In case of error, return an empty result
      });
  });
};


// Main function to import data from multiple CSVs
async function importFromCSVs(req, res) {
  const files = req.files;
  const failedFiles = [];
  const allResults = [];

  // Process each CSV file and collect results
  for (const file of files) {
    try {
      const results = await processCSV(file.path);
      allResults.push(...results); // Merge results from all files
    } catch (error) {
      failedFiles.push(file.path); // Track failed files
    }
  }

  try {
    // Retrieve existing accounts to avoid duplicates
    const existingAccounts = await models.AccountDetail.findAll({
      attributes: ["account"], // Adjust according to your model
      raw: true,
    });
    const existingAccountSet = new Set(
      existingAccounts.map((acc) => acc.account)
    );

    // Filter results to only include new accounts
    const newAccounts = allResults.filter(
      (result) => !existingAccountSet.has(result.account)
    );

    // Save new accounts to the database
    if (newAccounts.length > 0) {
      await models.AccountDetail.bulkCreate(newAccounts);
    }

    res.status(201).json({
      message: "Accounts imported successfully",
      importedAccounts: newAccounts,
      failedFiles,
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

function destroyByACnu(req, res) {
  const account = req.params.account;
  console.log(account);
  models.AccountDetail.destroy({ where: { accountNumber: account } })
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
  // Get current date and time
  const currentDateTime = new Date();

  // Update all records to set the deletedAt timestamp, simulating a soft delete
  models.AccountDetail.update(
    { deletedAt: currentDateTime },
    {
      where: {}, // No condition means all records will be updated
      paranoid: false, // Bypass Sequelize's soft delete
    }
  )
    .then((result) => {
      deleteUploads()
        .then(() => {
          res.status(200).json({
            message: "All account details deleted successfully",
            deletedRecords: result, // Number of records affected
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Something went wrong with file deletion",
            error: error,
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

function indexDeleted(req, res) {
  models.AccountDetail.findAll({
    where: {
      deletedAt: { [models.Sequelize.Op.ne]: null }
    },
    paranoid: false
  })
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

function indexDeletedbyAccNu(req, res) {
  const account = req.params.account;

  models.AccountDetail.findAll({
    where: {
      accountNumber: account,
      deletedAt: { [models.Sequelize.Op.ne]: null }
    },
    paranoid: false
  })
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

module.exports = {
  save: save,
  show: show,
  index: index,
  update: update,
  destroy: destroy,
  destroyAll: destroyAll,
  destroyByACnu: destroyByACnu,
  showByACnu: showByACnu,
  updateByACnu: updateByACnu,
  importFromCSV: importFromCSV,
  importFromCSVs: importFromCSVs,
  indexDeleted: indexDeleted,
  indexDeletedbyAccNu: indexDeletedbyAccNu,
};
