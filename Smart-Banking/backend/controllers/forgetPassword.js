const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/emailService"); // your existing nodemailer setup

// Temporary in-memory OTP store (replace with DB/Redis for production)
const otpStore = {};

exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not registered" });

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    otpStore[email] = otp;

    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] && otpStore[email].toString() === otp) {
    return res.json({ message: "OTP verified" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not registered" });
   

    user.password = newPassword;
    await user.save();

    delete otpStore[email];
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Password reset failed" });
  }
};
