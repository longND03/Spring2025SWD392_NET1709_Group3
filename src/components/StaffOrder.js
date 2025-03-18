import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Sử dụng useAuth thay vì AuthContext
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Grid, 
  Paper, 
  Divider, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Collapse,
  Badge,
  Autocomplete
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Inventory, 
  Person, 
  Phone, 
  Home, 
  CalendarToday, 
  ShoppingCart 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const StaffOrder = () => {
  const { user } = useAuth(); // Lấy thông tin người dùng từ useAuth
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5296/api/order/all', {
          headers: {
            'Authorization': `Bearer ${user.token}`, // Gửi token trong header
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.token]); // Thêm user.token vào dependency array

  const fetchUserDetails = async (userID) => {
    try {
      const response = await fetch(`http://localhost:5296/api/user/${userID}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`, // Gửi token trong header
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      setUserDetails(prev => ({ ...prev, [userID]: data }));
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    orders.forEach(order => {
      if (order.userID) {
        fetchUserDetails(order.userID);
      }
    });
  }, [orders]);

  const handleExpandOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: '#e6f4ea', text: '#34a853', icon: 'check-circle' };
      case 'Canceled':
        return { bg: '#fce8e6', text: '#ea4335', icon: 'cancel' };
      case 'Waiting':
      default:
        return { bg: '#fff8e1', text: '#ffa000', icon: 'schedule' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress color="secondary" />
    </Box>
  );
  
  if (error) return (
    <Paper elevation={3} sx={{ p: 3, bgcolor: '#ffdede', color: '#d32f2f', textAlign: 'center', borderRadius: 2 }}>
      <Typography variant="h6">Error: {error}</Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" color="#303030">
          Order Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Orders: {orders.length}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                bgcolor: '#e3f2fd', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Pending Orders
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="#1976d2">
                {orders.filter(order => order.statusName === 'Waiting').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                bgcolor: '#e8f5e9', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Completed Orders
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="#2e7d32">
                {orders.filter(order => order.statusName === 'Completed').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                bgcolor: '#ffebee', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Canceled Orders
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="#c62828">
                {orders.filter(order => order.statusName === 'Canceled').length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        {orders.map(order => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              sx={{ 
                mb: 2, 
                overflow: 'visible',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={1}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          bgcolor: '#E91E63',
                          boxShadow: '0 2px 10px rgba(233, 30, 99, 0.2)'
                        }}
                      >
                        <ShoppingCart />
                      </Avatar>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Box>
                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                          Order #{order.id}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ fontSize: 18, mr: 1, color: '#757575' }} />
                          <Typography variant="body2" color="text.secondary">
                            {userDetails[order.userID]?.username || 'User'} | 
                          </Typography>
                          <Phone sx={{ fontSize: 18, mx: 1, color: '#757575' }} />
                          <Typography variant="body2" color="text.secondary">
                            {userDetails[order.userID]?.phone || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Order Date
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 1, color: '#757575' }} />
                          <Typography variant="body2">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="#E91E63">
                          {formatCurrency(order.totalAmount)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip 
                          label={order.statusName || 'N/A'}
                          sx={{ 
                            bgcolor: getStatusColor(order.statusName).bg,
                            color: getStatusColor(order.statusName).text,
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            px: 1
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton 
                          onClick={() => handleExpandOrder(order.id)}
                          sx={{ 
                            bgcolor: '#f5f5f5', 
                            '&:hover': { bgcolor: '#e0e0e0' } 
                          }}
                        >
                          {expandedOrder === order.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                <Collapse in={expandedOrder === order.id}>
                  <Divider />
                  <Box sx={{ p: 3, bgcolor: '#fafafa' }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Home sx={{ fontSize: 20, mr: 1, color: '#757575', mt: 0.5 }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Shipping Address
                            </Typography>
                            <Typography variant="body2">
                              {order.address || 'No address provided'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Inventory sx={{ fontSize: 20, mr: 1, color: '#757575' }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Total Items
                            </Typography>
                            <Typography variant="body2">
                              {order.quantity} items
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Order Items
                      </Typography>
                      <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Price</TableCell>
                              <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {order.details.map((detail, index) => (
                              <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                  {detail.productName}
                                </TableCell>
                                <TableCell align="right">{detail.quantity}</TableCell>
                                <TableCell align="right">{formatCurrency(detail.price)}</TableCell>
                                <TableCell align="right">{formatCurrency(detail.quantity * detail.price)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} />
                              <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight="bold">
                                  Total
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="subtitle2" fontWeight="bold" color="#E91E63">
                                  {formatCurrency(order.totalAmount)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default StaffOrder;