const Account = require("../models/Account");
const User = require("../models/User");
const AccountType = require("../models/AccountType");
const Transaction = require("../models/Transaction");
const sendEmail = require("../utils/emailService");
const { generateAccountStatementPDF } = require("../utils/pdfService");

// Submit KYC request
const submitKYC = async (req, res) => {
  try {
    console.log("Submit KYC called with body:", req.body);

    const { aadhar, pan, dob, address, accountType } = req.body;

    if (!aadhar || !pan || !dob || !address || !accountType) {
      return res
        .status(400)
        .json({ message: "All KYC fields and account type are required" });
    }

    const accountTypeData = await AccountType.findOne({ name: accountType });
    if (!accountTypeData) {
      return res.status(404).json({ message: "Account type not found" });
    }

    let existing = await Account.findOne({ user: req.user.user });

    if (existing && existing.kycStatus !== "rejected") {
      return res
        .status(400)
        .json({ message: "KYC already submitted or account exists" });
    }

    // Get user info from DB to ensure we have email and name
    const user = await User.findById(req.user.user).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userEmail = user.email;
    const userName = user.name;

    if (existing && existing.kycStatus === "rejected") {
      existing.kycDetails = { aadhar, pan, dob, address };
      existing.kycStatus = "pending";
      existing.accountType = accountTypeData._id;
      await existing.save();

      const populatedAccount = await Account.findById(existing._id).populate(
        "accountType",
        "name"
      );

      // Send email only if email exists
      if (userEmail) {
        await sendEmail(
          userEmail,
          "KYC Resubmitted",
          `Hello ${userName},\n\nYour KYC has been resubmitted successfully. Please wait for admin approval.`
        );
      }

      return res.status(200).json({
        message: "KYC resubmitted successfully",
        account: populatedAccount,
      });
    }

    // If no existing account or rejected
    const account = new Account({
      user: req.user.user,
      kycDetails: { aadhar, pan, dob, address },
      kycStatus: "pending",
      accountType: accountTypeData._id,
    });

    await account.save();

    const populatedAccount = await Account.findById(account._id).populate(
      "accountType",
      "name"
    );

    // Send email only if email exists
    if (userEmail) {
      await sendEmail(
        userEmail,
        "KYC Submitted",
        `Hello ${userName},\n\nYour KYC has been submitted successfully. Please wait for admin approval.`
      );
    }

    res.status(201).json({
      message: "KYC submitted successfully",
      account: populatedAccount,
    });
  } catch (err) {
    console.error("Error in submitKYC:", err);
    res.status(500).json({ message: err.message });
  }
};


