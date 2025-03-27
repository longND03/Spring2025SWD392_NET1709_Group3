import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCookie } from "../utils/cookies";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  // Expanded user state
  const [expandedUserId, setExpandedUserId] = useState(null);
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
    status: true,
  });
  const [newStaff, setNewStaff] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
    status: true,
  });

  // Redirect if user is not an admin
  useEffect(() => {
    if (!user || user.role[0].roleName !== "Manager") {
      navigate("/login");
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getCookie("token");
      if (!token) throw new Error("Token not found. Please log in again.");

      const response = await fetch("http://localhost:5296/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok)
        throw new Error(`Failed to load users: ${response.statusText}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error.message);
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = getCookie("token");
        if (!token)
          throw new Error("Token không tìm thấy. Vui lòng đăng nhập lại.");

        const response = await fetch(
          `http://localhost:5296/api/user/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Không thể xóa người dùng. Status: ${response.status}`
          );
        }

        await fetchUsers();
        setError(null);
      } catch (error) {
        setError(`Error deleting user: ${error.message}`);
        console.error("Chi tiết lỗi:", error);
      }
    }
  };

  // Create a new user (manager)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = getCookie("token");
      if (!token) throw new Error("Token not found. Please log in again.");

      const response = await fetch(
        "http://localhost:5296/api/auth/admin/create-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newUser),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          throw new Error(
            errorData.message ||
              "You do not have permission to perform this action."
          );
        } else {
          throw new Error(
            errorData.message || "An error occurred while creating the user."
          );
        }
      }

      const data = await response.json();
      // Update the users list with the newly created user
      // setUsers([...users, data]);
      
      // Refresh the user list instead of just adding the new user
      await fetchUsers();
      
      setNewUser({
        username: "",
        email: "",
        phone: "",
        location: "",
        status: true,
      });
      setError(null);
      setSuccessMessage("Manager account created successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setError(error.message);
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new staff member
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const token = getCookie("token");
      if (!token) throw new Error("Token not found. Please log in again.");

      // First create the user account
      const createResponse = await fetch(
        "http://localhost:5296/api/auth/admin/create-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newStaff),
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(
          errorData.message || "An error occurred while creating the staff account."
        );
      }

      const userData = await createResponse.json();
      const userId = userData.userId || userData.id;

      // Assign role 1 (remove manager role)
      const removeManagerResponse = await fetch(
        `http://localhost:5296/api/userrole/${userId}/1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!removeManagerResponse.ok) {
        throw new Error("Failed to remove manager role.");
      }

      // Assign role 2 (staff role)
      const assignStaffResponse = await fetch(
        "http://localhost:5296/api/userrole",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,
            roleId: 2
          }),
        }
      );

      if (!assignStaffResponse.ok) {
        throw new Error("Failed to assign staff role.");
      }

      // Refresh user list
      await fetchUsers();
      
      // Reset form
      setNewStaff({
        username: "",
        email: "",
        phone: "",
        location: "",
        status: true,
      });
      setError(null);
      setSuccessMessage("Staff account created successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setError(error.message);
      console.error("Error creating staff:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanded user details
  const toggleUserDetails = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Filter users based on search term and status filter
  const filteredUsers = users.filter((user) => {
    // Status filter
    if (statusFilter === "active" && !user.status) return false;
    if (statusFilter === "inactive" && user.status) return false;

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.phone && user.phone.toLowerCase().includes(term))
      );
    }

    return true;
  });

  // Calculate pagination indices
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Hide dashboard if user is not an admin
  if (!user || user.role[0].roleName !== "Manager") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Manager Dashboard
          </h1>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">
              Welcome, <span className="font-semibold">{user.username}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Display success notification */}
        {successMessage && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm" role="alert">
            <p className="font-medium">Success</p>
            <p>{successMessage}</p>
          </div>
        )}

        {/* Create Manager Account Form */}
        <div className="bg-white shadow-md rounded-lg mb-8 overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">
              Create New Manager Account
            </h2>
          </div>
          <div className="p-6">
            <form
              onSubmit={handleCreateUser}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  User Name
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="Enter phone number"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  location
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="Enter address"
                  value={newUser.location}
                  onChange={(e) =>
                    setNewUser({ ...newUser, location: e.target.value })
                  }
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
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Manager"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Create Staff Account Form */}
        <div className="bg-white shadow-md rounded-lg mb-8 overflow-hidden">
          <div className="bg-indigo-800 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">
              Create New Staff Account
            </h2>
          </div>
          <div className="p-6">
            <form
              onSubmit={handleCreateStaff}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div>
                <label
                  htmlFor="staff-username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="staff-username"
                  type="text"
                  placeholder="Enter username"
                  value={newStaff.username}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, username: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="staff-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="staff-email"
                  type="email"
                  placeholder="Enter email"
                  value={newStaff.email}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="staff-phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone number
                </label>
                <input
                  id="staff-phone"
                  type="text"
                  placeholder="Enter phone number"
                  value={newStaff.phone}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="staff-location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  id="staff-location"
                  type="text"
                  placeholder="Enter address"
                  value={newStaff.location}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Staff"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Management</h2>
            <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              {filteredUsers.length} user
            </span>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-gray-100 px-6 py-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by username, email, or phone..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <svg
                    className="animate-spin h-10 w-10 text-blue-500 mb-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-gray-500">loading user</p>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <React.Fragment key={user.userId || user.id}>
                        <tr
                          className={`hover:bg-gray-50 cursor-pointer ${
                            expandedUserId === (user.userId || user.id)
                              ? "bg-gray-50"
                              : ""
                          }`}
                          onClick={() =>
                            toggleUserDetails(user.userId || user.id)
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-500 font-medium text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(user.userId || user.id);
                              }}
                              className="text-red-600 hover:text-red-800 transition duration-300 ease-in-out"
                              disabled={loading}
                            >
                              Deactive
                            </button>
                          </td>
                        </tr>
                        {expandedUserId === (user.userId || user.id) && (
                          <tr>
                            <td
                              colSpan="4"
                              className="px-6 py-4 bg-gray-50 border-t border-gray-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">
                                    Username:
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {user.username}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">
                                    Email:
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {user.email}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">
                                    Phone:
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {user.phone || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">
                                    Location:
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {user.location || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">
                                    Role:
                                  </p>
                                  <p className="text-sm text-gray-900">
                                    {user.userRoles && user.userRoles.length > 0
                                      ? user.userRoles
                                          .map((role) => role.roleName)
                                          .join(", ")
                                      : "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">
                                    Status:
                                  </p>
                                  <p
                                    className={`text-sm ${
                                      user.status
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {user.status ? "Active" : "Inactive"}
                                  </p>
                                </div>
                                {user.skinTypeName && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Skin Type:
                                    </p>
                                    <p className="text-sm text-gray-900">
                                      {user.skinTypeName}
                                    </p>
                                  </div>
                                )}
                                {user.wallet !== undefined && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">
                                      Wallet Balance:
                                    </p>
                                    <p className="text-sm text-gray-900">
                                      ${user?.wallet?.toFixed(2) || 0}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <p className="text-gray-500">No users found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                  <span className="font-medium">
                    {indexOfLastUser > filteredUsers.length
                      ? filteredUsers.length
                      : indexOfLastUser}
                  </span>{" "}
                  of <span className="font-medium">{filteredUsers.length}</span>{" "}
                  results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages).keys()].map((number) => (
                    <button
                      key={number + 1}
                      onClick={() => paginate(number + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === number + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {number + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
