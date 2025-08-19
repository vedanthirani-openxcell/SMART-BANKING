// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const  {getProfile}  = require("../controllers/userController");
const { submitKYC,getAccountStatement,downloadAccountStatement} = require("../controllers/accountController");
const authMiddleware = require("../middleware/authMiddleware");
const { transferFunds ,depositFunds,withdrawFunds,getTransactionHistory} = require("../controllers/transactionController");

// Protected route
router.get("/me", authMiddleware, getProfile);
router.post("/kyc", authMiddleware, submitKYC);
router.get('/accounts/statements', authMiddleware, getAccountStatement);
router.get("/download-statement", downloadAccountStatement);

router.post("/deposit", authMiddleware, depositFunds);
router.post("/withdraw", authMiddleware, withdrawFunds);
router.post("/transfer", authMiddleware, transferFunds);
router.get("/history",authMiddleware,getTransactionHistory);
module.exports = router;
