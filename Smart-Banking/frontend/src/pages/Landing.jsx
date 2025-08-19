import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Landing = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // mobile menu toggle
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Redirect logged-in users directly to dashboard
      if (parsedUser.isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    }
  }, [navigate]);

  return (
    <header className="bg-blue-600 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="text-2xl font-bold tracking-wide text-white">
          Smart Banking
        </a>

        {/* Desktop Nav */}
        {!user && (
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-white hover:text-yellow-300 transition">Home</a>
            <a href="#" className="text-white hover:text-yellow-300 transition">Services</a>
            <a href="#" className="text-white hover:text-yellow-300 transition">About</a>
            <a href="#" className="text-white hover:text-yellow-300 transition">Contact</a>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium shadow hover:bg-yellow-300 hover:text-blue-800 transition"
            >
              Login
            </Link>
          </nav>
        )}

        {/* Mobile Menu Button */}
        {!user && (
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isOpen && !user && (
        <div className="md:hidden bg-blue-700 px-6 pb-4 space-y-2">
          <a href="#" className="block py-2 text-white hover:text-yellow-300">Home</a>
          <a href="#" className="block py-2 text-white hover:text-yellow-300">Services</a>
          <a href="#" className="block py-2 text-white hover:text-yellow-300">About</a>
          <a href="#" className="block py-2 text-white hover:text-yellow-300">Contact</a>
          <Link
            to="/login"
            className="block w-full text-center bg-white text-blue-600 px-4 py-2 rounded-lg font-medium shadow hover:bg-yellow-300 hover:text-blue-800 transition"
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
};

export default Landing;
