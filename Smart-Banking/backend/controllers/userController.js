// controllers/userController.js
const Account = require("../models/Account");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    // Get user data (without password)
    const user = await User.findById(req.user.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get account linked to this user
    const account = await Account.findOne({ user: req.user.user });

    // Return user info + balance (or 0 if no account found)
    res.status(200).json({
      ...user.toObject(),
      balance: account ? account.balance : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
