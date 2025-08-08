// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route
router.get("/me", authMiddleware, getProfile);

module.exports = router;
