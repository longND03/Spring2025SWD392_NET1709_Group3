import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!user || !user.id) {
          toast.error('Please login to view profile');
          navigate('/login');
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5296/api/user/${user.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user information');
        }

        const data = await response.json();
        console.log('Profile data:', data);
        setUserInfo(data.user);
      } catch (error) {
        console.error('Profile fetch error:', error);
        toast.error('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [user, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  const displayUser = userInfo || user;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">User Profile</h1>
      <div className="shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center">
          {displayUser?.img && (
            <img src={displayUser.img} alt="User Avatar" className="w-32 h-32 rounded-full mb-4 border-2 border-gray-300" />
          )}
          <div className="space-y-4 w-full">
            <p className="font-semibold text-lg">Name: <span className="font-normal">{displayUser?.username || 'N/A'}</span></p>
            <p className="font-semibold text-lg">Email: <span className="font-normal">{displayUser?.email || 'N/A'}</span></p>
            <p className="font-semibold text-lg">Phone: <span className="font-normal">{displayUser?.phone || 'N/A'}</span></p>
            <p className="font-semibold text-lg">Location: <span className="font-normal">{displayUser?.location || 'N/A'}</span></p>
            <p className="font-semibold text-lg">Role: <span className="font-normal">{displayUser?.role || 'N/A'}</span></p>
            <p className="font-semibold text-lg">Joined: <span className="font-normal">{displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : 'N/A'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 