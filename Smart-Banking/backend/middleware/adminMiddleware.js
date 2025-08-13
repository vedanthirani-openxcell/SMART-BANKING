const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    // req.user should already be set by authMiddleware after token verification
    const user = await User.findById(req.user.user);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Server error in admin check" });
  }
};

module.exports = adminMiddleware;
