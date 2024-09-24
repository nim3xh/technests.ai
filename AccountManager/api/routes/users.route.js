const express = require("express");
const usersController = require("../controllers/user.controller");
const router = express.Router();

router.post("/", usersController.save);
router.get("/", usersController.index);
router.get("/:id", usersController.show);
router.get("/account/:accountNumber", usersController.showByAccount);
router.patch("/:id", usersController.update);
router.patch("/account/:accountNumber", usersController.updateByAccount);
router.delete("/:id", usersController.destroy);

module.exports = router;
