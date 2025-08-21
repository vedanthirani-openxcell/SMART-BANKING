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
import AccountStatement from "./pages/Statement";
import UserTransactions from "./pages/UsersTransactions";
import FundTransfer from "./pages/FundTransfer";
import KycApproval from "./pages/KycSubmit";
import ManageAccounts from "./pages/ManualByAdmin";
import ForgotPassword from "./pages/forgetPassword"; // add this


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
  path="/forgot-password"
  element={
    user ? (
      user.isAdmin ? (
        <Navigate to="/admin-dashboard" />
      ) : (
        <Navigate to="/user-dashboard" />
      )
    ) : (
      <ForgotPassword />
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
          path="/admin-dashboard/manage-accounts"
          element={
            <ProtectedRoute role="admin">
              <ManageAccounts />
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
        <Route
          path="/user/account-statement"
          element={
            <ProtectedRoute role="user">
              <AccountStatement />
            </ProtectedRoute>
          }
        />
          <Route
          path="/user/transactions"
          element={
            <ProtectedRoute role="user">
              <UserTransactions />
            </ProtectedRoute>
          }
        />
          <Route
          path="/user/transfer"
          element={
            <ProtectedRoute role="user">
              <FundTransfer />
            </ProtectedRoute>
          }
        />
         <Route
          path="/user/kyc-approval"
          element={
            <ProtectedRoute role="user">
              <KycApproval />
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
