const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // for hashing passwords

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 1000, // starting balance
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  kycStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  kycData: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
});

// 🔹 Pre-save hook for hashing password
userSchema.pre("save", async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified("password")) return next();

  try {
    // Generate salt & hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);



