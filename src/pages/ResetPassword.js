import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Extract email from URL query params
    const queryParams = new URLSearchParams(location.search);
    const emailFromUrl = queryParams.get('email');
    
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    } else {
      setError('Invalid reset link. Email is missing.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // Call API to reset password with token and email
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

      setMessage('Password has been reset successfully');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Your password has been reset. Please log in with your new password.' }
        });
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
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Error and success messages */}
        {error && (
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-500 rounded-lg">
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}
        
        {message && (
          <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-500 rounded-lg">
            <span className="text-green-700 dark:text-green-400">{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-3 rounded-lg
                      bg-gray-100 dark:bg-gray-700
                      border border-gray-300 dark:border-gray-600
                      text-gray-500 dark:text-gray-400
                      focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                      transition-all duration-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg
                      bg-white dark:bg-[#1B2028]
                      border border-gray-300 dark:border-gray-600
                      text-gray-900 dark:text-white
                      placeholder-gray-500 dark:placeholder-gray-400
                      focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                      transition-all duration-200"
              placeholder="Create a new password"
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg
                      bg-white dark:bg-[#1B2028]
                      border border-gray-300 dark:border-gray-600
                      text-gray-900 dark:text-white
                      placeholder-gray-500 dark:placeholder-gray-400
                      focus:ring-2 focus:ring-pink-500 focus:border-pink-500
                      transition-all duration-200"
              placeholder="Confirm your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4
                    text-white bg-[#E91E63] hover:bg-pink-700
                    rounded-lg font-medium text-sm
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    focus:ring-pink-500 transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;