const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

exports.transferFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fromAccountNumber, toAccountNumber, amount, description } = req.body;

    if (!fromAccountNumber || !toAccountNumber || !amount) {
      throw new Error("All fields are required.");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0.");
    }

    const fromAccount = await Account.findOne({ accountNumber: fromAccountNumber }).populate("user", "name").session(session);
    const toAccount = await Account.findOne({ accountNumber: toAccountNumber }).populate("user", "name").session(session);

    if (!fromAccount || !toAccount) {
      throw new Error("Account not found.");
    }

    if (fromAccount.kycStatus !== "approved" || toAccount.kycStatus !== "approved") {
      throw new Error("Both accounts must have approved KYC.");
    }

    if (fromAccount.balance < amount) {
      throw new Error("Insufficient balance.");
    }

    // Update balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save({ session });
    await toAccount.save({ session });

    // Optionally update user balance if you keep that there (but generally avoid duplication)
    await fromAccount.user.save({ session });
    await toAccount.user.save({ session });

    // Create transaction record
    const transaction = await Transaction.create([{
      fromAccount: fromAccount._id,
      fromUserName: fromAccount.user.name,
      toAccount: toAccount._id,
      toUserName: toAccount.user.name,
      amount,
      description: description || `Transfer from ${fromAccountNumber} to ${toAccountNumber}`,
      status: "success"
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Transfer successful.",
      transaction: transaction[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(400).json({ message: error.message || "Server error." });
  }
};
exports.depositFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accountNumber, amount, description } = req.body;

    if (!accountNumber || !amount) {
      throw new Error("Account number and amount are required.");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const account = await Account.findOne({ accountNumber }).populate("user", "name").session(session);
    if (!account) {
      throw new Error("Account not found.");
    }

    if (account.kycStatus !== "approved") {
      throw new Error("Account KYC must be approved.");
    }

    // Add balance
    account.balance += amount;
    await account.save({ session });
      

    // Record transaction
    const transaction = await Transaction.create([{
      fromAccount: null, // no sender for deposit
      toAccount: account._id,
      toUserName: account.user.name,
      amount,
      description: description || `Deposit to account ${accountNumber}`,
      status: "success",
      type: "deposit"
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Deposit successful.",
      transaction: transaction[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || "Server error." });
  }
};
exports.withdrawFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accountNumber, amount, description } = req.body;

    if (!accountNumber || !amount) {
      throw new Error("Account number and amount are required.");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const account = await Account.findOne({ accountNumber }).populate("user", "name").session(session);
    if (!account) {
      throw new Error("Account not found.");
    }

    if (account.kycStatus !== "approved") {
      throw new Error("Account KYC must be approved.");
    }

    if (account.balance < amount) {
      throw new Error("Insufficient balance.");
    }

    // Subtract balance
    account.balance -= amount;
    await account.save({ session });
      
    // Record transaction
    const transaction = await Transaction.create([{
      fromAccount: account._id,
      toAccount: null, // no receiver for withdrawal
      fromUserName: account.user.name,
      amount,
      description: description || `Withdrawal from account ${accountNumber}`,
      status: "success",
      type: "withdrawal"
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Withdrawal successful.",
      transaction: transaction[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || "Server error." });
  }
};


