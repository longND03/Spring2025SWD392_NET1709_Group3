import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Staff = () => {
  const { user } = useAuth();

  if (!user || user.role[0].roleName !== 'Staff') {
    return <p>You do not have access to this page.</p>; // Thông báo nếu không có quyền
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>
      <p className="mb-4">Welcome, {user.username}!</p>
      
      <h2 className="text-xl font-semibold mb-2">Manage Your Tasks</h2>
      <ul>
        <li>
          <Link to="/staff/products" className="text-blue-500 hover:underline">
            Manage Products
          </Link>
        </li>
        {/* Thêm các liên kết khác nếu cần */}
      </ul>
    </div>
  );
};

export default Staff;