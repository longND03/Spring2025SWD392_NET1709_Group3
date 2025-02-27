import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import axios from '../api/axios';

const UserProfile = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('profile');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/product?PageNumber=2&PageSize=2");
        const data = res;

        setTest(data);
        console.log(data.data); // list
        console.log(data.TotalPages); // ko truy cap list
      } catch (error) {
        console.error('Profile fetch error:', error);
        toast.error('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get(`/api/user/${user.id}`);
        const data = res.data;

        setUserInfo(data);
      } catch (error) {
        console.error('Profile fetch error:', error);
        toast.error('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-[calc(100vh-4rem)]">
      <aside className="bg-[#FADADD] border-r border-gray-200">
        <div className="bg-[#FFB7C5]">
          <div className="p-4 flex flex-col items-center">
            {userInfo?.image ? (
              <img
                src={userInfo?.image}
                alt="User Avatar"
                className="w-24 h-24 rounded-full mb-4"
              />
            ) : (
              <div className="w-24 h-24 text-5xl rounded-full bg-[#E91E63] flex items-center justify-center text-white mb-4">
                {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <h2 className="text-xl font-semibold mt-2 mb-2">
              {userInfo?.username || 'User'}
            </h2>
          </div>
        </div>
        <nav>
            {[
              { text: 'Profile', value: 'profile' },
              { text: 'Orders History', value: 'orders' },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setSelectedMenu(item.value)}
                className={`w-full text-left font-semibold px-4 py-2 hover:bg-gray-100 transition-colors ${selectedMenu === item.value ? 'bg-gray-100 border-r-4 border-[#E91E63]' : ''
                  }`}
              >
                {item.text}
              </button>
            ))}
        </nav>
      </aside>

      {/* Profile */}
      <main className="p-6 bg-gray-50">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Profile</h1>
        <div className="bg-white shadow-lg rounded-lg p-8 min-h-[calc(100vh-10rem)]">
          <div className="space-y-4">
            <p className="font-semibold text-lg">Name: <span className="font-normal">{userInfo?.username || 'N/A'}</span></p>
            <p className="font-semibold text-lg">Email: <span className="font-normal">{userInfo?.email || 'N/A'}</span></p>
            <p className="font-semibold text-lg">Phone: <span className="font-normal">{userInfo?.phone || 'N/A'}</span></p>
            <p className="font-semibold text-lg">Location: <span className="font-normal">{userInfo?.location || 'N/A'}</span></p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile; 