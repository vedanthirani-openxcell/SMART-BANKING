// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const  {getProfile}  = require("../controllers/userController");
const { submitKYC,getAccountStatement,downloadAccountStatement} = require("../controllers/accountController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route
router.get("/me", authMiddleware, getProfile);
router.post("/kyc", authMiddleware, submitKYC);
router.get('/accounts/statements', authMiddleware, getAccountStatement);
router.get("/download-statement", downloadAccountStatement);
module.exports = router;
