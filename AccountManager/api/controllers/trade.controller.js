const models = require("../models");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { Op } = require('sequelize');


function uploadFile(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded.",
        });
    }

    const filePath = path.resolve(req.file.path);

    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        // Counter for auto-generating trade names
        let counter = 1;

        // Define the list of required columns
        const requiredColumns = ["TradeName", "Instrument", "Quantity", "Stop loss", "Profit", "Use Breakeven", 
            "Breakeven trigger", "Breakeven Offset", "Use Trail", "Trail Trigger", "Trail"];
        
        // Define the list of all columns that are allowed
        const allowedColumns = new Set([
            "TradeName", "Instrument", "Quantity", "Stop loss", "Profit", "Use Breakeven", 
            "Breakeven trigger", "Breakeven Offset", "Use Trail", "Trail Trigger", "Trail",
        ]);

        // Check if all required columns are present
        const missingColumns = requiredColumns.filter((col) => !sheetData[0].hasOwnProperty(col));
        if (missingColumns.length > 0) {
            return res.status(400).json({
                message: `Missing required columns: ${missingColumns.join(", ")}`,
            });
        }

        // Check if there are any extra columns
        const extraColumns = Object.keys(sheetData[0]).filter((col) => !allowedColumns.has(col));
        if (extraColumns.length > 0) {
            return res.status(400).json({
                message: `Invalid columns found: ${extraColumns.join(", ")}`,
            });
        }

        // Get the trade names from the uploaded data
        const tradeNames = sheetData.map((trade) => trade.TradeName);

        // Delete existing trades with the same TradeName
        models.Trade.destroy({
            where: {
                TradeName: {
                    [Op.in]: tradeNames, // Delete all trades matching the uploaded TradeNames
                },
            },
        })
        .then(() => {
            // Now, format the trades for insertion
            const formattedTrades = sheetData.map((trade) => {
                return {
                    TradeName: trade.TradeName,
                    Instrument: trade.Instrument,
                    Quantity: trade.Quantity,
                    StopLoss: trade["Stop loss"],
                    Profit: trade.Profit,
                    UseBreakeven: trade["Use Breakeven"],
                    BreakevenTrigger: trade["Breakeven trigger"],
                    BreakevenOffset: trade["Breakeven Offset"],
                    UseTrail: trade["Use Trail"],
                    TrailTrigger: trade["Trail Trigger"],
                    Trail: trade.Trail,
                    TradeTypeId: trade.TradeTypeId || null,
                    Repeat : trade.Repeat || false,
                    RepeatTimes : trade.RepeatTimes || 0,
                    RepeatEvery : trade.RepeatEvery || 0,
                    ApexId: null,
                    Direction: trade.Direction,
                };
            });

            // Insert the new data
            return models.Trade.bulkCreate(formattedTrades);
        })
        .then(() => {
            fs.unlinkSync(filePath); // Delete the file after processing
            res.status(201).json({
                message: "Trades added successfully.",
            });
        })
        .catch((error) => {
            fs.unlinkSync(filePath); // Delete the file even if there's an error
            res.status(500).json({
                message: "Error processing file. " + error.message,
                error: error,
            });
        });

    } catch (error) {
        fs.unlinkSync(filePath); // Delete the file in case of error
        res.status(500).json({
            message: "Error processing file.",
            error: error.message,
        });
    }
}

function save(req, res) {
    const tradeName = req.body.TradeName;

    // Check if the trade name already exists in the database
    models.Trade.findOne({
        where: { TradeName: tradeName }
    })
    .then((existingTrade) => {
        if (existingTrade) {
            // If the trade already exists, delete it
            return models.Trade.destroy({
                where: { TradeName: tradeName }
            });
        }
        return null;
    })
    .then(() => {
        // Now, proceed to create the new trade
        const trade = {
            TradeName: req.body.TradeName,
            Instrument: req.body.Instrument,
            Quantity: req.body.Quantity,
            StopLoss: req.body.StopLoss,
            Profit: req.body.Profit,
            UseBreakeven: req.body.UseBreakeven,
            BreakevenTrigger: req.body.BreakevenTrigger,
            BreakevenOffset: req.body.BreakevenOffset,
            UseTrail: req.body.UseTrail,
            TrailTrigger: req.body.TrailTrigger,
            Trail: req.body.Trail,
            TradeTypeId: req.body.TradeTypeId,
            Repeat : req.body.Repeat || false,
            RepeatTimes : req.body.RepeatTimes || 0,
            RepeatEvery : req.body.RepeatEvery || 0,
            ApexId: null,
            Time: null,
        };

        // Create the new trade
        return models.Trade.create(trade);
    })
    .then((result) => {
        res.status(201).json({
            message: "Trade created successfully",
            trade: result,
        });
    })
    .catch((error) => {
        res.status(500).json({
            message: "Something went wrong",
            error: error,
        });
    });
}

