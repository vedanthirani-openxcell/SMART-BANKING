import React, { useState } from "react";
import api from "../api/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=OTP, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendOTP = async () => {
    try {
      await api.post("/auth/forgot-password", { email });
      alert("OTP sent to your email");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await api.post("/auth/verify-otp", { email, otp });
      alert("OTP verified");
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post("/auth/reset-password", { email, newPassword });
      alert("Password reset successfully");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your registered email"
              className="w-full border px-3 py-2 rounded mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 rounded"
              onClick={handleSendOTP}
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border px-3 py-2 rounded mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 rounded"
              onClick={handleVerifyOTP}
            >
              Verify OTP
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full border px-3 py-2 rounded mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="w-full bg-green-600 text-white py-2 rounded"
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
