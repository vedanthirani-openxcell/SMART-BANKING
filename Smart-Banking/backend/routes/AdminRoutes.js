const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { updateKYCStatus, listKYCRequests ,listUsers,createAccountTypes} = require("../controllers/accountController");

// Existing route for updating KYC status
router.put("/kyc/:id", authMiddleware, adminMiddleware, updateKYCStatus);

// New route for listing KYC requests
router.get("/kyc-requests", authMiddleware, adminMiddleware, listKYCRequests);
router.get("/users", authMiddleware, adminMiddleware, listUsers);
 router.post("/accountTypes",authMiddleware,adminMiddleware,createAccountTypes);
module.exports = router;

