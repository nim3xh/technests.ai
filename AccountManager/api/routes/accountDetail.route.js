const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const accountDetailController = require("../controllers/accountDetail.controller");
const verifyToken = require("../utils/verifyUser");
const router = express.Router();

router.post("/", verifyToken, accountDetailController.save);
router.post("/add-account", verifyToken, upload.single("csvFile"), accountDetailController.importFromCSV);
router.post("/add-accounts", verifyToken, upload.array("csvFiles"), accountDetailController.importFromCSVs);
router.post('/add-acc-auto', upload.array("csvFiles"), accountDetailController.importFromCSVs);
router.get("/", verifyToken, accountDetailController.index);
router.get("/:id", verifyToken, accountDetailController.show);
router.get("/account/:account", verifyToken, accountDetailController.showByACnu);
router.patch("/:id", verifyToken, accountDetailController.update);
router.patch("/account/:account", verifyToken, accountDetailController.updateByACnu);
router.delete("/:id", verifyToken, accountDetailController.destroy);
router.delete("/", accountDetailController.destroyAll);
router.delete('/auto-delete', accountDetailController.destroyAll);

module.exports = router;