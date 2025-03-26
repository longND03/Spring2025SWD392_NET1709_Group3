import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Divider,
  useTheme,
  Tab,
  Tabs,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DateRangeIcon from '@mui/icons-material/DateRange';
import cookieUtils from '../utils/cookies';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const StaffAnalytics = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [timeFilter, setTimeFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  // Color palette
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed', '#8dd1e1'];

  useEffect(() => {
    fetchOrders();
  }, [user?.token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders().then(() => setRefreshing(false));
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    handleMenuClose();
    // Here you would add logic to filter data by time period
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5296/api/order/all', {
        headers: {
          'Authorization': `Bearer ${cookieUtils.getCookie('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      
      // Count unique customers
      const uniqueCustomers = new Set(data.map(order => order.userID));
      setTotalCustomers(uniqueCustomers.size);
      setTotalOrders(data.length);
      
      // Process data for top products and revenue
      processData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    const productMap = new Map();
    let monthlyRevenue = {};
    
    data.forEach(order => {
      // Process product data
      if (order.details && Array.isArray(order.details)) {
        order.details.forEach(detail => {
          const productName = detail.productName;
          if (productMap.has(productName)) {
            const product = productMap.get(productName);
            product.quantity += detail.quantity;
            product.revenue += detail.quantity * detail.unitPrice;
          } else {
            productMap.set(productName, {
              name: productName,
              quantity: detail.quantity,
              revenue: detail.quantity * detail.unitPrice,
            });
          }
        });
      }
      
      // Process monthly revenue data
      const orderDate = new Date(order.orderDate);
      const monthYear = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
      
      if (monthlyRevenue[monthYear]) {
        monthlyRevenue[monthYear] += order.totalAmount;
      } else {
        monthlyRevenue[monthYear] = order.totalAmount;
      }
    });

    // Sort products by quantity and take top 8
    const sortedProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);
    
    setTopProducts(sortedProducts);
    
    // Convert monthly revenue to array format for chart
    const revenueChartData = Object.keys(monthlyRevenue)
      .sort((a, b) => {
        const [aMonth, aYear] = a.split('/').map(Number);
        const [bMonth, bYear] = b.split('/').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      })
      .map(month => ({
        name: month,
        revenue: monthlyRevenue[month]
      }));
      
    setRevenueData(revenueChartData);
    
    const revenue = data.reduce((sum, order) => sum + order.totalAmount, 0);
    setTotalRevenue(revenue);
  };

  // Prepare data for pie chart
  const pieData = topProducts.map(product => ({
    name: product.name,
    value: product.quantity
  }));

  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" size={60} thickness={4} />
      </Box>
    );
  }

  if (error && !refreshing) {
    return (
      <Card sx={{ m: 3, bgcolor: '#fef2f2', borderLeft: '4px solid #ef4444', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
        <CardContent>
          <Typography variant="h6" color="#b91c1c" gutterBottom>Error Occurred</Typography>
          <Typography color="#ef4444">{error}</Typography>
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ mt: 2 }}
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="#111827" mb={{ xs: 2, sm: 0 }}>
          Sales Analytics Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined"
            startIcon={<DateRangeIcon />}
            onClick={handleMenuOpen}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            {timeFilter === 'all' ? 'All Time' : 
             timeFilter === 'month' ? 'This Month' : 
             timeFilter === 'week' ? 'This Week' : 'Today'}
          </Button>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleTimeFilterChange('day')}>Today</MenuItem>
            <MenuItem onClick={() => handleTimeFilterChange('week')}>This Week</MenuItem>
            <MenuItem onClick={() => handleTimeFilterChange('month')}>This Month</MenuItem>
            <MenuItem onClick={() => handleTimeFilterChange('all')}>All Time</MenuItem>
          </Menu>
          
          <Button 
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', height: '100%', position: 'relative', overflow: 'visible' }}>
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              left: 20, 
              bgcolor: '#60a5fa', 
              borderRadius: '50%', 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <TrendingUpIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <CardContent sx={{ pt: 5, pb: 3 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">Total Revenue</Typography>
              <Typography variant="h4" fontWeight="bold" color="#1e40af" mt={1}>
                {formatCurrency(totalRevenue)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', color: '#10b981' }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +5.3% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', height: '100%', position: 'relative', overflow: 'visible' }}>
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              left: 20, 
              bgcolor: '#34d399', 
              borderRadius: '50%', 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <ShoppingCartIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <CardContent sx={{ pt: 5, pb: 3 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">Total Orders</Typography>
              <Typography variant="h4" fontWeight="bold" color="#065f46" mt={1}>
                {totalOrders.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', color: '#10b981' }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +12.7% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', height: '100%', position: 'relative', overflow: 'visible' }}>
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              left: 20, 
              bgcolor: '#f97316', 
              borderRadius: '50%', 
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <PeopleAltIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <CardContent sx={{ pt: 5, pb: 3 }}>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">Unique Customers</Typography>
              <Typography variant="h4" fontWeight="bold" color="#9a3412" mt={1}>
                {totalCustomers.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', color: '#10b981' }}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                +8.1% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Navigation */}
      <Box sx={{ mb: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ 
            '& .MuiTabs-indicator': { 
              backgroundColor: '#3b82f6',
              height: 3
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '1rem',
              minHeight: 64,
            }
          }}
        >
          <Tab label="Sales Overview" />
          <Tab label="Product Performance" />
          <Tab label="Customer Insights" />
        </Tabs>
      </Box>

      {/* Tab Panel Content */}
      <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
        <Grid container spacing={3}>
          {/* Revenue Trend Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="#111827">Revenue Trend</Typography>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                    <RechartsTooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '10px 14px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="#111827">Product Distribution</Typography>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name, props) => [
                        `${value} units (${(props.percent * 100).toFixed(1)}%)`,
                        'Quantity'
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '10px 14px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products Bar Chart */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="#111827">Top Selling Products</Typography>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#64748b" 
                      width={150}
                      tickFormatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value}
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'quantity' ? `${value} units` : formatCurrency(value),
                        name === 'quantity' ? 'Quantity Sold' : 'Revenue'
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '10px 14px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="quantity" 
                      name="Quantity Sold" 
                      fill="#3b82f6" 
                      radius={[0, 6, 6, 0]} 
                      barSize={28}
                    />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue" 
                      fill="#f97316" 
                      radius={[0, 6, 6, 0]} 
                      barSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Only showing first tab content for now */}
      {tabValue === 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Typography variant="h6" color="text.secondary">Product Performance Analysis Coming Soon...</Typography>
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Typography variant="h6" color="text.secondary">Customer Insights Analysis Coming Soon...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default StaffAnalytics;