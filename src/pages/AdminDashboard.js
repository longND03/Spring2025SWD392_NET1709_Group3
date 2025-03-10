import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    status: true,
  });

  // Redirect if user is not an admin
  useEffect(() => {
    if (!user || user.role[0].roleName !== 'Manager') {
      navigate('/login');
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found. Please log in again.');

      const response = await fetch('http://localhost:5296/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to load users: ${response.statusText}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token không tìm thấy. Vui lòng đăng nhập lại.');

        console.log('Đang xóa user với ID:', userId); // Debug log

        const response = await fetch(`http://localhost:5296/api/user/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Response status:', response.status); // Debug log
        
        // Đợi và log response body nếu có
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!response.ok) {
          throw new Error(`Không thể xóa người dùng. Status: ${response.status}`);
        }

        // Chỉ cập nhật UI sau khi xác nhận xóa thành công
        await fetchUsers(); // Refresh lại danh sách từ server thay vì chỉ cập nhật local
        setError(null);
      } catch (error) {
        setError(`Lỗi khi xóa người dùng: ${error.message}`);
        console.error('Chi tiết lỗi:', error);
      }
    }
  };

  // Create a new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found. Please log in again.');

      const response = await fetch('http://localhost:5296/api/auth/admin-create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        if (response.status === 403) {
          throw new Error(errorData.message || 'You do not have permission to perform this action.');
        } else {
          throw new Error(errorData.message || 'An error occurred while creating the user.');
        }
      }

      const data = await response.json();
      setUsers([...users, data]); // Add the new user to the list
      setNewUser({ username: '', email: '', password: '', phone: '', location: '', status: true });
    } catch (error) {
      setError(error.message);
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hide dashboard if user is not an admin
  if (!user || user.role[0].roleName !== 'Manager') {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">Welcome, {user.username}!</p>
      {error && <p className="text-red-500">{error}</p>}

      {/* Create New Staff Account Form */}
      <h2 className="text-xl font-semibold mb-2">Create New Staff Account</h2>
      <form onSubmit={handleCreateUser} className="mb-4">
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          required
          className="border p-2 mr-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
          className="border p-2 mr-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          required
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Phone"
          value={newUser.phone}
          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Location"
          value={newUser.location}
          onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2" disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      {/* User Management Table */}
      <h2 className="text-xl font-semibold mb-2">User Management</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
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
                <tr key={user.userId || user.id}>
                  <td className="py-2 px-4 border-b">{user.username}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(user.userId || user.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;