const express = require("express");
const accountDetailController = require("../controllers/accountDetail.controller");
const router = express.Router();

router.post("/", accountDetailController.save);
router.get("/", accountDetailController.index);
router.get("/:id", accountDetailController.show);
router.get("/account/:account", accountDetailController.showByACnu);
router.patch("/:id", accountDetailController.update);
router.patch("/account/:account", accountDetailController.updateByACnu);
router.delete("/:id", accountDetailController.destroy);

module.exports = router;