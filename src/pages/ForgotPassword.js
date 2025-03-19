import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra xem URL có chứa token không
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    const emailFromUrl = queryParams.get('email');
    
    if (tokenFromUrl && emailFromUrl) {
      setToken(tokenFromUrl);
      setEmail(emailFromUrl);
      setIsResetMode(true);
    }
  }, [location]);

  // Gửi request để lấy link reset password
  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      
      // Gọi API để gửi email đặt lại mật khẩu
      const response = await fetch('http://localhost:5296/api/auth/forgot-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }

      setMessage('Check your inbox for the password reset link');
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi mật khẩu
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Gọi API để đặt lại mật khẩu với token
      const response = await fetch('http://localhost:5296/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set new password');
      }

      setMessage('Password has been reset successfully');
      
      // Chuyển hướng người dùng đến trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login', { state: { message: 'Your password has been reset. Please log in with your new password.' } });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
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
            {isResetMode ? 'Reset Password' : 'Forgot Password?'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isResetMode 
              ? 'Enter your new password below' 
              : 'Don\'t worry! Just fill in your email and we\'ll send you a link to reset your password.'}
          </p>
        </div>

        {/* Thông báo lỗi và thành công */}
        {error && (
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500 rounded-lg">
            <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}
        
        {message && (
          <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-500 rounded-lg">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-700 dark:text-green-400">{message}</span>
          </div>
        )}

        {/* Form */}
        {isResetMode ? (
          // Form đặt lại mật khẩu mới
          <form onSubmit={handlePasswordReset} className="mt-8 space-y-6">
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
                  value={email}
                  readOnly
                  className="pl-10 w-full px-4 py-3 rounded-lg
                          bg-gray-100 dark:bg-gray-700
                          border border-gray-300 dark:border-gray-600
                          text-gray-500 dark:text-gray-400
                          focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                          transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-lg
                          bg-white dark:bg-[#1B2028]
                          border border-gray-300 dark:border-gray-600
                          text-gray-900 dark:text-white
                          placeholder-gray-500 dark:placeholder-gray-400
                          focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                          transition-all duration-200"
                  placeholder="Create a new password"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-lg
                          bg-white dark:bg-[#1B2028]
                          border border-gray-300 dark:border-gray-600
                          text-gray-900 dark:text-white
                          placeholder-gray-500 dark:placeholder-gray-400
                          focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                          transition-all duration-200"
                  placeholder="Confirm your new password"
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
                  Updating Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        ) : (
          // Form gửi email reset
          <form onSubmit={handleRequestReset} className="mt-8 space-y-6">
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
          </form>
        )}

        <div className="flex flex-col items-center space-y-4">
          <Link 
            to="/login"
            className="text-sm text-[#E91E63] hover:text-pink-400 transition-colors duration-200 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
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
      </div>
    </div>
  );
};

export default ForgotPassword;