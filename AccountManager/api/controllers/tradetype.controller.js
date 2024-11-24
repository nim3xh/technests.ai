const models = require("../models");

function save(req, res) {
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
};
