import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" />;

  if (role === "admin" && !user.isAdmin) return <Navigate to="/user-dashboard" />;
  if (role === "user" && user.isAdmin) return <Navigate to="/admin-dashboard" />;

  return children;
};

export default ProtectedRoute;


