import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { useCart } from './CartContext';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Kiểm tra localStorage khi khởi tạo
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  const { clearCart } = useCart();

  // Check token on initialization
  useEffect(() => {
    const initAuth = () => {
      const token = getCookie('token');
      
      if (!token) {
        logout();
        return;
      }
      
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Add interval to check user status every 10 seconds
  useEffect(() => {
    // Start interval when user is logged in, clear when logged out
    if (user) {
      const interval = setInterval(async () => {
        try {
          const token = getCookie('token');
          if (!token) {
            clearInterval(interval);
            return;
          }

          const response = await fetch(`http://localhost:5296/api/user/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user status');
          }

          const userData = await response.json();
          
          // Check if status is false
          if (userData.status === false) {
            // Logout user
            logout();
            // Navigate to home page using window.location
            window.location.href = '/';
            // Show popup
            alert('Something is wrong');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
        }
      }, 10000); // 10 seconds

      setStatusCheckInterval(interval);
      
      // Cleanup interval when component unmounts or user logs out
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      // Clear the interval if user is null
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
    }
  }, [user]);

  // Lưu user vào localStorage khi có thay đổi
  useEffect(() => {
      localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5296/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log('Login response:', data);
  
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }
      
      // Handle banned accounts
      if (data.isBanned) {
        return {
          success: false,
          message: 'Your account has been banned',
          bannedAccountId: data.bannedAccountId
        };
      }
      
      // Check if account requires verification based on new API response
      if (data.requiresVerification || (data.data && data.data.emailVerified === false)) {
        return {
          success: false,
          requiresVerification: true,
          email: email,
          message: 'Account requires email verification',
        };
      }
  
      const userData = {
        id: data.data.user.id,
        username: data.data.user.username,
        phone: data.data.user.phone,
        email: data.data.user.email,
        image: data.data.user.image,
        location: data.data.user.location,
        wallet: data.data.user.wallet || 0,
        voucherStorageId: data.data.user.voucherStorage?.[0]?.id,
        voucherStorage: data.data.user.voucherStorage?.[0]?.storages || [],
        role: data.data.user.userRoles,
      };
  
      console.log('User role:', userData.role);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store token in cookie with 24h expiration
      setCookie('token', data.data.token, 1); // 1 day expiration
      
      // Store refresh token if needed
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
  
      return {
        success: true,
        user: userData,
        emailVerified: data.data.emailVerified
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, location, phone) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5296/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, location, phone }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      // Don't set user or token here since email verification is required first
      // Instead, just return the response data
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add a new function for verifying email
  const verifyEmail = async (email, verificationCode) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5296/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verificationCode }),
      });

      if (!response.ok) {
        throw new Error('Email verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    try {
      // Clear everything completely
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      // Remove token cookie
      deleteCookie('token');
      
      clearCart();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5296/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      return await response.json();
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmPasswordReset = async (token, newPassword) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5296/api/auth/confirm-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm password reset');
      }

      return await response.json();
    } catch (error) {
      console.error('Confirm reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refetchUserData = async () => {
    setLoading(true);
    try {
      const token = getCookie('token');
      if (!token) {
        // If token is missing, log the user out
        logout();
        throw new Error('Authentication token is missing');
      }

      const response = await fetch(`http://localhost:5296/api/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // If unauthorized, token is invalid or expired, log the user out
        logout();
        throw new Error('Authentication token expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const responseData = await response.json();

      const updatedUser = {
        ...user,
        username: responseData.username,
        phone: responseData.phone,
        email: responseData.email,
        image: responseData.image,
        location: responseData.location,
        wallet: responseData.wallet || 0,
        voucherStorageId: responseData.voucherStorage?.[0]?.id,
        voucherStorage: responseData.voucherStorage?.[0]?.storages || []
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Refetch user data error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to check if the token is valid
  const checkTokenValidity = () => {
    const token = getCookie('token');
    if (!token && user) {
      // If no token but user is logged in, log out
      logout();
      return false;
    }
    return !!token;
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    verifyEmail,
    logout,
    isAuthenticated: !!user,
    resetPassword,
    confirmPasswordReset,
    refetchUserData,
    checkTokenValidity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 