const express = require("express");
const usersController = require("../controllers/user.controller");
const router = express.Router();

router.get("/", usersController.index);

module.exports = router;