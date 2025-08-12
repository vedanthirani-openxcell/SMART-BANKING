const express = require("express");
const router = express.Router();
const { updateKYCStatus } = require("../controllers/accountController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Admin updates KYC status
router.put("/kyc/:id", authMiddleware, adminMiddleware, updateKYCStatus);

module.exports = router;

