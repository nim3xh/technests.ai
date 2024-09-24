const express = require("express");
const usersController = require("../controllers/user.controller");
const router = express.Router();

router.post("/", usersController.save);

module.exports = router;