// routes/accountRoutes.js
const express = require("express");
const router = express.Router();
const { submitKYC, updateKYCStatus } = require("../controllers/accountController");
const authMiddleware = require("../middleware/authMiddleware");

// User submits KYC
router.post("/kyc", authMiddleware, submitKYC);

// Admin updates KYC status
router.put("/kyc/:id", authMiddleware, updateKYCStatus);

module.exports = router;
