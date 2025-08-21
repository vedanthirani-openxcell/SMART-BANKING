import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api"; // ✅ your existing axios instance

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      alert("Login successful!");
      if (res.data.user.isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✅ CHANGE #1: replaced gradient bg with light blue
    <div className="min-h-screen flex items-center justify-center bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* ❌ CHANGE #2: removed animated background blobs */}

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Smart Banking</h1>
            <p className="text-gray-600 mt-2">Secure login to your account</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className=" w-full border-b-2 border-gray-300 py-3  text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              <label
                className="absolute left-0 -top-3.5 text-sm text-black-600 transition-all
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
               peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-500"
              >
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className=" w-full border-b-2 border-gray-300 py-3  text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              <label
                className="absolute left-0 -top-3.5 text-sm text-black-500 transition-all
               peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
               peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-500"
              >
                Password
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2">
            <p className="text-sm text-center text-gray-600">
              New user?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 font-medium hover:text-blue-500 underline"
              >
                Register
              </button>
            </p>
            <p className="text-right text-sm">
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-blue-600 hover:text-blue-500 underline"
              >
                Forgot Password?
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
