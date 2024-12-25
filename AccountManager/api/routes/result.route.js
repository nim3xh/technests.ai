const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const resultController = require("../controllers/result.controller");
const verifyToken = require("../utils/verifyUser");
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

router.post("/", verifyToken, resultController.save);
router.post("/add-data", verifyApiKey, resultController.bulkSaveResults);
router.get("/", verifyToken, resultController.index);
router.get('/deleted', verifyToken, resultController.indexDeleted);
router.get("/account/:account", verifyToken, resultController.indexbyAccount);
router.get("/:id", verifyToken, resultController.show);
router.patch("/:id", verifyToken, resultController.update);
router.delete("/:id", verifyToken, resultController.destroy);
router.post("/add-results", upload.array("csvFiles"), resultController.importResultsFromCSVs);

module.exports = router;