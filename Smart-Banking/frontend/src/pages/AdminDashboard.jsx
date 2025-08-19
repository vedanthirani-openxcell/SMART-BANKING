import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import api from "../api/api"; // axios instance

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingKYC: 0,
    totalAccounts: 0,
    totalTransactions: 0,
  });

  const [approvedAccounts, setApprovedAccounts] = useState([]); // Store approved KYC users

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all users
        const usersRes = await api.get("/admin/users", { headers });

        // Fetch pending KYC requests
        const kycPendingRes = await api.get("/admin/kyc-requests?status=pending", { headers });

        // Fetch approved KYC requests → accounts list
        const kycApprovedRes = await api.get("/admin/kyc-requests?status=approved", { headers });

        // Fetch transactions
        const transactionsRes = await api.get("/admin/transactions", { headers });

        // Extract stats
        const totalUsers = usersRes.data?.total || usersRes.data?.users?.length || 0;
        const pendingKYC = kycPendingRes.data?.total || kycPendingRes.data?.length || 0;
        const totalAccounts = kycApprovedRes.data?.total || kycApprovedRes.data?.accounts?.length || 0;
        const totalTransactions =
          transactionsRes.data?.totalTransactions ||
          transactionsRes.data?.total ||
          transactionsRes.data?.transactions?.length ||
          0;

        // Save approved accounts (list of users with accounts)
        setApprovedAccounts(kycApprovedRes.data?.accounts || []);

        setStats({
          totalUsers,
          pendingKYC,
          totalAccounts,
          totalTransactions,
        });
      } catch (err) {
        console.error("Error fetching stats:", err.response?.data || err.message);
      }
    };

    fetchStats();
  }, []);

  // Handle statement download using accountId
  const downloadStatement = async (accountId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await api.get(`/users/download-statement?accountId=${accountId}`, {
        headers,
        responseType: "blob", // important for PDF
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `statement_${accountId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading statement:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="Admin Dashboard" />

        {/* Stats Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Total Users" value={stats.totalUsers} />
          <Card title="Pending KYC" value={stats.pendingKYC} />
          <Card title="Accounts" value={stats.totalAccounts} />
          <Card title="Transactions" value={stats.totalTransactions} />
        </div>

        {/* Approved Accounts Table */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Approved Accounts</h2>
          <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Account Type</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedAccounts.length > 0 ? (
                approvedAccounts.map((account) => (
                  <tr key={account._id} className="border-b">
                    <td className="p-3">{account.user?.name || "N/A"}</td>
                    <td className="p-3">{account.user?.email || "N/A"}</td>
                    <td className="p-3">{account.accountType?.name || account.accountType || "N/A"}</td>
                    <td className="p-3">₹{account.balance || 0}</td>
                    <td className="p-3">
                      <button
                        onClick={() => downloadStatement(account._id)} // <-- send accountId
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Download Statement
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center">
                    No approved accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
