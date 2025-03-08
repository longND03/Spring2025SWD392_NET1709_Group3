import { Divider } from '@mui/material';
import { useState } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../api/axios';

const PersonalInfoBox = ({ userInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [editedInfo, setEditedInfo] = useState({
    username: userInfo?.username || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || ''
  });

  const validateForm = () => {
    const newErrors = {};
    if (!editedInfo.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!editedInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editedInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!editedInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({
      username: userInfo?.username || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || ''
    });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.patch(`/api/user/${userInfo.id}`, editedInfo);
      
      if (response.status === 200) {
        setIsEditing(false);
        toast.success('Profile updated successfully');
        // You might want to refresh the user info here
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChange = (field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <main className="p-5 bg-gray-50">
      <h1 className="text-6xl font-bold mb-5 text-center text-[#E91E63]">Profile</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 min-h-[calc(100vh-8rem)]">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className='text-3xl font-semibold'>Personal Information</h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 text-[#E91E63] hover:text-[#D81B60] px-3 py-1.5 rounded-md border border-[#E91E63] hover:bg-pink-50 transition-colors"
              >
                <FaPencilAlt /> Edit Profile
              </button>
            )}
          </div>
          <Divider />
          <div className='flex items-center w-full'>
            <div className='text-left w-1/2'>
              {!isEditing ? (
                <div className="space-y-3">
                  <p className="text-xl flex">
                    <span className="font-semibold w-40">Name:</span>
                    <span className="font-normal">{userInfo?.username || 'N/A'}</span>
                  </p>
                  <p className="text-xl flex">
                    <span className="font-semibold w-40">Email:</span>
                    <span className="font-normal">{userInfo?.email || 'N/A'}</span>
                  </p>
                  <p className="text-xl flex">
                    <span className="font-semibold w-40">Phone:</span>
                    <span className="font-normal">{userInfo?.phone || 'N/A'}</span>
                  </p>
                </div>
              ) : (
                <form className="space-y-6 max-w-md">
                  <div className="flex items-center gap-4">
                    <label className="text-lg text-gray-700 font-medium whitespace-nowrap w-[10rem]">
                      Name:
                    </label>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={editedInfo.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500
                          ${errors.username ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-300'}`}
                      />
                      {errors.username && (
                        <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-lg text-gray-700 font-medium whitespace-nowrap w-[10rem]">
                      Email:
                    </label>
                    <div className="flex-1">
                      <input
                        type="email"
                        value={editedInfo.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500
                          ${errors.email ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-300'}`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-lg text-gray-700 font-medium whitespace-nowrap w-[10rem]">
                      Phone:
                    </label>
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={editedInfo.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500
                          ${errors.phone ? 'border-red-500 animate-[shake_0.5s_ease-in-out]' : 'border-gray-300'}`}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex-1 bg-[#E91E63] text-white py-2 px-4 rounded-md hover:bg-[#D81B60] transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div className='flex justify-center items-center w-1/2'>
              {userInfo?.image ? (
                <img
                  src={userInfo?.image}
                  alt="User Avatar"
                  className="w-64 h-64 rounded-full object-cover"
                />
              ) : (
                <div className="w-64 h-64 text-7xl rounded-full bg-[#E91E63] flex items-center justify-center text-white mb-4">
                  {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PersonalInfoBox; 