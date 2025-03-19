import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PersonalInfoBox from '../components/PersonalInfoBox';
import SecurityBox from '../components/SecurityBox';
import OrdersHistoryBox from '../components/OrdersHistoryBox';
import SkinRoutineBox from '../components/SkinRoutineBox';
import { useSearchParams } from 'react-router-dom';
import PointVoucherBox from '../components/PointVoucherBox';

const UserProfile = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(searchParams.get('tab') || 'info');

  // Update selected menu when URL parameters change
  useEffect(() => {
    setSelectedMenu(searchParams.get('tab') || 'info');
  }, [searchParams]);

  const handleMenuClick = (value) => {
    setSelectedMenu(value);
    setSearchParams({ tab: value });
  };

  const menuOptions = [
    { text: 'Profile', value: 'info' },
    { text: 'Security', value: 'security' },
    { text: 'Skin Routine', value: 'skinroutine' },
    { text: 'Points & Vouchers Store', value: 'points' },
    { text: 'Orders History', value: 'orders' },
  ];

  return (
    <div className="grid grid-cols-[17rem_1fr] min-h-[calc(100vh-4rem)] px-48 py-6">
      
      {/* side bar */}
      <aside className="bg-[#FADADD] border-r border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#FFB7C5]">
          <div className="p-3 flex flex-col items-center">
            {user?.image ? (
              <img
                src={user?.image}
                alt="User Avatar"
                className="w-20 h-20 rounded-full mb-3"
              />
            ) : (
              <div className="w-20 h-20 text-4xl rounded-full bg-[#E91E63] flex items-center justify-center text-white mb-3">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <h2 className="text-2xl font-semibold mt-1 mb-1">
              {user?.username || 'User'}
            </h2>
          </div>
        </div>
        <nav>
          {menuOptions.map((item) => (
            <button
              key={item.value}
              onClick={() => handleMenuClick(item.value)}
              className={`w-full text-left text-base font-semibold px-5 py-2 hover:bg-gray-100 transition-colors ${
                selectedMenu === item.value ? 'bg-gray-100 border-r-3 border-[#E91E63]' : ''
              }`}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </aside>

      {selectedMenu === "info" ? (
        <PersonalInfoBox userInfo={user} />
      ) : selectedMenu === "security" ? (
        <SecurityBox user={user} />
      ) : selectedMenu === "skinroutine" ? (
        <SkinRoutineBox userInfo={user} />
      ) : selectedMenu === "points" ? (
        <PointVoucherBox userInfo={user} />
      ) : selectedMenu === "orders" ? (
        <OrdersHistoryBox userInfo={user} />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default UserProfile;