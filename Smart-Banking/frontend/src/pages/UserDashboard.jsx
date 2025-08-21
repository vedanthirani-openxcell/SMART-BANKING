import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import api from "../api/api";

const UserDashboard = () => {
  const [userStats, setUserStats] = useState({
    totalAccounts: 0,
    totalBalance: 0,
    totalTransactions: 0,
    kycStatus: "pending",
  });

  const [accountNumbers, setAccountNumbers] = useState([]); // ⚡ added

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch user profile for balance & KYC
        const profileRes = await api.get("/users/me", { headers });
        const { balance, kycStatus = "pending" } = profileRes.data;

        // Fetch transactions
        const transactionsRes = await api.get("/users/history", { headers });
        const transactions = transactionsRes.data.transactions || [];
        const accountIds = [...new Set(transactions.map((t) => t.accountId))];

        // ⚡ Fetch accounts (same as UserStatement)
        const accountsRes = await api.get("/users/accounts/statements", { headers });
        setAccountNumbers([accountsRes.data.accountNumber]); 

        setUserStats({
          totalAccounts: accountIds.length,
          totalBalance: balance,
          totalTransactions: transactions.length,
          kycStatus,
        });
      } catch (err) {
        console.error("Error fetching user data:", err.response?.data || err.message);
      }
    };

    fetchUserData();
  }, []);

 

  return (
    <div className="flex">
      <Sidebar role="user" />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="User Dashboard" />

        {/* Stats Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Account Number" value={accountNumbers.join(", ") || "N/A"} /> {/* ⚡ added */}
          <Card title="Total Accounts" value={userStats.totalAccounts} />
          <Card title="Total Balance" value={`₹${userStats.totalBalance}`} />
          <Card title="Transactions" value={userStats.totalTransactions} />
          <Card title="KYC Status" value={userStats.kycStatus} />
        </div>
       
      </div>
    </div>
  );
};

export default UserDashboard;
