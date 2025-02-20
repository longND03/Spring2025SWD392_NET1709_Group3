import { createContext, useState, useContext } from 'react';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Gọi API đăng nhập ở đây
      const response = await fetch('http://localhost:5296/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, location, phone) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5296/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, location, phone }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const resetPassword = async (email) => {
    setLoading(true);
    try {
      // Gọi API reset password
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      // API sẽ gửi email chứa link reset password
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý reset password với token
  const confirmPasswordReset = async (token, newPassword) => {
    setLoading(true);
    try {
      const response = await fetch('/api/confirm-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm password reset');
      }
    } catch (error) {
      console.error('Confirm reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register,
        logout, 
        loading,
        resetPassword,
        confirmPasswordReset 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 