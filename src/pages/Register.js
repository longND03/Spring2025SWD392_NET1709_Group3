import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import messages from '../constants/message.json';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    phone: ''
  });
  const [errors, setErrors] = useState({
    passwordMatch: '',
    passwordLength: '',
    phoneLength: '',
    phoneFormat: ''
  });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone input validation
    if (name === 'phone') {
      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        setErrors(prev => ({
          ...prev,
          phoneFormat: 'Phone number must contain only digits'
        }));
        return;
      }
      
      // Check length of phone number
      if (value.length > 10) {
        setErrors(prev => ({
          ...prev,
          phoneLength: 'Phone number must be exactly 10 digits long'
        }));
        return;
      } else {
        setErrors(prev => ({
          ...prev,
          phoneLength: ''
        }));
      }

      // Clear phone-related errors when typing valid numbers
      setErrors(prev => ({
        ...prev,
        phoneFormat: ''
      }));
    }

    // Clear password-related errors when typing
    if (name === 'password' || name === 'confirmPassword') {
      setErrors(prev => ({
        ...prev,
        passwordMatch: '',
        passwordLength: ''
      }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      passwordMatch: '',
      passwordLength: '',
      phoneLength: '',
      phoneFormat: ''
    });

    // Validate phone number
    if (!/^\d+$/.test(formData.phone)) {
      setErrors(prev => ({
        ...prev,
        phoneFormat: 'Phone number must contain only digits'
      }));
      return;
    }

    if (formData.phone.length !== 10) {
      setErrors(prev => ({
        ...prev,
        phoneLength: 'Phone number must be exactly 10 digits long'
      }));
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setErrors(prev => ({
        ...prev,
        passwordLength: 'Password must be at least 8 characters long'
      }));
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        passwordMatch: messages.validation.passwordMatch
      }));
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password, formData.location, formData.phone);
      navigate('/login'); // Redirect after successful registration
    } catch (err) {
      console.error('Signup error:', err);
      setErrors(prev => ({
        ...prev,
        general: messages.error.register
      }));
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#E91E63] hover:text-pink-400 transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>

        {(errors.passwordMatch || errors.passwordLength || errors.phoneLength || errors.phoneFormat || errors.general) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">
              {errors.passwordMatch || errors.passwordLength || errors.phoneLength || errors.phoneFormat || errors.general}
            </span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                         placeholder-gray-500 text-gray-900 dark:text-white rounded-lg 
                         bg-white dark:bg-[#1B2028]
                         focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                         placeholder-gray-500 text-gray-900 dark:text-white rounded-lg 
                         bg-white dark:bg-[#1B2028]
                         focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-4 py-3 border ${
                  errors.phoneLength || errors.phoneFormat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } placeholder-gray-500 text-gray-900 dark:text-white rounded-lg 
                         bg-white dark:bg-[#1B2028]
                         focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your phone number (minimum 10 digits)"
              />
              {(errors.phoneLength || errors.phoneFormat) && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneLength || errors.phoneFormat}</p>
              )}
            </div>
            {/* <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                         placeholder-gray-500 text-gray-900 dark:text-white rounded-lg 
                         bg-white dark:bg-[#1B2028]
                         focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Enter your location"
              />
            </div> */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-4 py-3 border ${
                  errors.passwordLength ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } placeholder-gray-500 text-gray-900 dark:text-white rounded-lg 
                         bg-white dark:bg-[#1B2028]
                         focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm`}
                placeholder="Create a password (minimum 8 characters)"
              />
              {errors.passwordLength && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordLength}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-4 py-3 border ${
                  errors.passwordMatch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } placeholder-gray-500 text-gray-900 dark:text-white rounded-lg 
                         bg-white dark:bg-[#1B2028]
                         focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm your password"
              />
              {errors.passwordMatch && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordMatch}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium 
                       rounded-lg text-white bg-[#E91E63] hover:bg-pink-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 
                       transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 