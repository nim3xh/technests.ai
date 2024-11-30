const models = require("../models");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

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
        const requiredColumns = ["Instrument", "Quantity", "Stop loss", "Profit", "Use Breakeven", 
            "Breakeven trigger", "Breakeven Offset", "Use Trail", "Trail Trigger", "Trail", 
            , "Apex ID", "Direction", "Time"];
        
        // Define the list of all columns that are allowed
        const allowedColumns = new Set([
            "TradeName", "Instrument", "Quantity", "Stop loss", "Profit", "Use Breakeven", 
            "Breakeven trigger", "Breakeven Offset", "Use Trail", "Trail Trigger", "Trail", 
            , "Apex ID", "Direction", "Time"
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

        const formattedTrades = sheetData.map((trade) => {
            let timeFormatted;
            try {
                timeFormatted = convertTo24HourFormat(trade["Time"]);
            } catch (error) {
                console.error(`Error converting time for trade: ${JSON.stringify(trade)}, Error: ${error.message}`);
                timeFormatted = null; // Or provide a default value
            }
        
            return {
                TradeName: trade.TradeName || `T${counter++}-${trade["Apex ID"]}`,
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
                ApexId: trade["Apex ID"],
                Direction: trade.Direction,
                Time: timeFormatted,
            };
        });
        
        
        models.Trade.bulkCreate(formattedTrades)
            .then(() => {
                fs.unlinkSync(filePath); // Delete the file after processing
                res.status(201).json({
                    message: "Trades added successfully.",
                });
            })
            .catch((error) => {
                fs.unlinkSync(filePath); // Delete the file even if there's an error
                res.status(500).json({
                    message: "Error processing file."+error.message,
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
        ApexId: req.body.ApexId,
    };

    models.Trade.create(trade)
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
        ApexId: trade.ApexId,
        Direction: trade.Direction,
        Time: convertTo24HourFormat(trade.Time), // Convert time here
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
        ApexId: req.body.ApexId,
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
    index: index,
    show: show,
    update: update,
    destroy: destroy,
    uploadFile: uploadFile,
};
