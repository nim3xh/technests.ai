const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const usersController = require("../controllers/user.controller");
const verifyToken = require("../utils/verifyUser");
const router = express.Router();

router.post("/", verifyToken, usersController.save);
router.post("/add-user", verifyToken, upload.single("csvFile"), usersController.addUserFromCsv);
router.post("/add-users", verifyToken, upload.array("csvFiles"), usersController.addUsersFromCsv);
router.get("/", usersController.index);
router.get("/:id", verifyToken, usersController.show);
router.get("/account/:accountNumber", verifyToken, usersController.showByAccount);
router.patch("/:id", verifyToken, usersController.update);
router.patch("/account/:accountNumber", verifyToken, usersController.updateByAccount);
router.delete("/:id", verifyToken, usersController.destroy);

module.exports = router;
