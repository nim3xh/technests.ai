const models = require("../models");

function save(req, res) { 
    const trade = {
        SL: req.body.SL,
        TP: req.body.TP,
        Instrument: req.body.Instrument,
        Quantity: req.body.Quantity,
        TrailingSL: req.body.TrailingSL,
        Steps: req.body.Steps,
        BreakEven: req.body.BreakEven
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
        SL: req.body.SL,
        TP: req.body.TP,
        Instrument: req.body.Instrument,
        Quantity: req.body.Quantity,
        TrailingSL: req.body.TrailingSL,
        Steps: req.body.Steps,
        BreakEven: req.body.BreakEven
    };

    models.Trade.update(updatedTrade, { where: { id: id } })
        .then((result) => {
            res.status(200).json({
                message: "Trade updated successfully",
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

function destroy(req, res) {
    const id = req.params.id;
    models.Trade.destroy({ where: { id: id } })
        .then((result) => {
            res.status(200).json({
                message: "Trade deleted successfully",
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

module.exports = {
    save: save,
    index: index,
    show: show,
    update: update,
    destroy: destroy
}