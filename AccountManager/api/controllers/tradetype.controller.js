const models = require("../models");

function save(req, res) {
    if (!req.body.TypeName) {
        return res.status(400).json({
            message: "TypeName is required",
        });
    }

    const tradeType = {
        TypeName: req.body.TypeName,
    };

    models.TradeType.create(tradeType)
        .then((result) => {
            res.status(201).json({
                message: "TradeType created successfully",
                tradeType: result,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: "Something went wrong",
                error: error,
            });
        });
}

function savebulk(req, res) {
    const tradeTypes = req.body; // Expecting an array of objects or a single object

    // Check if the input is an array
    if (Array.isArray(tradeTypes)) {
        // Validate each entry in the array
        const invalidEntries = tradeTypes.filter((item) => !item.TypeName || item.TypeName.trim() === "");

        if (invalidEntries.length > 0) {
            return res.status(400).json({
                message: "All entries must have a valid TypeName.",
                invalidEntries,
            });
        }

        // Perform bulk insert
        models.TradeType.bulkCreate(tradeTypes)
            .then((result) => {
                res.status(201).json({
                    message: "TradeTypes created successfully",
                    tradeTypes: result,
                });
            })
            .catch((error) => {
                res.status(500).json({
                    message: "Something went wrong",
                    error: error,
                });
            });
    } else {
        // Handle single entry
        if (!tradeTypes.TypeName || tradeTypes.TypeName.trim() === "") {
            return res.status(400).json({
                message: "TypeName is required.",
            });
        }

        const tradeType = {
            TypeName: tradeTypes.TypeName,
        };

        models.TradeType.create(tradeType)
            .then((result) => {
                res.status(201).json({
                    message: "TradeType created successfully",
                    tradeType: result,
                });
            })
            .catch((error) => {
                res.status(500).json({
                    message: "Something went wrong",
                    error: error,
                });
            });
    }
}



function index(req, res) {
    models.TradeType.findAll()
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
    models.TradeType.findByPk(id)
        .then((result) => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({
                    message: "TradeType not found",
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
    const updatedTradeType = {
        TypeName: req.body.TypeName,
    };

    models.TradeType.update(updatedTradeType, { where: { id: id } })
        .then((result) => {
            if (result[0] === 1) {
                res.status(200).json({
                    message: "TradeType updated successfully",
                });
            } else {
                res.status(404).json({
                    message: "TradeType not found",
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
    models.TradeType.destroy({ where: { id: id } })
        .then((result) => {
            if (result === 1) {
                res.status(200).json({
                    message: "TradeType deleted successfully",
                });
            } else {
                res.status(404).json({
                    message: "TradeType not found",
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
    index: index,
    show: show,
    update: update,
    destroy: destroy,
    savebulk: savebulk,
};
