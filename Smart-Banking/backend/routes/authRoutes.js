const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const forgotPasswordController = require("../controllers/forgetPassword");


router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPasswordController.requestOTP);
router.post("/verify-otp", forgotPasswordController.verifyOTP);
router.post("/reset-password", forgotPasswordController.resetPassword);

module.exports = router;

