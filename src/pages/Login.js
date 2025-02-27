import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy redirect path từ location state hoặc mặc định là '/'
  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/'); // Chuyển về trang chủ sau khi đăng nhập
      } else {
        toast.error(result.message || 'Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1B2028] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#2A303C] p-8 rounded-2xl shadow-lg">
        <div>
          <Link to="/" className="flex justify-center">
            <span className="text-3xl font-bold text-[#E91E63] hover:text-pink-400 transition-colors duration-200">
              BeautyCare
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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg
                     text-sm font-medium text-white bg-[#E91E63] hover:bg-pink-700
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
                     disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 