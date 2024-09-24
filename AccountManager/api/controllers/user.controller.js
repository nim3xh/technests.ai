const models = require('../models');

function save(req, res) {
  const user = {
    accountNumber: req.body.accountNumber,
    name:req.body.name
  };

  models.User.create(user).then(result => {
    res.status(201).json({
      message: "User created successfully",
      user: result
    });
  }).catch(error => { 
    res.status(500).json({
      message: "Something went wrong",
      error: error
    });
  });
}
module.exports = {
  save: save
}
