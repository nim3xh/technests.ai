const models = require("../models");

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
    index: index,
    show: show,
    update: update,
    destroy: destroy,
};
