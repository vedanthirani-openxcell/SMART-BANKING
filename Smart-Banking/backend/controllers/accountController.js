const Account = require("../models/Account");
const User = require("../models/User");

// Submit KYC request
const submitKYC = async (req, res) => {
  try {
    const { aadhar, pan, dob, address } = req.body;

    if (!aadhar || !pan || !dob || !address) {
      return res.status(400).json({ message: "All KYC fields are required" });
    }


    const existing = await Account.findOne({ user: req.user.user });
    if (existing) {
      return res.status(400).json({ message: "KYC already submitted or account exists" });
    }

    const account = new Account({
      user: req.user.user, 
      kycDetails: { aadhar, pan, dob, address },
      kycStatus: "pending"
    });

    await account.save();
    res.status(201).json({ message: "KYC submitted successfully", account });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Generate account number
const generateAccountNumber = () => {
  return "BANK" + Math.floor(10000000 + Math.random() * 90000000);
};

// Admin updates KYC status
const updateKYCStatus = async (req, res) => {
  try {
    const { status } = req.body;
   
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.kycStatus = status;

    if (status === "approved" && !account.accountNumber) {
      account.accountNumber = generateAccountNumber();
    }

    await account.save();

    // ✅ No change here since account.user is still an ObjectId
    await User.findByIdAndUpdate(account.user, {
      kycStatus: status
    });

    res.json({ message: `KYC ${status} successfully`, account });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitKYC, updateKYCStatus };




