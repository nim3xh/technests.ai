const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.put("/change-password", authController.changePassword);
router.post("/signout", authController.signout);

module.exports = router;