// Generate account number
const generateAccountNumber = () => {
  return "BANK" + Math.floor(10000000 + Math.random() * 90000000);
};
const updateKYCStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.kycStatus = status;

    if (status === "approved" && !account.accountNumber) {
      account.accountNumber = generateAccountNumber();
    }

    if (status === "rejected") {
      account.accountNumber = null; // remove account number
      account.kycRejectionReason = reason || null;
    }

    await account.save();

    // Update user's kycStatus in User collection
    const user = await User.findById(account.user).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.kycStatus = status;
    await user.save();

    // Prepare email
    if (user.email && /\S+@\S+\.\S+/.test(user.email)) {
      let subject, text;

      if (status === "approved") {
        subject = "KYC Approved ✅";
        text = `Hello ${user.name},\n\nYour KYC has been approved successfully!\nYour account number is: ${account.accountNumber}\n\nThank you for banking with us.`;
      } else {
        subject = "KYC Rejected ❌";
        text = `Hello ${user.name},\n\nYour KYC has been rejected.\nReason: ${reason || "Not specified"}\n\nPlease contact support for further assistance.`;
      }

      try {
        await sendEmail(user.email, subject, text);
      } catch (err) {
        console.error("Error sending KYC status email:", err);
      }
    }

    res.json({ message: `KYC ${status} successfully`, account });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listKYCRequests = async (req, res) => {
  try {
    // Parse query params for pagination & filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // optional: pending, approved, rejected

    const filter = {};
    if (status) {
      filter.kycStatus = status;
    }

    // Count total matching docs for pagination metadata
    const total = await Account.countDocuments(filter);

    // Fetch accounts with user info, pagination, sorted by newest first
    const accounts = await Account.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      accounts,
    });
  } catch (err) {
    console.error("Error fetching KYC requests:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const kycStatus = req.query.kycStatus;

    // Build filter object
    const filter = {};

    if (kycStatus && ["pending", "approved", "rejected"].includes(kycStatus)) {
      filter.kycStatus = kycStatus;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password") // exclude password field
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      users,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const createAccountTypes = async (req, res) => {
  try {
    const { name, interestRate, overdraftLimit, minBalance } = req.body;

    if (!name || !minBalance || interestRate === undefined) {
      return res
        .status(400)
        .json({ message: "Name and interest rate are required" });
    }

    // Check if already exists
    const exists = await AccountType.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Account type already exists" });
    }

    const accountType = new AccountType({
      name,
      interestRate,
      overdraftLimit,
      minBalance,
    });

    await accountType.save();
    res
      .status(201)
      .json({ message: "Account type created successfully", accountType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAccountStatement = async (req, res) => {
  try {
    const userId = req.user.user;

    // Step 1: Check user and KYC
    const user = await User.findById(userId).select("kycStatus");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.kycStatus !== "approved")
      return res.status(403).json({ message: "KYC not approved." });

    // Step 2: Parse date range (default: all time)
    const fromDate = req.query.fromDate
      ? new Date(req.query.fromDate)
      : new Date("1970-01-01");
    const toDate = req.query.toDate ? new Date(req.query.toDate) : new Date();

    // Step 3: Get user's single account
    const account = await Account.findOne({ user: userId }).select(
      "_id accountNumber balance"
    );
    if (!account) return res.status(404).json({ message: "No account found." });

    // Step 4: Fetch transactions for this account
    const transactions = await Transaction.find({
      $or: [{ fromAccount: account._id }, { toAccount: account._id }],
      createdAt: { $gte: fromDate, $lte: toDate },
    }).sort({ createdAt: 1 }); // oldest first

    // Step 5: Compute balance before and after each transaction
    let balanceBefore = 1000;
    const firstTransactionBefore = await Transaction.findOne({
      $or: [{ fromAccount: account._id }, { toAccount: account._id }],
      createdAt: { $lt: fromDate },
    }).sort({ createdAt: -1 });

    if (firstTransactionBefore)
      balanceBefore = firstTransactionBefore.balanceAfterTransaction;

    const statement = transactions.map((txn) => {
      const before = balanceBefore;
      const after =
        txn.fromAccount && txn.fromAccount.equals(account._id)
          ? balanceBefore - txn.amount
          : balanceBefore + txn.amount;

      balanceBefore = after; // update for next transaction

      return {
        date: txn.createdAt,
        type: txn.type,
        amount: txn.amount,
        description: txn.description,
        balanceBeforeTransaction: before,
        balanceAfterTransaction: after,
      };
    });

    // Step 6: Send response
    res.status(200).json({
      accountNumber: account.accountNumber,
      statement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

// Admin: Update a user's account
const adminUpdateAccount = async (req, res) => {
  try {
    const accountId = req.params.id;
    const account = await Account.findById(accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // Whitelist fields admin can update
    const allowedUpdates = [
      "kycDetails",
      "accountType",
      "kycStatus",
      "balance",
      "kycRejectionReason",
    ];

    // Update only allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        account[key] = req.body[key];
      }
    });

    // If KYC approved and accountNumber missing, generate it
    if (account.kycStatus === "approved" && !account.accountNumber) {
      account.accountNumber =
        "BANK" + Math.floor(10000000 + Math.random() * 90000000);
      account.kycRejectionReason = null; // clear rejection reason
    }

    // If KYC rejected, clear account number
    if (account.kycStatus === "rejected") {
      account.accountNumber = null;
    }

    await account.save();

    // Sync user's KYC status in User model
    await User.findByIdAndUpdate(account.user, {
      kycStatus: account.kycStatus,
    });

    res.status(200).json({
      message: "Account updated successfully by admin",
      account,
    });
  } catch (error) {
    console.error("Admin update account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const adminDeleteAccount = async (req, res) => {
  try {
    const accountId = req.params.id;

    // Find the account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Delete the account
    await Account.findByIdAndDelete(accountId);

    // Optionally, you can update user's KYC status or delete the user as well
    await User.findByIdAndUpdate(account.user, { kycStatus: "deleted" });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Admin delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const downloadAccountStatement = async (req, res) => {
  try {
    const { accountNumber, startDate, endDate } = req.query;

    const account = await Account.findOne({ accountNumber }).populate("user", "name email");
    if (!account) throw new Error("Account not found");

    const filter = {
      $or: [
        { fromAccount: account._id },
        { toAccount: account._id }
      ]
    };

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    await generateAccountStatementPDF(account, transactions, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  submitKYC,
  updateKYCStatus,
  listKYCRequests,
  listUsers,
  createAccountTypes,
  getAccountStatement,
  adminUpdateAccount,
  adminDeleteAccount,
  downloadAccountStatement
};