function bulkSaveTrades(req, res) {
    const trades = req.body;
  
    if (!Array.isArray(trades) || trades.length === 0) {
      return res.status(400).json({
        message: "Invalid input, an array of trades is required.",
      });
    }
  
    try {
      // Validate and construct trades with all mandatory fields
      const validatedTrades = trades.map((trade, index) => {
        const missingFields = [];
  
        if (!trade.TradeName) missingFields.push("TradeName");
        if (!trade.Instrument) missingFields.push("Instrument");
        if (trade.Quantity === undefined) missingFields.push("Quantity");
        if (trade.StopLoss === undefined) missingFields.push("StopLoss");
        if (trade.Profit === undefined) missingFields.push("Profit");
        if (trade.UseBreakeven === undefined) missingFields.push("UseBreakeven");
        if (trade.BreakevenTrigger === undefined) missingFields.push("BreakevenTrigger");
        if (trade.BreakevenOffset === undefined) missingFields.push("BreakevenOffset");
        if (trade.UseTrail === undefined) missingFields.push("UseTrail");
        if (trade.TrailTrigger === undefined) missingFields.push("TrailTrigger");
        if (trade.Trail === undefined) missingFields.push("Trail");
  
        if (missingFields.length > 0) {
          throw new Error(
            `Record at index ${index} is missing the following fields: ${missingFields.join(
              ", "
            )}`
          );
        }
  
        return {
          TradeName: trade.TradeName,
          Instrument: trade.Instrument,
          Quantity: parseInt(trade.Quantity, 10),
          StopLoss: parseFloat(trade.StopLoss),
          Profit: parseFloat(trade.Profit),
          UseBreakeven: trade.UseBreakeven,
          BreakevenTrigger: parseFloat(trade.BreakevenTrigger),
          BreakevenOffset: parseFloat(trade.BreakevenOffset),
          UseTrail: trade.UseTrail,
          TrailTrigger: parseFloat(trade.TrailTrigger),
          Trail: parseFloat(trade.Trail),
          TradeTypeId: trade.TradeTypeId || null,
          Repeat : trade.Repeat || false,
          RepeatTimes : trade.RepeatTimes || 0,
          RepeatEvery : trade.RepeatEvery || 0,
          ApexId: null,
          Time: null,
        };
      });
  
      // Remove existing trades with the same TradeName and bulk insert new trades
      const tradeNames = validatedTrades.map((trade) => trade.TradeName);
  
      models.Trade.destroy({
        where: { TradeName: tradeNames },
      })
        .then(() =>
          models.Trade.bulkCreate(validatedTrades, { returning: true })
        )
        .then((result) => {
          res.status(201).json({
            message: "Trades created successfully",
            trades: result,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Something went wrong",
            error: error.message,
          });
        });
    } catch (error) {
      res.status(400).json({
        message: "Validation error",
        error: error.message,
      });
    }
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


function saveBulk(req, res) {
    const trades = req.body.trades; // Expecting an array of trades in the request body

    if (!Array.isArray(trades) || trades.length === 0) {
        return res.status(400).json({
            message: "Invalid input, expected an array of trades.",
        });
    }

    

    const formattedTrades = trades.map((trade) => ({
        TradeName: trade.TradeName || null,
        Instrument: trade.Instrument,
        Quantity: trade.Quantity,
        StopLoss: trade.StopLoss,
        Profit: trade.Profit,
        UseBreakeven: trade.UseBreakeven,
        BreakevenTrigger: trade.BreakevenTrigger,
        BreakevenOffset: trade.BreakevenOffset,
        UseTrail: trade.UseTrail,
        TrailTrigger: trade.TrailTrigger,
        Trail: trade.Trail,
        TradeTypeId: trade.TradeTypeId || null,
        Repeat : trade.Repeat || false,
        RepeatTimes : trade.RepeatTimes || 0,
        RepeatEvery : trade.RepeatEvery || 0,
        ApexId: null,
        Direction: trade.Direction,
        Time: null,
    }));

    models.Trade.bulkCreate(formattedTrades)
        .then((result) => {
            res.status(201).json({
                message: "Trades created successfully",
                trades: result,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Something went wrong",
                error: error,
            });
        });
}

function index(req, res) {
    models.Trade.findAll()
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

function show(req, res) {
    const id = req.params.id;
    models.Trade.findByPk(id)
        .then((result) => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({
                    message: "Trade not found",
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

function update(req, res) {
    const id = req.params.id;
    const updatedTrade = {
        TradeName: req.body.TradeName,
        Instrument: req.body.Instrument,
        Quantity: req.body.Quantity,
        StopLoss: req.body.StopLoss,
        Profit: req.body.Profit,
        UseBreakeven: req.body.UseBreakeven,
        BreakevenTrigger: req.body.BreakevenTrigger,
        BreakevenOffset: req.body.BreakevenOffset,
        UseTrail: req.body.UseTrail,
        TrailTrigger: req.body.TrailTrigger,
        Trail: req.body.Trail,
        TradeTypeId: req.body.TradeTypeId,
        Repeat : req.body.Repeat || false,
        RepeatTimes : req.body.RepeatTimes || 0,
        RepeatEvery : req.body.RepeatEvery || 0,
        ApexId: null,
        Time: null,
    };

    models.Trade.update(updatedTrade, { where: { id: id } })
        .then((result) => {
            if (result[0] === 1) {
                res.status(200).json({
                    message: "Trade updated successfully",
                });
            } else {
                res.status(404).json({
                    message: "Trade not found",
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

function destroy(req, res) {
    const id = req.params.id;
    models.Trade.destroy({ where: { id: id } })
        .then((result) => {
            if (result === 1) {
                res.status(200).json({
                    message: "Trade deleted successfully",
                });
            } else {
                res.status(404).json({
                    message: "Trade not found",
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
    saveBulk: saveBulk,
    bulkSaveTrades: bulkSaveTrades,
    index: index,
    show: show,
    update: update,
    destroy: destroy,
    uploadFile: uploadFile,
};
