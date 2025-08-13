const Account = require("../models/Account");
const User = require("../models/User");
const AccountType = require("../models/AccountType");


// Submit KYC request


    // Find existing Account for user
   const submitKYC = async (req, res) => {
  try {
    console.log("Submit KYC called with body:", req.body);

    const { aadhar, pan, dob, address, accountType } = req.body;

    if (!aadhar || !pan || !dob || !address || !accountType) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All KYC fields and account type are required" });
    }

    const accountTypeData = await AccountType.findOne({ name: accountType });
    console.log("Found accountTypeData:", accountTypeData);

    if (!accountTypeData) {
      return res.status(404).json({ message: "Account type not found" });
    }

    const existing = await Account.findOne({ user: req.user.user });
    console.log("Existing account:", existing);

    if (existing && existing.kycStatus !== "rejected") {
      return res.status(400).json({ message: "KYC already submitted or account exists" });
    }

    if (existing && existing.kycStatus === "rejected") {
      existing.kycDetails = { aadhar, pan, dob, address };
      existing.kycStatus = "pending";
      existing.accountType = accountTypeData._id;
      await existing.save();

      const populatedAccount = await Account.findById(existing._id).populate('accountType', 'name');

      return res.status(200).json({ message: "KYC resubmitted successfully", account: populatedAccount });
    }

    const account = new Account({
      user: req.user.user,
      kycDetails: { aadhar, pan, dob, address },
      kycStatus: "pending",
      accountType: accountTypeData._id
    });

    await account.save();

    const populatedAccount = await Account.findById(account._id).populate('accountType', 'name');

    res.status(201).json({
      message: "KYC submitted successfully",
      account: populatedAccount
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
      account.accountNumber = null; // ✅ remove it if rejected
      account.kycRejectionReason = reason || null;
    }

    await account.save();

    await User.findByIdAndUpdate(account.user, {
      kycStatus: status
    });

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
        { email: { $regex: search, $options: "i" } }
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
 const createAccountTypes = async (req,res) =>{
          try {
    const { name, interestRate, overdraftLimit, minBalance } = req.body;

    if (!name || !minBalance|| interestRate === undefined) {
      return res.status(400).json({ message: "Name and interest rate are required" });
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
      minBalance
    });

    await accountType.save();
    res.status(201).json({ message: "Account type created successfully", accountType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
 };

module.exports = { submitKYC, updateKYCStatus ,listKYCRequests,listUsers,createAccountTypes};




