import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import StaffVoucher from './StaffVoucher';

import StaffOrder from './StaffOrder';


import StaffProductManagement from './StaffProductManagement';
import { Divider } from '@mui/material';
import StaffBlogManagement from './StaffBlogManagement';
import StaffSkintypeTagManagement from './StaffSkintype&TagManagement';
import BrandCategoryManagement from './Brand&CategoryManagement';
import PackagingFormulationIngredientManagement from './PackagingFormulationIngredientManagement';
import StaffAnalytics from './StaffAnalytics';


const StaffManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products');


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
        <Divider sx={{ mb: 6 }}/>
        <div className="flex flex-col">
          <button

            className={`py-2 px-4 rounded-lg ${activeTab === 'products' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('products')}

            className={`py-2 px-4 rounded-lg ${activeTab === 'analytics' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('analytics')}

          >
            Analytics
          </button>

          <Divider variant="middle" sx={{ my: 2 }}/>

          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'products' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('products')}
          >
            Products & Batchs
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'brands & categories' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('brands & categories')}
          >
            Brands & Categories
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'skintypes & tags' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('skintypes & tags')}
          >
            Skintypes & Tags
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'packaging & formulation & ingredient' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('packaging & formulation & ingredient')}
          >
            Packagings, Formulations & Ingredients
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
            className={`py-2 px-4 rounded-lg ${activeTab === 'brands' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('brands')}
          >
            Brands
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'blogs' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('blogs')}
          >
            Blogs
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${activeTab === 'skintest' ? 'bg-[#E91E63] text-white' : 'text-[#E91E63]'} mb-2`}
            onClick={() => handleTabClick('skintest')}
          >
            Skin Test
          </button>
        </div>
      </div>

      <div className="flex-grow p-6">


        {activeTab === 'vouchers' && <StaffVoucher />}

        {activeTab === 'orders' && <StaffOrder />}


        {activeTab === 'analytics' && <StaffAnalytics />}
        {activeTab === 'products' && <StaffProductManagement />}
        {activeTab === 'brands & categories' && <BrandCategoryManagement />}
        {activeTab === 'skintypes & tags' && <StaffSkintypeTagManagement />}
        {activeTab === 'packaging & formulation & ingredient' && <PackagingFormulationIngredientManagement />}
      
       
        {activeTab === 'blogs' && <StaffBlogManagement />}

      </div>
    </div>
  );
};

export default StaffManager;
