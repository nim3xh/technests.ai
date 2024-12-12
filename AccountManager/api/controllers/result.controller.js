const models = require('../models');
const fs = require("fs");
const csv = require("csv-parser");
const deleteUploads = require("../delete-uploads");

function save(req, res){
    const result = {
        ResultTime : req.body.ResultTime,
        FileName : req.body.FileName,
        TradeCount : req.body.TradeCount,
        Account : req.body.Account,
        Instrument : req.body.Instrument,
        Quantity : req.body.Quantity,
        Profit : req.body.Profit,
        StopLoss : req.body.StopLoss,
        TradeTime : req.body.TradeTime,
        Direction : req.body.Direction,
        EntryTime : req.body.EntryTime,
        EntryPrice : req.body.EntryPrice,
        ExitTime : req.body.ExitTime,
        ExitPrice : req.body.ExitPrice,
        Result : req.body.Result,
        Comment : req.body.Comment
    };

    models.Result.create(result)
        .then((data) => {
            res.status(201).json({
                message : "Result created successfully",
                result : data,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message : "Something went wrong",
                error : error,
            });
        });
}


function index(req, res){
    models.Result.findAll()
        .then((data) => {
            res.status(200).json({
                result : data,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message : "Something went wrong",
                error : error,
            });
        });
}

function show(req, res){
    const id = req.params.id;

    models.Result.findByPk(id)
        .then((data) => {
            res.status(200).json({
                result : data,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message : "Something went wrong",
                error : error,
            });
        });
}

function update(req, res){
    const id = req.params.id;
    const updatedResult = {
        ResultTime : req.body.ResultTime,
        FileName : req.body.FileName,
        TradeCount : req.body.TradeCount,
        Account : req.body.Account,
        Instrument : req.body.Instrument,
        Quantity : req.body.Quantity,
        Profit : req.body.Profit,
        StopLoss : req.body.StopLoss,
        TradeTime : req.body.TradeTime,
        Direction : req.body.Direction,
        EntryTime : req.body.EntryTime,
        EntryPrice : req.body.EntryPrice,
        ExitTime : req.body.ExitTime,
        ExitPrice : req.body.ExitPrice,
        Result : req.body.Result,
        Comment : req.body.Comment
    };

    models.Result.update(updatedResult, {where : {id : id}})
        .then((data) => {
            res.status(200).json({
                message : "Result updated successfully",
                result : updatedResult,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message : "Something went wrong",
                error : error,
            });
        });
}

function destroy(req, res){
    const id = req.params.id;

    models.Result.destroy({where : {id : id}})
        .then((data) => {
            res.status(200).json({
                message : "Result deleted successfully",
            });
        })
        .catch((error) => {
            res.status(500).json({
                message : "Something went wrong",
                error : error,
            });
        });
}


const convertTo24HourFormat = (time) => {
  if (typeof time === "number") {
    // Convert Excel time format to HH:mm:ss
    const totalSeconds = Math.round(time * 24 * 60 * 60); // Convert days to seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else if (typeof time === "string") {
    // Handle standard AM/PM formats
    const match = time.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (!match) {
      throw new Error(`Time does not match expected format: ${time}`);
    }
    const [hours, minutes, modifier] = match.slice(1);
    let hours24 = parseInt(hours, 10);
    if (modifier.toUpperCase() === "PM" && hours24 < 12) hours24 += 12;
    if (modifier.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;
    return `${hours24.toString().padStart(2, "0")}:${minutes.padStart(
      2,
      "0"
    )}:00`;
  } else {
    throw new Error(`Invalid time format: ${time}`);
  }
};

// Function to process a single CSV file and extract result data
const processResultCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          const result = {
            ResultTime: data['Result Time'] || null,
            FileName: data[' FileName'] ? data[' FileName'].trim() : null,
            TradeCount: data.TradeCount ? parseInt(data.TradeCount, 10) : 0,
            Account: data.Account || null,
            Instrument: data.Instrument || null,
            Quantity: data.Quantity ? parseInt(data.Quantity, 10) : 0,
            Profit: data.Profit ? parseFloat(data.Profit.replace(/,/g, '')) : 0.0,
            StopLoss: data['Stop Loss'] ? parseFloat(data['Stop Loss'].replace(/,/g, '')) : 0.0,
            TradeTime: data['Trade Time'] ? convertTo24HourFormat(data['Trade Time']) : null,
            Direction: data.Direction || null,
            EntryTime: data['Entry Time'] || null,
            EntryPrice: data['Entry Price'] ? parseFloat(data['Entry Price'].replace(/,/g, '')) : 0.0,
            ExitTime: data['Exit Time'] || null,
            ExitPrice: data['Exit Price'] ? parseFloat(data['Exit Price'].replace(/,/g, '')) : 0.0,
            Result: data.Result || null,
            Comment: data.Comment || null,
          };

          if (result.Account && result.Instrument) {
            results.push(result);
          }
        } catch (error) {
          console.error("Error processing row:", data, error);
        }
      })
      .on('end', () => {
        console.log(`File processed successfully: ${filePath}`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error(`Failed to process file: ${filePath}`, error);
        reject(error);
      });
  });
};

// Function to import results from multiple CSVs
async function importResultsFromCSVs(req, res) {
  const files = req.files || []; // Ensure req.files exists
  const failedFiles = [];
  let allResults = [];

  if (files.length === 0) {
    return res.status(400).json({ message: "No files provided for processing" });
  }

  console.log("Received files for processing:", files.map(file => file.originalname));

  try {
    // Step 1: Clear the table only once before processing any files
    console.log("Clearing existing data from the database...");
    await models.Result.destroy({ where: {} });

    // Step 2: Process all files and collect their results
    const fileProcessingPromises = files.map((file) =>
      processResultCSV(file.path).catch((error) => {
        console.error(`Failed to process file: ${file.originalname}`, error);
        failedFiles.push(file.originalname);
        return []; // Return empty array for failed files
      })
    );

    const resultsArrays = await Promise.all(fileProcessingPromises);
    allResults = resultsArrays.flat(); // Combine results from all files

    // Step 3: Insert all results into the database
    if (allResults.length > 0) {
      console.log(`Inserting ${allResults.length} records into the database...`);
      await models.Result.bulkCreate(allResults);

      res.status(201).json({
        message: "Results imported successfully",
        importedResultsCount: allResults.length,
        failedFiles,
      });
    } else {
      res.status(200).json({
        message: "No valid data found to import",
        failedFiles,
      });
    }
  } catch (error) {
    console.error("Error during import operation:", error);
    res.status(500).json({
      message: "Something went wrong while importing results",
      error: error.message,
    });
  }
}

function indexbyAccount(req, res) {
  const account = req.params.account.replace(/APEX-/, "").split(" ")[0];

  models.Result.findAll({
      where: models.sequelize.where(
          models.sequelize.literal(`
              CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(Account, 'APEX-', -1), '-', 1) AS UNSIGNED)
          `),
          account
      )
  })
      .then((data) => {
          res.status(200).json({
              result: data,
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
    index: index,
    show: show,
    update: update,
    destroy: destroy,
    importResultsFromCSVs: importResultsFromCSVs,
    indexbyAccount: indexbyAccount
};