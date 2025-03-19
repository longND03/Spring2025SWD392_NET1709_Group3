import { useState } from 'react';
import { FormControl, Modal, Divider } from '@mui/material';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import messages from '../constants/message.json';

const SecurityBox = ({ user }) => {
const { logout } = useAuth();

  const [passwordError, setPasswordError] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 1000);
      return;
    }

    try {
      const response = await axios.post(`/api/user/updatepassword/${user.id}`, {
        oldPassword: currentPassword,
        newPassword: newPassword
      });

      if (response.status >= 200 && response.status < 300) {
        setOpenSuccessModal(true);
        e.target.reset();
        
        setTimeout(() => {
          setOpenSuccessModal(false);
          logout();
        }, 5000);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(messages.error.server);
    }
  };

  return (
    <main className="p-4 bg-gray-50">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-center mb-7">Security</h1>
      <div className="bg-white shadow-lg rounded-lg p-4 min-h-[calc(100vh-6rem)]">
        <div className="space-y-2">
          <h2 className='text-2xl font-semibold'>Change password</h2>
          <Divider />
          <form onSubmit={handlePasswordReset} className="mt-4 space-y-4 max-w-md">
            <FormControl fullWidth variant="outlined" className="relative">
              <div className="flex items-center gap-3">
                <label htmlFor="currentPassword" className="text-sm text-gray-700 font-medium whitespace-nowrap w-32">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  placeholder="Enter current password"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm"
                  required
                />
              </div>
            </FormControl>
            
            <FormControl fullWidth variant="outlined" className="relative">
              <div className="flex items-center gap-3">
                <label htmlFor="newPassword" className="text-sm text-gray-700 font-medium whitespace-nowrap w-32">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  className={`flex-1 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                    ${passwordError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                  required
                />
              </div>
            </FormControl>

            <FormControl fullWidth variant="outlined" className="relative">
              <div className="flex items-center gap-3">
                <label htmlFor="confirmPassword" className="text-sm text-gray-700 font-medium whitespace-nowrap w-32">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className={`flex-1 px-3 py-1.5 border rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm
                    ${passwordError ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                  required
                />
              </div>
            </FormControl>

            <button
              type="submit"
              className="w-full bg-[#E91E63] text-white py-1.5 px-3 rounded-md hover:bg-[#D81B60] transition-colors duration-200 text-sm"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>

      <Modal
        open={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-white rounded-lg shadow-xl p-4 w-72 text-center">
          <h2 className="text-base font-semibold text-[#E91E63] mb-2">
            Password Updated Successfully
          </h2>
          <p className="text-sm text-gray-600">
            Your password has been changed. You will be logged out in 5 seconds.
          </p>
        </div>
      </Modal>
    </main>
  );
};

export default SecurityBox; 