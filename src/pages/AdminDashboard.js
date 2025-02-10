import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <p>Welcome Admin: {user?.name}</p>
        {/* Thêm nội dung quản trị ở đây */}
      </div>
    </div>
  );
};

export default AdminDashboard; 