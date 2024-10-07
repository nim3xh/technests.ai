const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const userCredentialsController = require("../controllers/userCredentials.controller");
const verifyToken = require("../utils/verifyUser");
const router = express.Router();

router.post("/", verifyToken, userCredentialsController.save);
router.get("/", verifyToken, userCredentialsController.index);
router.post("/change-password",verifyToken, userCredentialsController.changePassword);

module.exports = router;
