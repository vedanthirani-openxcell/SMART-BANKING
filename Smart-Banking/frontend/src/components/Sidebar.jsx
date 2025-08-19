import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "KYC Requests", path: "/admin-dashboard/kyc" },
    { name: "Users", path: "/admin-dashboard/users" },
    { name: "Account Types", path: "/admin-dashboard/account-types" },
    { name: "Transactions", path: "/admin-dashboard/transactions" },
  ];

  return (
    <div className="w-64 bg-blue-600 min-h-screen flex flex-col">
      <div className="text-2xl font-bold p-6 text-white">Admin Panel</div>
      <nav className="flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-6 py-3 transition-colors ${
              location.pathname === item.path
                ? "bg-blue-800 text-white"
                : "text-white hover:bg-blue-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-6">
        <button
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-white"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

