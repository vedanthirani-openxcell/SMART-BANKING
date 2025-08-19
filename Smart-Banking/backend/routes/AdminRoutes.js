const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { updateKYCStatus, listKYCRequests ,listUsers,submitKYC,adminUpdateAccount,adminDeleteAccount} = require("../controllers/accountController");
const {createAccountTypes,getAccountTypes} = require("../controllers/AccountTypes");
const { getAllTransactions } = require("../controllers/transactionController");


// Existing route for updating KYC status
router.patch("/kyc/:id", authMiddleware, adminMiddleware, updateKYCStatus);

// New route for listing KYC requests
router.get("/kyc-requests", authMiddleware, adminMiddleware, listKYCRequests);
router.get("/users", authMiddleware, adminMiddleware, listUsers);

 router.post("/accountTypes",authMiddleware,adminMiddleware,createAccountTypes);
  router.get("/accountTypes",authMiddleware,adminMiddleware,getAccountTypes);
    router.get("/transactions",authMiddleware,adminMiddleware,getAllTransactions);


 router.patch("/account/:id", authMiddleware, adminMiddleware, adminUpdateAccount);
 router.delete("/account/:id", authMiddleware, adminMiddleware, adminDeleteAccount);
  router.post("/kyc", authMiddleware,adminMiddleware, submitKYC);

module.exports = router;

