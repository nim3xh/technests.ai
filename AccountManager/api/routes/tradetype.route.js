const express = require("express");
const tradetypeController = require("../controllers/tradetype.controller");
const verifyToken = require("../utils/verifyUser");
const router = express.Router();

router.post("/", tradetypeController.save);
router.get("/", verifyToken, tradetypeController.index);
router.get("/:id", verifyToken, tradetypeController.show);
router.put("/:id", verifyToken, tradetypeController.update);
router.delete("/:id", verifyToken, tradetypeController.destroy);
router.post("/seed", tradetypeController.savebulk);

module.exports = router;
