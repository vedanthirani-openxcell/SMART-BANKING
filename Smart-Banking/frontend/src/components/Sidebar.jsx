import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ role }) => {
  const location = useLocation();

  // ✅ Default: Admin if no role is passed
  const normalizedRole = role?.toLowerCase().trim() || "admin";

  // Define menu items
  const menuItems =
    normalizedRole === "user"
      ? [
          { name: "Dashboard", path: "/user-dashboard" },
          { name: "KYC Approval", path: "/user/kyc-approval" },
          { name: "Transfer Funds", path: "/user/transfer" },
          { name: "Transactions", path: "/user/transactions" },
          { name: "Account Statement", path: "/user/account-statement" },
        ]
      : [
          { name: "Dashboard", path: "/admin-dashboard" },
          { name: "KYC Requests", path: "/admin-dashboard/kyc" },
          { name: "Users", path: "/admin-dashboard/users" },
          { name: "Account Types", path: "/admin-dashboard/account-types" },
          { name: "Transactions", path: "/admin-dashboard/transactions" },
          { name: "Manage Accounts", path: "/admin-dashboard/manage-accounts"}
        ];

  const panelTitle =
    normalizedRole === "user" ? "User Panel" : "Admin Panel";
  const bgColor =
    normalizedRole === "user" ? "bg-green-600" : "bg-blue-600";
  const activeColor =
    normalizedRole === "user" ? "bg-green-800" : "bg-blue-800";
  const hoverColor =
    normalizedRole === "user" ? "hover:bg-green-700" : "hover:bg-blue-700";

  return (
    <div className={`w-64 ${bgColor} min-h-screen flex flex-col`}>
      <div className="text-2xl font-bold p-6 text-white">{panelTitle}</div>
      <nav className="flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-6 py-3 transition-colors ${
              location.pathname === item.path
                ? `${activeColor} text-white`
                : `text-white ${hoverColor}`
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
