const models = require('../models');

function save(req, res){
    const tradeData = {
        Direction: req.body.Direction,
        Quantity: req.body.Quantity,
        Time: req.body.Time,
        Stop_Loss: req.body.Stop_Loss,
        Profit: req.body.Profit,
        Use_Breakeven: req.body.Use_Breakeven,
        Breakeven_Trigger: req.body.Breakeven_Trigger,
        Breakeven_Offset: req.body.Breakeven_Offset,
        Use_Trail: req.body.Use_Trail,
        Trail_Trigger: req.body.Trail_Trigger,
        Trail: req.body.Trail,
        Instrument: req.body.Instrument,
        Repeat: req.body.Repeat,
        Repeat_Times: req.body.Repeat_Times,
        Repeat_Every: req.body.Repeat_Every,
        Account_Number: req.body.Account_Number
    };

    models.TradeData.create(tradeData)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while creating the TradeData.'
        });
    });
}

function index(req, res){
    models.TradeData.findAll()
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while retrieving TradeData.'
        });
    });
}

function show(req, res){
    const id = req.params.id;

    models.TradeData.findByPk(id)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || `Error retrieving TradeData with id=${id}.`
        });
    });
}

function update(req, res){
    const id = req.params.id;

    models.TradeData.update(req.body, {
        where: { id: id }
    })
    .then(num => {
        if (num == 1){
            res.send({
                message: 'TradeData was updated successfully.'
            });
        } else {
            res.send({
                message: `Cannot update TradeData with id=${id}. Maybe TradeData was not found or req.body is empty!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || `Error updating TradeData with id=${id}.`
        });
    });
}

function destroy(req, res){
    const id = req.params.id;

    models.TradeData.destroy({
        where: { id: id }
    })
    .then(num => {
        if (num == 1){
            res.send({
                message: 'TradeData was deleted successfully!'
            });
        } else {
            res.send({
                message: `Cannot delete TradeData with id=${id}. Maybe TradeData was not found!`
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || `Could not delete TradeData with id=${id}.`
        });
    });
}

function destroyAll(req, res){
    models.TradeData.destroy({
        where: {},
        truncate: true
    })
    .then(nums => {
        res.send({ message: `${nums} TradeData were deleted successfully!` });
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || 'Some error occurred while removing all TradeData.'
        });
    });
}

function tradeDataByAccount(req, res) {
    const accountNumber = req.params.account_number;

    if (!accountNumber) {
        return res.status(400).json({
            message: "Account number parameter is missing",
        });
    }

    const account = accountNumber.replace(/APEX-/, "").split(" ")[0];

    models.TradeData.findAll({
        where: models.sequelize.where(
            models.sequelize.literal(`
                CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(Account_Number, 'APEX-', -1), '-', 1) AS UNSIGNED)
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
    destroyAll: destroyAll,
    tradeDataByAccount: tradeDataByAccount
};
