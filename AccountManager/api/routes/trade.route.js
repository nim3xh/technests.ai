const express = require("express");
const tradeController = require("../controllers/trade.controller");
const verifyToken = require("../utils/verifyUser");
const multer = require("multer"); // For handling file uploads

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" }); // Temporary storage directory

const router = express.Router();


// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query['x-api-key'];
    const validApiKey = 'sachins_data';

    if (!apiKey) {
        return res.status(403).send({ message: 'API key is missing.' });
    }
    if (apiKey !== validApiKey) {
        return res.status(401).send({ message: 'Invalid API key.' });
    }
    next();
};

router.post("/", verifyToken, tradeController.save);
router.post("/add-data", verifyApiKey, tradeController.bulkSaveTrades);
router.post("/bulk", tradeController.saveBulk);
router.post("/upload", upload.single("file"), tradeController.uploadFile); // New route for file upload
router.get("/", verifyToken, tradeController.index);
router.get("/info", verifyApiKey, tradeController.index);
router.get("/index", tradeController.index);
router.get("/:id", verifyToken, tradeController.show);
router.patch("/:id", verifyToken, tradeController.update);
router.delete("/:id", verifyToken, tradeController.destroy);

module.exports = router;
