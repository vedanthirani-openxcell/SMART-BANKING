// models/AccountType.js
const mongoose = require("mongoose");

const accountTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Savings, Current, FD
  interestRate: { type: Number, required :true}, // Annual %
  minBalance: { type: Number,required : true},
  overdraftLimit: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("AccountType", accountTypeSchema);
