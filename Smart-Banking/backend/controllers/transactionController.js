const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const sendEmail = require("../utils/emailService");
const User=require("../models/User");

exports.transferFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fromAccountNumber, toAccountNumber, amount, description } =
      req.body;

    if (!fromAccountNumber || !toAccountNumber || !amount) {
      throw new Error("All fields are required.");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0.");
    }

    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
    })
      .populate("user", "name email")
      .session(session);

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber })
      .populate("user", "name email")
      .session(session);

    if (!fromAccount || !toAccount) {
      throw new Error("Account not found.");
    }

    if (
      fromAccount.kycStatus !== "approved" ||
      toAccount.kycStatus !== "approved"
    ) {
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

    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          fromAccount: fromAccount._id,
          fromUserName: fromAccount.user.name,
          toAccount: toAccount._id,
          toUserName: toAccount.user.name,
          amount,
          description:
            description ||
            `Transfer from ${fromAccountNumber} to ${toAccountNumber}`,
          status: "success",
          type: "transfer",
        },
      ],
      { session }
    );

    // Email to sender
    const senderSubject = "Funds Transferred Successfully";
    const senderText = `Hello ${fromAccount.user.name},

An amount of ₹${amount} has been transferred from your account (${fromAccountNumber}) to ${
      toAccount.user.name
    } (${toAccountNumber}).

Description: ${description || "Transfer"}
Updated Balance: ₹${fromAccount.balance}

Thank you for banking with us!
`;
    await sendEmail(fromAccount.user.email, senderSubject, senderText);

    // Email to receiver
    const receiverSubject = "Funds Received Successfully";
    const receiverText = `Hello ${toAccount.user.name},

An amount of ₹${amount} has been credited to your account (${toAccountNumber}) from ${
      fromAccount.user.name
    } (${fromAccountNumber}).

Description: ${description || "Transfer"}
Updated Balance: ₹${toAccount.balance}

Thank you for banking with us!
`;
    await sendEmail(toAccount.user.email, receiverSubject, receiverText);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Transfer successful.",
      transaction: transaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || "Server error." });
  }
};
exports.depositFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.user; // logged-in user
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    // Get logged-in user's account
    const account = await Account.findOne({ user: userId })
      .populate("user", "name email")
      .session(session);

    if (!account) {
      throw new Error("Account not found.");
    }
    if (account.kycStatus !== "approved") {
      throw new Error("Account KYC must be approved.");
    }

    // Add balance
    account.balance += amount;
    await account.save({ session });

    const subject = "Deposit Successful";
    const text = `Hello ${account.user.name},

An amount of ₹${amount} has been deposited to your account (${account.accountNumber}).

Description: ${description || "Deposit"}
Updated Balance: ₹${account.balance}

Thank you for banking with us!
`;
    await sendEmail(account.user.email, subject, text);

    // Record transaction
    const transaction = await Transaction.create(
      [
        {
          fromAccount: null,
          toAccount: account._id,
          toUserName: account.user.name,
          amount,
          description: description || `Deposit to account ${account.accountNumber}`,
          status: "success",
          type: "deposit",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Deposit successful.", transaction: transaction[0] });
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
    const userId = req.user.user; // logged-in user
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const account = await Account.findOne({ user: userId })
      .populate("user", "name email")
      .session(session);

    if (!account) throw new Error("Account not found.");
    if (account.kycStatus !== "approved") throw new Error("Account KYC must be approved.");
    if (account.balance < amount) throw new Error("Insufficient balance.");

    // Deduct balance
    account.balance -= amount;
    await account.save({ session });

    const subject = "Withdrawal Successful";
    const text = `Hello ${account.user.name},

An amount of ₹${amount} has been withdrawn from your account (${account.accountNumber}).

Description: ${description || "Withdrawal"}
Updated Balance: ₹${account.balance}

Thank you for banking with us!
`;
    await sendEmail(account.user.email, subject, text);

    const transaction = await Transaction.create(
      [
        {
          fromAccount: account._id,
          fromUserName: account.user.name,
          toAccount: null,
          amount,
          description: description || `Withdrawal from account ${account.accountNumber}`,
          status: "success",
          type: "withdrawal",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Withdrawal successful.", transaction: transaction[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || "Server error." });
  }
};


exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.user;
    const user = await User.findById(userId).select("kycStatus");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.kycStatus !== "approved") {
      return res
        .status(403)
        .json({ message: "KYC not approved. Please complete verification." });
    }

    // Step 1: Parse query params with defaults
    const page = parseInt(req.query.page) ;
    const limit = parseInt(req.query.limit) ;
    const type = req.query.type; // optional: deposit, withdrawal, transfer
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null;

    // Step 2: Find all accounts belonging to this user
    const userAccounts = await Account.find({ user: userId }).select(
      "_id accountNumber"
    );
    if (!userAccounts.length) {
      return res.status(404).json({ message: "No accounts found for user" });
    }
    const userAccountIds = userAccounts.map((acc) => acc._id);

    // Step 3: Build transaction query to find transactions where
    // fromAccount OR toAccount is in user's accounts
    const query = {
      $or: [
        { fromAccount: { $in: userAccountIds } },
        { toAccount: { $in: userAccountIds } },
      ],
    };

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Filter by date range if provided
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = fromDate;
      if (toDate) query.createdAt.$lte = toDate;
    }

    // Step 4: Fetch total count for pagination metadata
    const totalTransactions = await Transaction.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalTransactions / limit);

    // Fetch transactions with pagination and sort by newest first
    // Also populate the accountNumber for fromAccount and toAccount
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "fromAccount",
        select: "accountNumber",
      })
      .populate({
        path: "toAccount",
        select: "accountNumber",
      });

    // Step 5: Format response transactions (add userName fields from stored fields)
    const formattedTransactions = transactions.map((txn) => ({
      _id: txn._id,
      fromAccount: txn.fromAccount
        ? {
            accountNumber: txn.fromAccount.accountNumber,
            userName: txn.fromUserName,
          }
        : null,
      toAccount: txn.toAccount
        ? {
            accountNumber: txn.toAccount.accountNumber,
            userName: txn.toUserName,
          }
        : null,
      amount: txn.amount,
      type: txn.type,
      status: txn.status,
      description: txn.description,
      createdAt: txn.createdAt,
    }));

    // Step 6: Send response
    res.status(200).json({
      page,
      limit,
      totalTransactions,
      totalPages,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
// For Admin: Get ALL transactions
exports.getAllTransactions = async (req, res) => {
  try {
    // Step 1: Parse query params with defaults
    const page = parseInt(req.query.page) ;
    const limit = parseInt(req.query.limit) ;
    const type = req.query.type;
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null;

    // Step 2: Build query for all transactions
    const query = {};
    if (type) query.type = type;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = fromDate;
      if (toDate) query.createdAt.$lte = toDate;
    }

    // Step 3: Get total count
    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / limit);

    // Step 4: Fetch with pagination, populate accounts
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "fromAccount",
        select: "accountNumber user",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "toAccount",
        select: "accountNumber user",
        populate: { path: "user", select: "name email" },
      });

    // Step 5: Format
    const formattedTransactions = transactions.map((txn) => ({
      _id: txn._id,
      fromAccount: txn.fromAccount
        ? {
            accountNumber: txn.fromAccount.accountNumber,
            userName: txn.fromAccount.user?.name,
          }
        : null,
      toAccount: txn.toAccount
        ? {
            accountNumber: txn.toAccount.accountNumber,
            userName: txn.toAccount.user?.name,
          }
        : null,
      amount: txn.amount,
      type: txn.type,
      status: txn.status,
      description: txn.description,
      createdAt: txn.createdAt,
    }));

    res.status(200).json({
      page,
      limit,
      totalTransactions,
      totalPages,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};
