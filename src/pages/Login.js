import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import messages from '../constants/message.json';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      if (result.success) {
        // Lưu token vào sessionStorage
        sessionStorage.setItem('token', result.token); // Lưu token vào sessionStorage
        // Kiểm tra vai trò người dùng
        const userRole = result.user.role[0].roleName; // Lấy vai trò đầu tiên
        if (userRole === "Staff") {
          navigate('/staff-manager'); // Chuyển hướng đến StaffManager
        } else if (userRole === "Manager") {
          navigate('/admindashboard'); // Chuyển hướng đến AdminDashboard
        } else {
          navigate('/'); // Chuyển hướng đến trang chính
        }
      } else {
        setError(messages.error.login);
      }
    } catch (error) {
      setError('Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1B2028] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#2A303C] p-8 rounded-2xl shadow-lg">
        <div>
          <Link to="/" className="flex justify-center">
            <span className="text-3xl font-bold text-[#E91E63] hover:text-pink-400 transition-colors duration-200">
              Diana Shop
            </span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#E91E63] hover:text-pink-400">
              Sign up
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                         placeholder-gray-500 text-gray-900 dark:text-white rounded-lg 
                         bg-white dark:bg-[#1B2028]
                         focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                         placeholder-gray-500 text-gray-900 dark:text-white rounded-lg 
                         bg-white dark:bg-[#1B2028]
                         focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-[#E91E63] hover:text-pink-400">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E91E63] text-white p-2 rounded"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 