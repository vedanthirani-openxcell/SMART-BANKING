import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const KYC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    aadhar: "",
    pan: "",
    dob: "",
    address: "",
    accountType: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Just await the call; don't destructure if you don't use data
      await api.post("/users/kyc", form);

      alert("KYC Submitted Successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Submit KYC</h2>

        {["aadhar", "pan", "dob", "address", "accountType"].map((field) => (
          <input
            key={field}
            type={field === "dob" ? "date" : "text"}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full p-3 rounded-lg font-semibold text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default KYC;

