import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/api";

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Get current user
        const userRes = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userRes.data);

        // 2️⃣ Get transactions
        const txRes = await api.get("/users/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(txRes.data.transactions || []); // adjust if API shape is different
      } catch (err) {
        console.error(
          "Error fetching data:",
          err.response?.data || err.message
        );
      }
    };

    fetchData();
  }, []);

  const getInOut = (tx) => {
    if (tx.type === "deposit") return "Credit";
    if (tx.type === "withdrawal") return "Debit";
    if (tx.type === "transfer" && currentUser) {
      if (tx.toAccount?.userName === currentUser.name) return "Credit";
      if (tx.fromAccount?.userName === currentUser.name) return "Debit";
    }
    return "-";
  };

  return (
    <div className="flex">
      <Sidebar role="user" />

      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="Transactions" />

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">My Transactions</h2>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-200 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">From</th>
                  <th className="px-4 py-2 text-left">To</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">In/Out</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="border-t">
                      <td className="px-4 py-2">
                        {tx.fromAccount?.userName || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {tx.toAccount?.userName || "N/A"}
                      </td>
                      <td className="px-4 py-2 capitalize">{tx.type}</td>
                      <td className="px-4 py-2">₹{tx.amount}</td>
                      <td className="px-4 py-2">{tx.description}</td>
                      <td className="px-4 py-2">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            tx.status === "success"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{getInOut(tx)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTransactions;
