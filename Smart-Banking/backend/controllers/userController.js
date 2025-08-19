// controllers/userController.js
const Account = require("../models/Account");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    // req.user comes from authMiddleware (decoded JWT)
    const user = await User.findById(req.user.user).select("-password"); // hide password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
