import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { useCart } from './CartContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Kiểm tra localStorage khi khởi tạo
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const { clearCart } = useCart();

  // Lưu user vào localStorage khi có thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
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
  
      const userData = {
        id: data.data.user.id,
        username: data.data.user.username,
        phone: data.data.user.phone,
        email: data.data.user.email,
        image: data.data.user.image,
        location: data.data.user.location,
        voucherStorage: data.data.user.voucherStorage?.[0]?.storages || [],
        role: data.data.user.userRoles,
        token: data.data.token,
      };
  
      console.log('User role:', userData.role);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', data.data.token);
  
      return {
        success: true,
        user: userData,
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
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    resetPassword,
    confirmPasswordReset
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