import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        {/* Thêm thông tin người dùng khác ở đây */}
      </div>
    </div>
  );
};

export default UserProfile; 