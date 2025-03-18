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

        const response = await fetch(`http://localhost:5296/api/user/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Không thể xóa người dùng. Status: ${response.status}`);
        }

        await fetchUsers();
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
        const errorData = await response.json();
        if (response.status === 403) {
          throw new Error(errorData.message || 'You do not have permission to perform this action.');
        } else {
          throw new Error(errorData.message || 'An error occurred while creating the user.');
        }
      }

      const data = await response.json();
      setUsers([...users, data]);
      setNewUser({ username: '', email: '', password: '', phone: '', location: '', status: true });
      setError(null);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">
              Welcome, <span className="font-semibold">{user.username}</span>
            </span>
            <button 
              onClick={() => navigate('/logout')} 
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Notification */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm" role="alert">
            <p className="font-medium">Lỗi</p>
            <p>{error}</p>
          </div>
        )}

        {/* Create User Form */}
        <div className="bg-white shadow-md rounded-lg mb-8 overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Tạo tài khoản nhân viên mới</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên người dùng
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Nhập tên người dùng"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="Nhập địa chỉ"
                  value={newUser.location}
                  onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo...
                    </span>
                  ) : (
                    'Tạo tài khoản'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Quản lý người dùng</h2>
            <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              {users.length} người dùng
            </span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-500">Đang tải danh sách người dùng...</p>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên người dùng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.userId || user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 font-medium text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(user.userId || user.id)}
                            className="text-red-600 hover:text-red-800 transition duration-300 ease-in-out"
                            disabled={loading}
                          >
                            Ngừng hoạt động
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <p className="text-gray-500">Không có người dùng nào.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;