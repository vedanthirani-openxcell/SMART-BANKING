import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../api/api";

const KycRequest = () => {
  const [kycList, setKycList] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Fetch KYC accounts
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

  // Handle Approve/Reject
  const handleUpdateStatus = async (accountId, status) => {
    try {
      const token = localStorage.getItem("token");
      const body = { status };

      const res = await api.patch(`/admin/kyc/${accountId}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local KYC list state immediately
      setKycList((prev) =>
        prev.map((acc) =>
          acc._id === accountId ? { ...acc, kycStatus: status } : acc
        )
      );

      if (selectedAccount?._id === accountId) {
        setSelectedAccount((prev) => ({ ...prev, kycStatus: status }));
      }
    } catch (err) {
      console.error("Error updating KYC status:", err);
      alert("Failed to update KYC status");
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
                      onClick={() => setSelectedAccount(account)}
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
              <table className="min-w-full border">
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
                    <td className="p-2 border font-semibold">IFSC Code</td>
                    <td className="p-2 border">{selectedAccount.ifscCode}</td>
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
                    <td className="p-2 border font-semibold">Account Number</td>
                    <td className="p-2 border">
                      {selectedAccount.accountNumber || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">KYC Rejection Reason</td>
                    <td className="p-2 border">
                      {selectedAccount.kycRejectionReason || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">Account Type</td>
                    <td className="p-2 border">
                      {selectedAccount.accountType?.name || selectedAccount.accountType || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-semibold">KYC Details</td>
                    <td className="p-2 border">
                      <div>Aadhar: {selectedAccount.kycDetails?.aadhar}</div>
                      <div>PAN: {selectedAccount.kycDetails?.pan}</div>
                      <div>
                        DOB:{" "}
                        {new Date(selectedAccount.kycDetails?.dob).toLocaleDateString()}
                      </div>
                      <div>Address: {selectedAccount.kycDetails?.address}</div>
                    </td>
                  </tr>
                </tbody>
              </table>

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
