const express = require("express");
const tradeController = require("../controllers/trade.controller");
const verifyToken = require("../utils/verifyUser");
const router = express.Router();

router.post("/", verifyToken, tradeController.save);
router.get("/", verifyToken, tradeController.index);
router.get("/:id", verifyToken, tradeController.show);
router.patch("/:id", verifyToken, tradeController.update);
router.delete("/:id", verifyToken, tradeController.destroy);

module.exports = router;
