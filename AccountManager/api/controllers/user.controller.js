const models = require("../models");

function save(req, res) {
  const user = {
    accountNumber: req.body.accountNumber,
    name: req.body.name,
  };

  models.User.create(user)
    .then((result) => {
      res.status(201).json({
        message: "User created successfully",
        user: result,
      });
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
  models.User.findByPk(id)
    .then((result) => {
      if (result) {
        res.status(200).json(result);
      }else{
        res.status(404).json({
          message: "User not found",
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

function index(req, res) {
  models.User.findAll()
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

function update(req, res) {
  const id = req.params.id;
  const UpdatedUser = {
    accountNumber: req.body.accountNumber,
    name: req.body.name,
  };

  models.User.update(UpdatedUser, { where: { id: id } }).then((result) => { 
    res.status(200).json({
      message: "User updated successfully",
      user: result,
    });
  }).catch((error) => {
    res.status(500).json({
      message: "Something went wrong",
      error: error,
    });
  });
}

function destroy(req, res) {
  const id = req.params.id;
  models.User.destroy({ where: { id: id } })
    .then((result) => {
      res.status(200).json({
        message: "User deleted successfully",
        user: result,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    });
}

// get account details by account number
function showByAccount(req, res) {
  const account = req.params.account;
  models.User.findOne({ where: { accountNumber: account } })
    .then((result) => {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({
          message: "User not found",
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
  show: show,
  index: index,
  update: update,
  destroy: destroy,
  showByAccount: showByAccount,
};
