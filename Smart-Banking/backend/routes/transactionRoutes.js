// routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const { transferFunds ,depositFunds,withdrawFunds} = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware"); // if using authentication


router.post("/deposit", authMiddleware, depositFunds);
router.post("/withdraw", authMiddleware, withdrawFunds);
router.post("/transfer", authMiddleware, transferFunds);

module.exports = router;
