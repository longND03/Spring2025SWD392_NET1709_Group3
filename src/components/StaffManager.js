import React, { useState } from 'react';
import StaffVoucher from './StaffVoucher';

const StaffManager = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-1/4 bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-center text-[#E91E63] mb-4">Staff Management</h1>
        <div className="flex flex-col">
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'products' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'vouchers' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => setActiveTab('vouchers')}
          >
            Vouchers
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'orders' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'blogs' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => setActiveTab('blogs')}
          >
            Blogs
          </button>
        </div>
      </div>

      <div className="flex-grow p-6">
        {activeTab === 'products' && <div>Product Management Content</div>}
        {activeTab === 'vouchers' && <StaffVoucher />}
        {activeTab === 'orders' && <div>Order Management Content</div>}
        {activeTab === 'blogs' && <div>Blog Management Content</div>}
      </div>
    </div>
  );
};

export default StaffManager;
