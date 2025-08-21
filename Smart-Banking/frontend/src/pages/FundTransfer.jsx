import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";

const FundTransfer = () => {
  const [formType, setFormType] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userAccountNumber, setUserAccountNumber] = useState("");

  // ✅ Fetch user account number when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/accounts/statements", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setUserAccountNumber(data.accountNumber); // assuming backend returns accountNumber
        } else {
          setError(data.message || "Failed to fetch account info");
        }
      } catch (err) {
        setError("Error fetching account info",err);
      }
    };

    fetchUserData();
  }, []);

  const resetFormData = (type) => {
    if (type === "deposit" || type === "withdraw") {
      setFormData({
        accountNumber: userAccountNumber, // ✅ auto-fill
        amount: "",
        description: "",
      });
    } else if (type === "transfer") {
      setFormData({
        fromAccountNumber: userAccountNumber, // ✅ auto-fill
        toAccountNumber: "",
        amount: "",
        description: "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let url = "";
    if (formType === "deposit") url = "http://localhost:5000/api/users/deposit";
    if (formType === "withdraw") url = "http://localhost:5000/api/users/withdraw";
    if (formType === "transfer") url = "http://localhost:5000/api/users/transfer";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Transaction failed");

      setMessage(`${formType.toUpperCase()} Successful!`);
      setError("");
      resetFormData(formType);
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  return (
    <div className="flex">
      <Sidebar role="user" />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="Fund Transfer" />

        {/* Cards Section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="cursor-pointer transform hover:scale-105 transition duration-200"
            onClick={() => {
              setFormType("deposit");
              resetFormData("deposit");
            }}
          >
            <Card title="Deposit" />
          </div>
          <div
            className="cursor-pointer transform hover:scale-105 transition duration-200"
            onClick={() => {
              setFormType("withdraw");
              resetFormData("withdraw");
            }}
          >
            <Card title="Withdraw" />
          </div>
          <div
            className="cursor-pointer transform hover:scale-105 transition duration-200"
            onClick={() => {
              setFormType("transfer");
              resetFormData("transfer");
            }}
          >
            <Card title="Transfer" />
          </div>
          <div className="cursor-not-allowed opacity-60">
            <Card title="Future Transfer" />
          </div>
        </div>

        {/* Inline Form Section */}
        {formType && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4 capitalize border-b pb-2">
                {formType} Form
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Deposit / Withdraw → accountNumber */}
                {(formType === "deposit" || formType === "withdraw") && (
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    readOnly // ✅ cannot edit
                    className="w-full border p-3 rounded bg-gray-100 cursor-not-allowed"
                  />
                )}

                {/* Transfer → from + to account */}
                {formType === "transfer" && (
                  <>
                    <input
                      type="text"
                      name="fromAccountNumber"
                      value={formData.fromAccountNumber}
                      readOnly // ✅ cannot edit
                      className="w-full border p-3 rounded bg-gray-100 cursor-not-allowed"
                    />
                    <input
                      type="text"
                      name="toAccountNumber"
                      placeholder="To Account Number"
                      value={formData.toAccountNumber}
                      onChange={handleChange}
                      className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </>
                )}

                {/* Amount */}
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />

                {/* Description */}
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border p-3 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType(null);
                      setMessage("");
                      setError("");
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Submit
                  </button>
                </div>
              </form>

              {/* Messages */}
              {message && (
                <p className="mt-4 text-green-600 font-semibold">{message}</p>
              )}
              {error && (
                <p className="mt-4 text-red-600 font-semibold">{error}</p>
              )}
            </div>
          </div>
        )}

        {!formType && (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg">
              Select an option above to perform a transaction
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundTransfer;
