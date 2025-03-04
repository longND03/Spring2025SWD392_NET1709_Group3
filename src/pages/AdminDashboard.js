import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Kiểm tra nếu người dùng chưa đăng nhập hoặc không có quyền admin
    if (!user || user.role[0].roleName !== 'Manager') {
      navigate('/login'); // Chuyển hướng đến trang đăng nhập
    } else {
      fetchUsers(); // Gọi hàm để lấy danh sách người dùng
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5296/api/user'); // Cập nhật endpoint
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data); // Giả sử dữ liệu trả về là một mảng người dùng
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5296/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');
      fetchUsers(); // Cập nhật danh sách người dùng sau khi xóa
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!user || user.role[0].roleName !== 'Manager') {
    return null; // Hoặc hiển thị một spinner loading
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">Welcome, {user.username}!</p>
      
      <h2 className="text-xl font-semibold mb-2">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">
                  <button 
                    onClick={() => handleDelete(user.id)} 
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;