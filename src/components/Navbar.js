import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-100 dark:bg-[#1B2028] shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#E91E63] hover:text-pink-400 transition-colors duration-200">
              BeautyCare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-600 dark:text-gray-300 hover:text-[#E91E63] dark:hover:text-[#E91E63] transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className="text-gray-600 dark:text-gray-300 hover:text-[#E91E63] dark:hover:text-[#E91E63] transition-colors duration-200"
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
              className="text-gray-600 dark:text-gray-300 hover:text-[#E91E63] dark:hover:text-[#E91E63] transition-colors duration-200"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 dark:text-gray-300 hover:text-[#E91E63] dark:hover:text-[#E91E63] transition-colors duration-200"
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
                         bg-gray-100 dark:bg-[#2A303C]
                         text-gray-900 dark:text-gray-100
                         border border-gray-300 dark:border-gray-600
                         focus:outline-none focus:ring-2 focus:ring-pink-500
                         placeholder-gray-500 dark:placeholder-gray-400
                         transition-colors duration-200"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-[#2A303C] 
                       hover:bg-gray-300 dark:hover:bg-[#323A48]
                       transition-all duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-pink-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg
                  className="w-6 h-6 text-yellow-500 transform rotate-0 transition-transform duration-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-700 transform rotate-90 transition-transform duration-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Auth Buttons */}
            <Link
              to="/login"
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-[#E91E63] dark:hover:text-[#E91E63] transition-colors duration-200"
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-[#E91E63] dark:hover:text-[#E91E63] focus:outline-none"
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
        <div className="md:hidden bg-gray-100 dark:bg-[#2A303C] border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 
                       hover:text-[#E91E63] dark:hover:text-[#E91E63] 
                       hover:bg-gray-200 dark:hover:bg-[#323A48] 
                       transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 
                       hover:text-[#E91E63] dark:hover:text-[#E91E63] 
                       hover:bg-gray-200 dark:hover:bg-[#323A48] 
                       transition-colors duration-200"
            >
              Products
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 
                       hover:text-[#E91E63] dark:hover:text-[#E91E63] 
                       hover:bg-gray-200 dark:hover:bg-[#323A48] 
                       transition-colors duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 
                       hover:text-[#E91E63] dark:hover:text-[#E91E63] 
                       hover:bg-gray-200 dark:hover:bg-[#323A48] 
                       transition-colors duration-200"
            >
              Contact
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 
                         hover:text-[#E91E63] dark:hover:text-[#E91E63] 
                         hover:bg-gray-200 dark:hover:bg-[#323A48] 
                         transition-colors duration-200"
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