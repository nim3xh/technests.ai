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
        // Ensure the time fields are in 24-hour format
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
            TradeTime: data['Trade Time'] ? convertTo24HourFormat(data['Trade Time']) : null,  // Convert to 24-hour format
            Direction: data.Direction || null,
            EntryTime: data['Entry Time'] || null,
            EntryPrice: data['Entry Price'] ? parseFloat(data['Entry Price'].replace(/,/g, '')) : 0.0,
            ExitTime: data['Exit Time'] || null,
            ExitPrice: data['Exit Price'] ? parseFloat(data['Exit Price'].replace(/,/g, '')) : 0.0,
            Result: data.Result || null,
            Comment: data.Comment || null,
          };

          console.log("Result extracted from CSV:", result);

          // Add any additional validation if necessary
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
        reject(error); // Reject the promise in case of error
      });
  });
};


// Function to import results from multiple CSVs
async function importResultsFromCSVs(req, res) {
  const files = req.files;
  const failedFiles = [];
  const allResults = [];

  // Process each CSV file and collect results
  for (const file of files) {
    try {
      const results = await processResultCSV(file.path);
      allResults.push(...results); // Merge results from all files
    } catch (error) {
      failedFiles.push(file.path); // Track failed files
    }
  }

  try {
    // Retrieve existing results to avoid duplicates (based on unique identifiers)
    const existingResults = await models.Result.findAll({
      attributes: ['TradeTime', 'Account', 'Instrument'],
      raw: true,
    });

    // Create a set of existing results for faster comparison
    const existingResultsSet = new Set(
      existingResults.map(
        (res) => `${res.TradeTime}-${res.Account}-${res.Instrument}`
      )
    );

    // Identify the unique identifiers of the new results to avoid duplicates
    const newResults = allResults.filter((result) => {
      const resultKey = `${result.TradeTime}-${result.Account}-${result.Instrument}`;
      if (existingResultsSet.has(resultKey)) {
        return false; // Skip if the result already exists
      }
      return true;
    });

    // If there are any new results to add
    if (newResults.length > 0) {
      // Optional: Delete all existing records in the Result table if needed (commented out here)
      // await models.Result.destroy({
      //   where: {}, // Empty condition will delete all rows
      // });

      // Save new results to the database
      await models.Result.bulkCreate(newResults);

      res.status(201).json({
        message: "Results imported successfully",
        importedResults: newResults,
        failedFiles,
      });
    } else {
      res.status(200).json({
        message: "No new results to import",
        failedFiles,
      });
    }
  } catch (error) {
    console.error("Error during database operation:", error);
    res.status(500).json({
      message: "Something went wrong while processing results",
      error: error.message,
    });
  }
}

module.exports = {
    save: save,
    index: index,
    show: show,
    update: update,
    destroy: destroy,
    importResultsFromCSVs: importResultsFromCSVs,
};