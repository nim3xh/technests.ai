const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const userCredentialsController = require("../controllers/userCredentials.controller");
const verifyToken = require("../utils/verifyUser");
const router = express.Router();

router.post("/", verifyToken, userCredentialsController.save);
router.patch("/:id", verifyToken, userCredentialsController.update);
router.get("/",verifyToken, userCredentialsController.index);
router.put("/change-password", verifyToken, userCredentialsController.changePassword);
router.patch("/:email", verifyToken, userCredentialsController.updateUserByEmail);
router.delete("/:id", verifyToken, userCredentialsController.destroy);

module.exports = router;
