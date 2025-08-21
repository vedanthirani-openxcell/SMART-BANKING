import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import api from "../api/api";

const UserStatement = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/users/accounts/statements",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch statements");

        setAccount(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStatements();
  }, []);

  const handleDownload = async (accountId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await api.get(`/users/download-statement?accountId=${accountId}`, {
        headers,
        responseType: "blob",
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

  // Helper to determine Credit or Debit
  const getCreditDebit = (tx) => {
    if (tx.balanceAfterTransaction > tx.balanceBeforeTransaction) return "Credit";
    return "Debit";
  };

  return (
    <div className="flex">
      <Sidebar role="user" />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="Account Statements" />

        <div className="p-6">
          {loading ? (
            <p>Loading statements...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : !account ? (
            <p>No account found.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Account Number: {account.accountNumber}
                </h2>
                <button
                  onClick={() => handleDownload(account.accountId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download Statement
                </button>
              </div>

              {account.statement.length === 0 ? (
                <p>No transactions found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Counterparty</th>
                        <th className="p-3">Balance Before</th>
                        <th className="p-3">Balance After</th>
                        <th className="p-3">Credit/Debit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account.statement.map((tx, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{new Date(tx.date).toLocaleString()}</td>
                          <td className="p-3 capitalize">{tx.type}</td>
                          <td className="p-3">₹{tx.amount}</td>
                          <td className="p-3">{tx.description}</td>
                          <td className="p-3">{tx.toAccount?.userName || tx.fromAccount?.userName || "N/A"}</td>
                          <td className="p-3">₹{tx.balanceBeforeTransaction}</td>
                          <td className="p-3">₹{tx.balanceAfterTransaction}</td>
                          <td className="p-3">{getCreditDebit(tx)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserStatement;
