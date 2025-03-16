import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StaffProductManagement from './StaffProductManagement';
import { Divider } from '@mui/material';
import StaffBlogManagement from './StaffBlogManagement';
import StaffSkintypeTagManagement from './StaffSkintype&TagManagement';

const StaffManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products');

  // Update active tab when URL parameters change
  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'products');
  }, [searchParams]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab: tab });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-1/5 bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-center text-[#E91E63] mb-4">Staff Management</h1>
        <Divider/>
        <div className="flex flex-col mt-4">
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'products' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('products')}
          >
            Products & Batchs
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'skintypes & tags' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('skintypes & tags')}
          >
            Skintypes & Tags
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'vouchers' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('vouchers')}
          >
            Vouchers
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'orders' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('orders')}
          >
            Orders
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'blogs' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('blogs')}
          >
            Blogs
          </button>
        </div>
      </div>

      <div className="flex-grow p-6">
        {activeTab === 'products' && <StaffProductManagement/>}
        {activeTab === 'skintypes & tags' && <StaffSkintypeTagManagement/>}
        {activeTab === 'vouchers' && <div/>}
        {activeTab === 'orders' && <div>Order Management Content</div>}
        {activeTab === 'blogs' && <StaffBlogManagement/>}
      </div>
    </div>
  );
};

export default StaffManager;
