import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (err) {
      setError('Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1B2028] transition-colors duration-200">
      <div className="max-w-md w-full m-4 space-y-8 bg-white dark:bg-[#2A303C] p-8 rounded-2xl shadow-lg transition-colors duration-200">
        {/* Logo và Tiêu đề */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-bold text-[#E91E63] hover:text-pink-400 transition-colors duration-200">
              BeautyCare
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don't worry! Just fill in your email and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Thông báo lỗi và thành công */}
        {error && (
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500 rounded-lg">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}
        
        {message && (
          <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-500 rounded-lg">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 dark:text-green-400">{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-3 rounded-lg
                         bg-white dark:bg-[#1B2028]
                         border border-gray-300 dark:border-gray-600
                         text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                         transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4
                     text-white bg-[#E91E63] hover:bg-pink-700
                     rounded-lg font-medium text-sm
                     focus:outline-none focus:ring-2 focus:ring-offset-2
                     focus:ring-pink-500 transform hover:scale-[1.02]
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-md hover:shadow-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Reset Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="flex flex-col items-center space-y-4">
            <Link 
              to="/login"
              className="text-sm text-[#E91E63] hover:text-pink-400 transition-colors duration-200"
            >
              Back to Login
            </Link>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Need help?{' '}
              <Link 
                to="/contact" 
                className="text-[#E91E63] hover:text-pink-400 transition-colors duration-200"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 