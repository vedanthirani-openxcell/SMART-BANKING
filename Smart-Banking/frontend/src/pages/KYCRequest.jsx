import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/api";

const KycRequest = () => {
  const [kycList, setKycList] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    aadhar: "",
    pan: "",
    dob: "",
    address: "",
  });

  // Fetch KYC requests
  useEffect(() => {
    const fetchKycRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/admin/kyc-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && Array.isArray(res.data.accounts)) {
          setKycList(res.data.accounts);
        } else {
          setKycList([]);
        }
      } catch (err) {
        console.error("Error fetching KYC requests:", err);
        setKycList([]);
      }
    };
    fetchKycRequests();
  }, []);

  // Update KYC Status
  const handleUpdateStatus = async (accountId, status) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const body = { kycStatus: status };

      if (status === "rejected") {
        const reason = prompt("Enter rejection reason:") || "Not specified";
        body.kycRejectionReason = reason;
      }

      const res = await api.patch(`/admin/kyc/${accountId}`, body, { headers });

      alert(res.data.message || "KYC updated successfully");

      setKycList((prev) =>
        prev.map((acc) =>
          acc._id === accountId
            ? { ...acc, kycStatus: status, kycRejectionReason: body.kycRejectionReason }
            : acc
        )
      );

      if (selectedAccount?._id === accountId) {
        setSelectedAccount((prev) => ({
          ...prev,
          kycStatus: status,
          kycRejectionReason: body.kycRejectionReason,
        }));
      }
    } catch (err) {
      console.error("Error updating KYC status:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update KYC status");
    }
  };

  // Open details
  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setShowUpdateForm(false);
    setFormData({
      name: account.user?.name || "",
      email: account.user?.email || "",
      aadhar: account.kycDetails?.aadhar || "",
      pan: account.kycDetails?.pan || "",
      dob: account.kycDetails?.dob
        ? new Date(account.kycDetails.dob).toISOString().split("T")[0]
        : "",
      address: account.kycDetails?.address || "",
    });
  };

  // Update info API call
  const handleUpdateInfo = async () => {
    try {
      if (!selectedAccount) return;

      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const body = {
        name: formData.name,
        email: formData.email,
        kycDetails: {
          aadhar: formData.aadhar,
          pan: formData.pan,
          dob: formData.dob,
          address: formData.address,
        },
      };

      const res = await api.patch(`/admin/account/${selectedAccount._id}`, body, { headers });

      alert(res.data.message || "Account info updated successfully");

      setSelectedAccount((prev) => ({
        ...prev,
        user: { ...prev.user, name: formData.name, email: formData.email },
        kycDetails: { ...formData },
      }));

      setShowUpdateForm(false);
    } catch (err) {
      console.error("Error updating account info:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update info");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
        <Header title="KYC Requests" />
        <div className="p-6">
          {/* KYC Table */}
          <table className="min-w-full bg-white shadow rounded mb-6">
            <thead>
              <tr>
                <th className="p-2 border">User Name</th>
                <th className="p-2 border">KYC Status</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {kycList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    No KYC requests found.
                  </td>
                </tr>
              ) : (
                kycList.map((account) => (
                  <tr key={account._id}>
                    <td
                      className="p-2 border text-blue-600 cursor-pointer hover:underline"
                      onClick={() => handleSelectAccount(account)}
                    >
                      {account.user?.name}
                    </td>
                    <td className="p-2 border">{account.kycStatus}</td>
                    <td className="p-2 border">
                      {account.kycStatus === "pending" && (
                        <>
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                            onClick={() =>
                              handleUpdateStatus(account._id, "approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() =>
                              handleUpdateStatus(account._id, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Selected Account Details */}
          {selectedAccount && (
            <div className="bg-white shadow rounded p-6">
              <h2 className="text-xl font-bold mb-4">
                Account Details: {selectedAccount.user?.name}
              </h2>
              <table className="min-w-full border mb-4">
                <tbody>
                  <tr>
                    <td className="p-2 border font-semibold">Name</td>
                    <td className="p-2 border">{selectedAccount.user?.name}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">Email</td>
                    <td className="p-2 border">{selectedAccount.user?.email}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">Account Number</td>
                    <td className="p-2 border">{selectedAccount.accountNumber || "-"}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">Balance</td>
                    <td className="p-2 border">₹{selectedAccount.balance}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">KYC Status</td>
                    <td className="p-2 border">{selectedAccount.kycStatus}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">KYC Rejection Reason</td>
                    <td className="p-2 border">{selectedAccount.kycRejectionReason || "-"}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">Account Type</td>
                    <td className="p-2 border">
                      {selectedAccount.accountType?.name ||
                        selectedAccount.accountType ||
                        "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">Aadhar</td>
                    <td className="p-2 border">{selectedAccount.kycDetails?.aadhar}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">PAN</td>
                    <td className="p-2 border">{selectedAccount.kycDetails?.pan}</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">DOB</td>
                    <td className="p-2 border">
                      {new Date(selectedAccount.kycDetails?.dob).toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">Address</td>
                    <td className="p-2 border">{selectedAccount.kycDetails?.address}</td>
                  </tr>
                </tbody>
              </table>

              {/* Update Button */}
              {selectedAccount.kycStatus === "approved" && !showUpdateForm && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => setShowUpdateForm(true)}
                >
                  Do you want to update info?
                </button>
              )}

              {/* Update Form */}
              {showUpdateForm && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2">Update Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      className="border p-2 rounded"
                      placeholder="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                      type="email"
                      className="border p-2 rounded"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                      type="text"
                      className="border p-2 rounded"
                      placeholder="Aadhar"
                      value={formData.aadhar}
                      onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                    />
                    <input
                      type="text"
                      className="border p-2 rounded"
                      placeholder="PAN"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    />
                    <input
                      type="date"
                      className="border p-2 rounded"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                    <input
                      type="text"
                      className="border p-2 rounded"
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded"
                      onClick={handleUpdateInfo}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                      onClick={() => setShowUpdateForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setSelectedAccount(null)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycRequest;
