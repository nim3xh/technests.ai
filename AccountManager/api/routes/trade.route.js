const express = require("express");
const tradeController = require("../controllers/trade.controller");
const verifyToken = require("../utils/verifyUser");
const multer = require("multer"); // For handling file uploads

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" }); // Temporary storage directory

const router = express.Router();

router.post("/", verifyToken, tradeController.save);
router.post("/bulk", tradeController.saveBulk);
router.post("/upload", upload.single("file"), tradeController.uploadFile); // New route for file upload
router.get("/", verifyToken, tradeController.index);
router.get("/:id", verifyToken, tradeController.show);
router.patch("/:id", verifyToken, tradeController.update);
router.delete("/:id", verifyToken, tradeController.destroy);

module.exports = router;
