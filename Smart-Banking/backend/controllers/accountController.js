const Account = require("../models/Account");
const User = require("../models/User");
const AccountType = require("../models/AccountType");
const Transaction = require("../models/Transaction");
const sendEmail = require("../utils/emailService");
const { generateAccountStatementPDF } = require("../utils/pdfService");
const bcrypt = require("bcryptjs");

// Submit KYC request
// controllers/kycController.j

// ✅ Submit KYC Request
const submitKYC = async (req, res) => {
  try {
    

    const { aadhar, pan, dob, address, accountType, name, phone } = req.body;

    // 🔒 Mandatory field validation
    if (!aadhar || !pan || !dob || !address || !accountType) {
      return res.status(400).json({
        message: "Aadhar, PAN, DOB, Address, and Account Type are required",
      });
    }

    // 🔎 Fetch account type by name
    const accountTypeData = await AccountType.findOne({ name: accountType });
    if (!accountTypeData) {
      return res.status(404).json({ message: "Account type not found" });
    }

    // 🔎 Check if account already exists for this user
    let existing = await Account.findOne({ user: req.user.user });

    if (existing && existing.kycStatus !== "rejected") {
      return res.status(400).json({
        message: "KYC already submitted or account exists",
      });
    }

    // 🔎 Get user info
    const user = await User.findById(req.user.user).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userEmail = user.email;
    const userName = user.name;

    // 📝 Build KYC details
    const kycDetails = { aadhar, pan, dob, address };
    if (name) kycDetails.name = name;
    if (phone) kycDetails.phone = phone;

    let account;

    // 🔄 Resubmission (when rejected)
    if (existing && existing.kycStatus === "rejected") {
      existing.kycDetails = kycDetails;
      existing.kycStatus = "pending";
      existing.accountType = accountTypeData._id;
      await existing.save();
      account = existing;
    } else {
      // 🆕 First-time submission
      account = new Account({
        user: req.user.user,
        kycDetails,
        kycStatus: "pending",
        accountType: accountTypeData._id,
      });
      await account.save();
    }

    // 🎯 Populate account type
    const populatedAccount = await Account.findById(account._id).populate(
      "accountType",
      "name"
    );

    // 📧 Send email notification
    if (userEmail) {
      const subject =
        existing?.kycStatus === "rejected"
          ? "KYC Resubmitted"
          : "KYC Submitted";
      const body = `Hello ${userName},\n\nYour KYC has been ${
        existing?.kycStatus === "rejected" ? "resubmitted" : "submitted"
      } successfully. Please wait for admin approval.`;

      await sendEmail(userEmail, subject, body);
    }

    res.status(201).json({
      message:
        existing?.kycStatus === "rejected"
          ? "KYC resubmitted successfully"
          : "KYC submitted successfully",
      account: populatedAccount,
    });
  } catch (err) {
    console.error("❌ Error in submitKYC:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitKYC };


// Generate account number
const generateAccountNumber = async () => {
  let accountNumber;
  let exists = true;

  while (exists) {
    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000); // 10-digit number
    const account = await Account.findOne({ accountNumber });
    if (!account) exists = false;
  }

  return accountNumber;
};



const updateKYCStatus = async (req, res) => {
  try {
    const { kycStatus, reason } = req.body;

    if (!["approved", "rejected"].includes(kycStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.kycStatus = kycStatus;

 if (kycStatus === "approved" && !account.accountNumber) {
  account.accountNumber = await generateAccountNumber();
}

if (kycStatus === "rejected") {
  account.accountNumber = null; // remove account number
  account.kycRejectionReason = reason || null;
}

    

    await account.save();

    // Update user's kycStatus in User collection
    const user = await User.findById(account.user).select("name email");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.kycStatus = kycStatus;
    await user.save();

    // Prepare email
    if (user.email && /\S+@\S+\.\S+/.test(user.email)) {
      let subject, text;

      if (kycStatus === "approved") {
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

    res.json({ message: `KYC ${kycStatus} successfully`, account });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listKYCRequests = async (req, res) => {
  try {
    // Parse query params for pagination & filtering
    const page = parseInt(req.query.page) ;
    const limit = parseInt(req.query.limit);
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
      .populate("accountType", "name")
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
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.query.search || "";

    // Base filter: only non-admin users
    const filter = { isAdmin: false };

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("name email") // only include name & email
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
       accountId: account._id,
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
    const { email } = req.body; // 👈 get email from form

    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Find the account
    const account = await Account.findOne({ user: user._id });
    if (!account) {
      return res.status(404).json({ message: "Account not found for this user" });
    }

    // 3. Delete account
    await Account.findByIdAndDelete(account._id);
    await User.findByIdAndDelete(user._id);

    // 4. Optionally mark user as "accountDeleted"
    await User.findByIdAndUpdate(user._id, { kycStatus: "deleted" });

    return res.status(200).json({
      message: `Account for ${email} deleted successfully`,
    });
  } catch (error) {
    console.error("Admin delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// controllers/accountController.js
const downloadAccountStatement = async (req, res) => {
  try {
    const { accountId, startDate, endDate } = req.query;

    if (!accountId) throw new Error("Account ID is required");

    const account = await Account.findById(accountId).populate("user", "name email");
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


const createUserAndAccount = async (req, res) => {
  try {
    const { name, email, password, aadhar, pan, dob, address, accountType, phone } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      aadhar,
      pan,
      dob,
      address,
      accountType,
      phone,
      isAdmin: false,
    });
    await user.save();

    // 4. Generate unique account number
    const accountNumber = await generateAccountNumber();

    // 5. Create account
    const account = new Account({
      user: user._id,
      accountType,
      accountNumber,  // 👈 new field
      kycStatus: "approved",
      kycDetails: {
        address,
        phone,
        dob,
        aadhar,
        pan,
      },
    });
    await account.save();

    // 6. Response
    return res.status(201).json({
      message: "User and account created successfully",
      user,
      account,
    });
  } catch (err) {
    console.error("Error creating user/account:", err);
    return res.status(500).json({
      message: "User creation failed",
      error: err.message,
    });
  }
};






module.exports = {
  submitKYC,
  updateKYCStatus,
  listKYCRequests,
  listUsers,
  getAccountStatement,
  adminUpdateAccount,
  adminDeleteAccount,
  downloadAccountStatement,
  createUserAndAccount
};
