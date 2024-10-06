const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const accountDetailController = require("../controllers/accountDetail.controller");
const verifyToken = require("../utils/verifyUser");
const router = express.Router();

router.post("/", accountDetailController.save);
router.post("/add-account", upload.single("csvFile"), accountDetailController.importFromCSV);
router.post("/add-accounts", upload.array("csvFiles"), accountDetailController.importFromCSVs);
router.get("/", accountDetailController.index);
router.get("/:id", accountDetailController.show);
router.get("/account/:account", accountDetailController.showByACnu);
router.patch("/:id", accountDetailController.update);
router.patch("/account/:account", accountDetailController.updateByACnu);
router.delete("/:id", accountDetailController.destroy);
router.delete("/", accountDetailController.destroyAll);
module.exports = router;