import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import KycRequests from "./pages/KYCRequest";
import Users from "./pages/Users";
import UserDashboard from "./pages/UserDashboard";
import AccountTypes from "./pages/AccountTypes";
import Transactions from "./pages/Transactions";

// Helper to get user from localStorage
const getUser = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) return null;
  return JSON.parse(user);
};

// Protected Route
const ProtectedRoute = ({ children, role }) => {
  const user = getUser();
  if (!user) return <Navigate to="/" />; // fixed from /landing
  if (role === "admin" && !user.isAdmin)
    return <Navigate to="/user-dashboard" />;
  if (role === "user" && user.isAdmin)
    return <Navigate to="/admin-dashboard" />;
  return children;
};

function App() {
  const user = getUser();

  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={
            user ? (
              user.isAdmin ? (
                <Navigate to="/admin-dashboard" />
              ) : (
                <Navigate to="/user-dashboard" />
              )
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              user.isAdmin ? (
                <Navigate to="/admin-dashboard" />
              ) : (
                <Navigate to="/user-dashboard" />
              )
            ) : (
              <Register />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard/kyc"
          element={
            <ProtectedRoute role="admin">
              <KycRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/users"
          element={
            <ProtectedRoute role="admin">
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/account-types"
          element={
            <ProtectedRoute role="admin">
              <AccountTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/transactions"
          element={
            <ProtectedRoute role="admin">
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
