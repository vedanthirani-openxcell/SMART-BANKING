import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/api";

const ManualByAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "",
    address: "",
    phone: "",
    dob: "",
    aadhar: "",
    pan: "",
  });

  const [deleteEmail, setDeleteEmail] = useState(""); // for delete form

  const accountTypes = [
    { _id: "689b29d26809b18eb89fdcd8", name: "Savings" },
    { _id: "689b2c9b6809b18eb89fdce8", name: "Fix Deposit" },
    { _id: "689b2cc46809b18eb89fdcec", name: "Current" },
    { _id: "68a42e9798d7818d3de2105e", name: "Salary Account" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create user + account
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/admin/create-user-account", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data.message || "User and KYC created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        accountType: "",
        address: "",
        phone: "",
        dob: "",
        aadhar: "",
        pan: "",
      });
    } catch (err) {
      console.error("Error creating user/account:", err.response?.data || err.message);
      alert(err.response?.data?.message || "User creation failed");
    }
  };

  // Delete account by email
  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await api.delete(`/admin/account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { email: deleteEmail }, // 👈 send email in request body
      });

      alert(res.data.message || "Account deleted successfully!");
      setDeleteEmail("");
    } catch (err) {
      console.error("Error deleting account:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Account deletion failed");
    }
  };

  return (
    <div className="flex">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="Manual Account & KYC Management" />

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create User & Account */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Create User & Account</h2>
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg shadow-md w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-gray-700">Account Type</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Select Type</option>
                    {accountTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>

                {/* PAN */}
                <div>
                  <label className="block text-gray-700">PAN</label>
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="PAN Number"
                    required
                  />
                </div>

                {/* Aadhaar */}
                <div>
                  <label className="block text-gray-700">Aadhaar</label>
                  <input
                    type="text"
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Aadhaar Number"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Create User & Account
                </button>
              </div>
            </form>
          </div>

          {/* Delete Account */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
            <form
              onSubmit={handleDelete}
              className="bg-white p-6 rounded-lg shadow-md w-full"
            >
              <div>
                <label className="block text-gray-700">Enter Email</label>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualByAdmin;
