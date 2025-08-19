const Account = require("../models/Account");
const User = require("../models/User");
const AccountType = require("../models/AccountType");
const Transaction = require("../models/Transaction");
const sendEmail = require("../utils/emailService");
const { generateAccountStatementPDF } = require("../utils/pdfService");



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


const getAccountTypes = async (req, res) => {
  try {
    const accountTypes = await AccountType.find(); // fetch all
    res.status(200).json(accountTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAccountTypes, createAccountTypes };