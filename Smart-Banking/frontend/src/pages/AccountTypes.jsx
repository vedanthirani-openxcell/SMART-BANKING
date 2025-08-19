// src/pages/AccountTypes.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api"; // ✅ use your axios instance with token
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AccountTypes = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    interestRate: "",
    minBalance: "",
    overdraftLimit: "",
  });

  // ✅ Fetch all account types
  const fetchAccountTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/accountTypes"); 
      setAccountTypes(res.data);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to load account types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountTypes();
  }, []);

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Create new account type
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/accountTypes", formData); // now using api.js
      setFormData({ name: "", interestRate: "", minBalance: "", overdraftLimit: "" });
      fetchAccountTypes(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || "Error creating account type");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="Account Types" />

        {/* Main Content */}
        <div className="p-6 flex flex-col gap-6">

          {/* Add Account Type Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border rounded shadow w-full max-w-md bg-white"
          >
            <h2 className="text-lg font-semibold mb-4">➕ Add Account Type</h2>

            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2 mb-2 w-full rounded"
              required
            />

            <input
              type="number"
              step="0.01"
              name="interestRate"
              placeholder="Interest Rate (%)"
              value={formData.interestRate}
              onChange={handleChange}
              className="border p-2 mb-2 w-full rounded"
              required
            />

            <input
              type="number"
              name="minBalance"
              placeholder="Minimum Balance"
              value={formData.minBalance}
              onChange={handleChange}
              className="border p-2 mb-2 w-full rounded"
              required
            />

            <input
              type="number"
              name="overdraftLimit"
              placeholder="Overdraft Limit"
              value={formData.overdraftLimit}
              onChange={handleChange}
              className="border p-2 mb-2 w-full rounded"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
            >
              Create
            </button>
          </form>

          {/* Account Types Table */}
          {loading ? (
            <p>Loading account types...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : accountTypes.length === 0 ? (
            <p>No account types found.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300 bg-white shadow rounded">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Interest Rate</th>
                  <th className="border p-2">Min Balance</th>
                  <th className="border p-2">Overdraft Limit</th>
                </tr>
              </thead>
              <tbody>
                {accountTypes.map((type) => (
                  <tr
                    key={type._id}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelected(type)}
                  >
                    <td className="border p-2 text-blue-600 underline">{type.name}</td>
                    <td className="border p-2">{type.interestRate}%</td>
                    <td className="border p-2">{type.minBalance}</td>
                    <td className="border p-2">{type.overdraftLimit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Details Modal */}
          {selected && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow w-96">
                <h2 className="text-xl font-bold mb-4">{selected.name}</h2>
                <p><strong>Interest Rate:</strong> {selected.interestRate}%</p>
                <p><strong>Minimum Balance:</strong> {selected.minBalance}</p>
                <p><strong>Overdraft Limit:</strong> {selected.overdraftLimit}</p>
                <p><strong>Created At:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
                <button
                  onClick={() => setSelected(null)}
                  className="mt-4 bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AccountTypes;
