import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import DownloadStatementButton from "../components/DownloadStatementButton"; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser ] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState("deposit");

  const fetchUser  = async () => {
    try {
      const { data } = await api.get("/users/me");
      setUser (data);
    } catch (err) {
      console.error(err);
      alert("Please login first");
      navigate("/login");
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await api.get("users/history");
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser ();
    fetchTransactions();
  }, );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleTransaction = async () => {
    const body = {
      amount,
      description,
      accountNumber: user.accountNumber, // Assuming user has an accountNumber
    };

    try {
      if (transactionType === "deposit") {
        await api.post("/transactions/deposit", body);
      } else if (transactionType === "withdraw") {
        await api.post("/transactions/withdraw", body);
      } else if (transactionType === "transfer") {
        // Assuming you have a field for the recipient's account number
        const recipientAccountNumber = prompt("Enter recipient's account number:");
        await api.post("/transactions/transfer", { ...body, toAccountNumber: recipientAccountNumber });
      }
      alert("Transaction successful!");
      fetchTransactions(); // Refresh transactions
    } catch (err) {
      console.error(err);
      alert("Transaction failed. Please try again.");
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Account Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500">
          <p className="text-gray-500">kyc request</p>
          <p className={`text-lg font-semibold mt-2 ${user.kycStatus === "approved" ? "text-green-600" : "text-yellow-500"}`}>
            {user.kycStatus || "Not Submitted"}
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-green-500">
          <p className="text-gray-500">Account Type</p>
          <p className="text-lg font-semibold mt-2">{user.accountType || "-"}</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-purple-500">
          <p className="text-gray-500">Balance</p>
          <p className="text-lg font-semibold mt-2">₹{user.balance || 0}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No recent transactions</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Type</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 capitalize">{tx.type}</td>
                  <td className="py-2 px-4">₹{tx.amount}</td>
                  <td className="py-2 px-4">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <div className="flex flex-col">
          <select onChange={(e) => setTransactionType(e.target.value)} className="mb-2">
            <option value="deposit">Deposit Funds</option>
            <option value="withdraw">Withdraw Funds</option>
            <option value="transfer">Transfer Funds</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded mb-2"
          />
          <button
            onClick={handleTransaction}
            className="bg-blue-500 text-white p-4 rounded-xl shadow-lg hover:bg-blue-600 transition"
          >
            Execute Transaction
          </button>
        </div>
        <DownloadStatementButton />
      </div>
    </div>
  );
};

export default Dashboard;
