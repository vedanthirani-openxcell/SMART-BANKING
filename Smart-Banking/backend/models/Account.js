const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  accountNumber: {
    type: String
    // not required here, we can generate later in controller when KYC approved
  },
  ifscCode: {
    type: String,
    default: "BANK0001"
  },
  balance: {
    type: Number,
    default: 1000
  },
  kycDetails: {
    aadhar: String,
    pan: String,
    dob: Date,
    address: String,
    phone: String,
    // later: aadharImage, panImage
  },
  kycStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
   kycRejectionReason: { type: String },
   
  accountType: {  // <--- Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: "AccountType",
   
  }
   
}, { timestamps: true });

module.exports = mongoose.model("Account", accountSchema);

