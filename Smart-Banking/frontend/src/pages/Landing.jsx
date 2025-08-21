import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Landing = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.isAdmin) navigate("/admin-dashboard");
      else navigate("/user-dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-blue-600 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <a href="#" className="text-2xl font-bold tracking-wide text-white">Smart Banking</a>

          {!user && (
            <>
              {/* Desktop Nav */}
              <nav className="hidden md:flex space-x-8">
                <a href="#home" className="text-white hover:text-yellow-300 transition">Home</a>
                <a href="#services" className="text-white hover:text-yellow-300 transition">Services</a>
                <a href="#about" className="text-white hover:text-yellow-300 transition">About</a>
                <a href="#contact" className="text-white hover:text-yellow-300 transition">Contact</a>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium shadow hover:bg-yellow-300 hover:text-blue-800 transition"
                >
                  Login
                </Link>
              </nav>

              {/* Mobile Menu Button */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {isOpen && !user && (
          <div className="md:hidden bg-blue-700 px-6 pb-4 space-y-2">
            <a href="#home" className="block py-2 text-white hover:text-yellow-300">Home</a>
            <a href="#services" className="block py-2 text-white hover:text-yellow-300">Services</a>
            <a href="#about" className="block py-2 text-white hover:text-yellow-300">About</a>
            <a href="#contact" className="block py-2 text-white hover:text-yellow-300">Contact</a>
            <Link
              to="/login"
              className="block w-full text-center bg-white text-blue-600 px-4 py-2 rounded-lg font-medium shadow hover:bg-yellow-300 hover:text-blue-800 transition"
            >
              Login
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1 bg-gradient-to-r from-blue-500 to-blue-400 text-white">
        <div className="container mx-auto px-6 py-32 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Banking Made Simple
            </h1>
            <p className="text-lg mb-6">
              Manage your accounts, transfer funds, and track your spending effortlessly.
            </p>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-yellow-300 hover:text-blue-800 transition"
            >
              Get Started
            </Link>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Banking Illustration"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Features / Services */}
      {/* Features / Services */}
<section id="services" className="bg-white text-gray-800 py-20">
  <div className="container mx-auto px-6">
    <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Row 1 */}
      <div className="bg-blue-600 text-white rounded-lg p-6 shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold mb-2">Secure Accounts</h3>
        <p>Protect your money with top-tier security and KYC verified accounts.</p>
      </div>
      <div className="bg-blue-600 text-white rounded-lg p-6 shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold mb-2">Easy Transfers</h3>
        <p>Transfer money instantly within your accounts or to others safely.</p>
      </div>
      <div className="bg-blue-600 text-white rounded-lg p-6 shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold mb-2">Track Spending</h3>
        <p>Get detailed statements and manage your expenses efficiently.</p>
      </div>

      {/* Row 2 */}
      <div className="bg-blue-600 text-white rounded-lg p-6 shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold mb-2">Loan Services</h3>
        <p>Quick and easy loans with flexible repayment options.</p>
      </div>
      <div className="bg-blue-600 text-white rounded-lg p-6 shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold mb-2">Investments</h3>
        <p>Grow your wealth with smart investment plans and advice.</p>
      </div>
      <div className="bg-blue-600 text-white rounded-lg p-6 shadow hover:shadow-lg transition">
        <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
        <p>We are always here to help you with your banking needs anytime.</p>
      </div>
    </div>
  </div>
</section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 text-center">
        &copy; {new Date().getFullYear()} Smart Banking. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
