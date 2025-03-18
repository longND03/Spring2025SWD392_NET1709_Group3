import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Divider, 
  Box, 
  Typography, 
  Paper, 
  ListItemIcon, 
  ListItemText, 
  List, 
  ListItemButton 
} from '@mui/material';
import { 
  Inventory, 
  Analytics, 
  Category, 
  LocalOffer, 
  Inventory2, 
  ConfirmationNumber, 
  ShoppingCart, 
  Article, 
  Face 
} from '@mui/icons-material';

import StaffVoucher from './StaffVoucher';
import StaffOrder from './StaffOrder';
import StaffProductManagement from './StaffProductManagement';
import StaffBlogManagement from './StaffBlogManagement';
import StaffSkintypeTagManagement from './StaffSkintype&TagManagement';
import BrandCategoryManagement from './Brand&CategoryManagement';
import PackagingFormulationIngredientManagement from './PackagingFormulationIngredientManagement';
import StaffAnalytics from './StaffAnalytics';
import StaffSkinTest from './StaffSkinTest';

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

  // Menu items with icons
  const menuItems = [
    { id: 'products', label: 'Products & Batches', icon: <Inventory /> },
    { id: 'analytics', label: 'Analytics', icon: <Analytics /> },
    { divider: true },
    { id: 'brands & categories', label: 'Brands & Categories', icon: <Category /> },
    { id: 'skintypes & tags', label: 'Skintypes & Tags', icon: <LocalOffer /> },
    { 
      id: 'packaging & formulation & ingredient', 
      label: 'Packaging, Formulation & Ingredients', 
      icon: <Inventory2 />,
      shortLabel: 'Packaging & More'
    },
    { id: 'vouchers', label: 'Vouchers', icon: <ConfirmationNumber /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart /> },
    { id: 'blogs', label: 'Blogs', icon: <Article /> },
    { id: 'skintest', label: 'Skin Test', icon: <Face /> },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f7' }}>
      {/* Sidebar */}
      <Paper
        elevation={3}
        sx={{
          width: 280,
          flexShrink: 0,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          bgcolor: '#fff',
          borderRight: '1px solid #e0e0e0'
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              color: '#E91E63',
              mb: 1,
              letterSpacing: '0.5px'
            }}
          >
            Staff Management
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: '#E91E63',
              borderRadius: 4,
              mb: 2
            }}
          />
        </Box>

        <List sx={{ px: 2, flexGrow: 1 }}>
          {menuItems.map((item, index) => 
            item.divider ? (
              <Divider key={`divider-${index}`} sx={{ my: 2 }} />
            ) : (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => handleTabClick(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: '#E91E63',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#D81B60',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(233, 30, 99, 0.08)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: activeTab === item.id ? 'white' : '#E91E63', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={window.innerWidth < 1200 && item.shortLabel ? item.shortLabel : item.label}
                  primaryTypographyProps={{
                    fontWeight: activeTab === item.id ? 600 : 500,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            )
          )}
        </List>
        
        <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
          <Typography variant="caption" sx={{ color: '#9e9e9e', display: 'block', textAlign: 'center' }}>
            Staff Portal v1.2.0
          </Typography>
        </Box>
      </Paper>

      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 4, 
          bgcolor: '#f5f5f7',
          borderRadius: '0 0 0 40px',
          overflow: 'auto',
        }}
      >
        <Paper 
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 3,
            boxShadow: '0 0 20px rgba(0,0,0,0.05)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
            {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </Typography>
        </Paper>

        <Box sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {activeTab === 'vouchers' && <StaffVoucher />}
          {activeTab === 'orders' && <StaffOrder />}
          {activeTab === 'analytics' && <StaffAnalytics />}
          {activeTab === 'products' && <StaffProductManagement />}
          {activeTab === 'brands & categories' && <BrandCategoryManagement />}
          {activeTab === 'skintypes & tags' && <StaffSkintypeTagManagement />}
          {activeTab === 'packaging & formulation & ingredient' && <PackagingFormulationIngredientManagement />}
          {activeTab === 'blogs' && <StaffBlogManagement />}
          {activeTab === 'skintest' && <StaffSkinTest />}
        </Box>
      </Box>
    </Box>
  );
};

export default StaffManager;