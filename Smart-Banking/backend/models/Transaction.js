const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: function() { return this.type !== "deposit"; }
  },
  fromUserName: {
    type: String,
    required: function() { return this.type !== "deposit"; }
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: function() { return this.type !== "withdrawal"; }
  },
  toUserName: {
    type: String,
    required: function() { return this.type !== "withdrawal"; }
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success"
  },
  description: String,
  type: {
    type: String,
    enum: ["transfer", "deposit", "withdrawal"],
    default: "transfer"
  },
  balanceAfterTransaction: { // NEW FIELD
    type: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);





