const mongoose = require("mongoose");

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
  // NEW: KYC Status
  kycStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  // NEW: Store submitted KYC details (like documents, address, etc.)
  kycData: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("User", userSchema);


