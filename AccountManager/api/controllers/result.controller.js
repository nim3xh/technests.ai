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

// Function to process a single CSV file and extract result data
const processResultCSV = (filePath) => {
    return new Promise((resolve, reject) => {
      const results = [];
  
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Perform necessary data extraction and validation
          const result = {
            ResultTime: data.ResultTime || null,
            FileName: data.FileName || null,
            TradeCount: data.TradeCount ? parseInt(data.TradeCount, 10) : 0,
            Account: data.Account || null,
            Instrument: data.Instrument || null,
            Quantity: data.Quantity ? parseInt(data.Quantity, 10) : 0,
            Profit: data.Profit ? parseFloat(data.Profit.replace(/,/g, '')) : 0.0,
            StopLoss: data.StopLoss ? parseFloat(data.StopLoss.replace(/,/g, '')) : 0.0,
            TradeTime: data.TradeTime || null,
            Direction: data.Direction || null,
            EntryTime: data.EntryTime || null,
            EntryPrice: data.EntryPrice ? parseFloat(data.EntryPrice.replace(/,/g, '')) : 0.0,
            ExitTime: data.ExitTime || null,
            ExitPrice: data.ExitPrice ? parseFloat(data.ExitPrice.replace(/,/g, '')) : 0.0,
            Result: data.Result || null,
            Comment: data.Comment || null,
          };
  
          // Add any additional validation if necessary
          if (result.Account && result.Instrument) {
            results.push(result);
          }
        })
        .on("end", () => {
          console.log(`File processed successfully: ${filePath}`);
          resolve(results);
        })
        .on("error", (error) => {
          console.error(`Failed to process file: ${filePath}`, error);
          resolve([]); // Return an empty array in case of error
        });
    });
  };
  
  // Main function to import results from multiple CSV files
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
        attributes: ["TradeTime", "Account", "Instrument"],
        raw: true,
      });
      const existingResultsSet = new Set(
        existingResults.map(
          (res) => `${res.TradeTime}-${res.Account}-${res.Instrument}`
        )
      );
  
      // Filter results to only include new entries
      const newResults = allResults.filter(
        (result) =>
          !existingResultsSet.has(
            `${result.TradeTime}-${result.Account}-${result.Instrument}`
          )
      );
  
      // Save new results to the database
      if (newResults.length > 0) {
        await models.Result.bulkCreate(newResults);
      }
  
      res.status(201).json({
        message: "Results imported successfully",
        importedResults: newResults,
        failedFiles,
      });
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong while processing results",
        error: error,
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