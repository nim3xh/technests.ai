const models = require('../models');

function save(req, res) {
  const accountDetail = {
    account: req.body.account,
    accountBalance: req.body.accountBalance,
    accountName: req.body.accountName,
    status: req.body.status
  };

  models.AccountDetail.create(accountDetail)
    .then((result) => {
      res.status(201).json({
        message: 'Account created successfully',
        accountDetail: result
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Something went wrong',
        error: error
      });
    });
}

function show(req, res) { 
    const id = req.params.id;
    models.AccountDetail.findByPk(id)
        .then((result) => {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
            message: 'Account not found'
            });
        }
        })
        .catch((error) => {
        res.status(500).json({
            message: 'Something went wrong',
            error: error
        });
        });
}

function index(req, res) { 
    models.AccountDetail.findAll()
        .then((result) => {
        res.status(200).json(result);
        })
        .catch((error) => {
        res.status(500).json({
            message: 'Something went wrong',
            error: error
        });
        });
}

function update(req, res) { 
    const id = req.params.id;
    const updatedAccountDetail = {
        account: req.body.account,
        accountBalance: req.body.accountBalance,
        accountName: req.body.accountName,
        status: req.body.status
    };

    models.AccountDetail.update(updatedAccountDetail, { where: { id: id } })
        .then((result) => {
        res.status(200).json({
            message: 'Account updated successfully',
            accountDetail: updatedAccountDetail
        });
        })
        .catch((error) => {
        res.status(500).json({
            message: 'Something went wrong',
            error: error
        });
        });
}

function destroy(req, res) { 
    const id = req.params.id;
    models.AccountDetail.destroy({ where: { id: id } })
        .then((result) => {
        res.status(200).json({
            message: 'Account deleted successfully'
        });
        })
        .catch((error) => {
        res.status(500).json({
            message: 'Something went wrong',
            error: error
        });
        });
}

module.exports = {
    save: save,
    show: show,
    index: index,
    update: update,
    destroy: destroy
};