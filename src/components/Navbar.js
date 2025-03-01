import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  // const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-100 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#E91E63] hover:text-pink-400 transition-colors duration-200">
              Diana Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-[#E91E63] transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-gray-600 hover:text-[#E91E63] transition-colors duration-200"
            >
              Products
            </Link>
            <Link 
              to="/blog" 
              className="text-gray-600 dark:text-gray-300 hover:text-[#E91E63] dark:hover:text-[#E91E63] transition-colors duration-200"
            >
              Blog
            </Link>
            <Link 
              to="/about" 
              className="text-gray-600 hover:text-[#E91E63] transition-colors duration-200"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-[#E91E63] transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Right Side Items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 px-4 py-2 rounded-full
                         bg-gray-100 text-gray-900
                         border border-gray-300
                         focus:outline-none focus:ring-2 focus:ring-pink-500
                         placeholder-gray-500 transition-colors duration-200"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2">
              <svg 
                className="w-6 h-6 text-gray-600 hover:text-[#E91E63] transition-colors duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {/* Cart Items Count Badge */}
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E91E63] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Auth Buttons or Profile */}
            {user ? (
              <div className="relative group">
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E91E63] flex items-center justify-center text-white">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-gray-700">{user.username}</span>
                </button>

                {/* Profile Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible transition-all duration-200 opacity-0 group-hover:opacity-100">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-600 hover:text-[#E91E63] transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-white bg-[#E91E63] hover:bg-pink-700 rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-[#E91E63] focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-100 border-t border-gray-200 transition-colors duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-gray-600 
                       hover:text-[#E91E63] 
                       hover:bg-gray-200 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-gray-600 
                       hover:text-[#E91E63] 
                       hover:bg-gray-200 transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-gray-600 
                       hover:text-[#E91E63] 
                       hover:bg-gray-200 transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-gray-600 
                       hover:text-[#E91E63] 
                       hover:bg-gray-200 transition-colors duration-200"
            >
              Contact
            </Link>
            <Link
              to="/cart"
              className="flex items-center px-3 py-2 rounded-md text-gray-600 
                       hover:text-[#E91E63] 
                       hover:bg-gray-200 transition-colors duration-200"
            >
              <svg 
                className="w-6 h-6 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Cart
              {getCartItemsCount() > 0 && (
                <span className="ml-2 bg-[#E91E63] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-gray-600 
                         hover:text-[#E91E63] 
                         hover:bg-gray-200 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 mt-1 rounded-md text-white bg-[#E91E63] hover:bg-pink-700 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 