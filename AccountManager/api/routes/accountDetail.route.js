const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const accountDetailController = require("../controllers/accountDetail.controller");
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

router.post("/", verifyToken, accountDetailController.save);
router.post("/add-data", verifyApiKey, accountDetailController.bulkSave);
router.post("/add-account", verifyToken, upload.single("csvFile"), accountDetailController.importFromCSV);
router.post("/add-accounts", verifyToken, upload.array("csvFiles"), accountDetailController.importFromCSVs);
router.post('/add-acc-auto', upload.array("csvFiles"), accountDetailController.importFromCSVs);
router.get("/", verifyToken, accountDetailController.index);
router.get("/info", verifyApiKey, accountDetailController.index);
router.get("/index", accountDetailController.index);
router.get('/viewDeleted', verifyToken,accountDetailController.indexDeleted);
router.get('/viewDeleted/:account', verifyToken,accountDetailController.indexDeletedbyAccNu);
router.get("/:id", verifyToken, accountDetailController.show);
router.get("/account/:account", verifyToken, accountDetailController.showByACnu);
router.get("/accCrate/:account", accountDetailController.showByACnu);
router.get("/info/:account", verifyApiKey, accountDetailController.showByACnu);
router.patch("/:id", verifyToken, accountDetailController.update);
router.patch("/account/:account", verifyToken, accountDetailController.updateByACnu);
router.delete("/:id", verifyToken, accountDetailController.destroy);
router.delete("/", accountDetailController.destroyAll);
router.delete('/auto-delete', accountDetailController.destroyAll);
router.delete("/account/:account",accountDetailController.destroyByACnu);
 
module.exports = router;