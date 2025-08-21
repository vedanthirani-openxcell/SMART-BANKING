import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const KYCForm = () => {
  const [formData, setFormData] = useState({
    aadhar: "",
    pan: "",
    dob: "",
    address: "",
    accountType: "",
    fullName: "",
    phoneNumber: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Client-side validation for required fields
    const { aadhar, pan, dob, address, accountType } = formData;
    if (!aadhar || !pan || !dob || !address || !accountType) {
      setError("All mandatory fields are required");
      setMessage("");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "KYC submission failed");

      setMessage("KYC submitted successfully!");
      setError("");
      setFormData({
        aadhar: "",
        pan: "",
        dob: "",
        address: "",
        accountType: "",
        fullName: "",
        phoneNumber: "",
      });
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  return (
    <div className="flex">
      <Sidebar role="user" />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="KYC Submission" />

        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold mb-4">Submit Your KYC</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Aadhar */}
              <input
                type="text"
                name="aadhar"
                placeholder="Aadhar Number *"
                value={formData.aadhar}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              {/* PAN */}
              <input
                type="text"
                name="pan"
                placeholder="PAN Number *"
                value={formData.pan}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              {/* DOB */}
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              {/* Address */}
              <textarea
                name="address"
                placeholder="Address *"
                value={formData.address}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              {/* Account Type */}
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Account Type *</option>
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Salary Account">Salary Account</option>
                <option value ="fix-deposit">Fix Deposit</option>  
            
              </select>

              {/* Optional: Full Name */}
              <input
                type="text"
                name="fullName"
                placeholder="Full Name (Optional)"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* Optional: Phone Number */}
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number (Optional)"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  type="reset"
                  onClick={() =>
                    setFormData({
                      aadhar: "",
                      pan: "",
                      dob: "",
                      address: "",
                      accountType: "",
                      fullName: "",
                      phoneNumber: "",
                    })
                  }
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>

            {/* Success & Error messages */}
            {message && (
              <p className="mt-4 text-green-600 font-semibold">{message}</p>
            )}
            {error && (
              <p className="mt-4 text-red-600 font-semibold">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCForm;
