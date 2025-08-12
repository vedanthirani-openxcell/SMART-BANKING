const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: function() {
      return this.type !== "deposit"; // required except for deposits
    }
  },
  fromUserName: {
    type: String,
    required: function() {
      return this.type !== "deposit"; // required except for deposits
    }
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: function() {
      return this.type !== "withdrawal"; // required except for withdrawals
    }
  },
  toUserName: {
    type: String,
    required: function() {
      return this.type !== "withdrawal"; // required except for withdrawals
    }
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
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);



