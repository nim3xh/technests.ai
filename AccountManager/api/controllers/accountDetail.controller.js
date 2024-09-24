const models = require("../models");
const fs = require("fs");
const csv = require("csv-parser");

function save(req, res) {
  const accountDetail = {
    account: req.body.account,
    accountBalance: req.body.accountBalance,
    status: req.body.status,
    accountNumber: req.body.accountNumber,
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
  const filePath = req.file.path; // Adjust based on how you upload files

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      const account = data.Account;
      const accountBalance = parseFloat(
        data["Account Balance"].replace(/,/g, "")
      );
      const status = data.Status;
      const accountNameParts = data["Account Name"].split(" (");
      const accountNumber = accountNameParts[0];
      const name = accountNameParts[1].slice(0, -1); // Remove the closing parenthesis

      results.push({
        account,
        accountBalance,
        status,
        accountNumber,
        name, // If needed
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

async function importFromCSVs(req, res) {
  const results = [];
  const files = req.files; // Assuming multiple files are uploaded

  // Function to process a single CSV file
  const processCSV = (filePath) => {
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          const account = data.Account;
          const accountBalance = parseFloat(
            data["Account Balance"].replace(/,/g, "")
          );
          const status = data.Status;
          const accountNameParts = data["Account Name"].split(" (");
          const accountNumber = accountNameParts[0];
          const name = accountNameParts[1]
            ? accountNameParts[1].slice(0, -1)
            : ""; // Remove the closing parenthesis if it exists

          results.push({
            account,
            accountBalance,
            status,
            accountNumber,
            name,
          });
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  };

  // Create an array of promises for each file
  const promises = files.map((file) => {
    return processCSV(file.path); // Adjust based on how you upload files
  });

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

    // Save all new results to the database
    if (newAccounts.length > 0) {
      await models.AccountDetail.bulkCreate(newAccounts);
    }

    res.status(201).json({
      message: "Accounts imported successfully",
      importedAccounts: newAccounts,
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

  models.AccountDetail.findOne({ where: { account: account } })
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
  showByACnu: showByACnu,
  updateByACnu: updateByACnu,
  importFromCSV: importFromCSV,
  importFromCSVs: importFromCSVs,
};
