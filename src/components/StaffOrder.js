import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  Autocomplete,
  Snackbar,
  Alert,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Inventory, 
  Person, 
  Phone, 
  Home, 
  CalendarToday, 
  ShoppingCart,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import cookieUtils from '../utils/cookies';

const StaffOrder = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [ordersPerPage] = useState(10);
  
  // Sorting states
  const [sortField, setSortField] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState('desc');

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
      
      // Ensure orders are properly processed with status names
      const processedData = data.map(order => {
        return {
          ...order,
          // Make sure statusName is correctly set based on actual status
          statusName: getStatusNameFromId(order.statusId || order.statusID)
        };
      });
      
      setOrders(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert status ID to statusName
  const getStatusNameFromId = (statusId) => {
    switch (Number(statusId)) {
      case 3: return 'Waiting';
      case 4: return 'Shipping';
      case 5: return 'Completed';
      case 6: return 'Canceled';
      default: return 'Unknown';
    }
  };

  // Helper function to get status ID from name
  const getStatusId = (statusName) => {
    switch (statusName) {
      case 'Waiting': return 3;
      case 'Shipping': return 4;
      case 'Completed': return 5;
      case 'Canceled': return 6;
      default: return 3;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user.token]);

  const fetchUserDetails = async (userID) => {
    try {
      const response = await fetch(`http://localhost:5296/api/user/${userID}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      setUserDetails(prev => ({ ...prev, [userID]: data }));
    } catch (err) {
      console.error('Error fetching user details:', err.message);
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
        return { bg: '#fff8e1', text: '#ffa000', icon: 'schedule' };
      case 'Shipping':
        return { bg: '#e3f2fd', text: '#1976d2', icon: 'local_shipping' };
      default:
        return { bg: '#fff8e1', text: '#ffa000', icon: 'schedule' };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const updateOrderStatus = async (orderId, statusName) => {
    try {
      setUpdatingOrderId(orderId);
      
      // Get status ID from name
      const statusId = getStatusId(statusName);
      
      const response = await fetch(`http://localhost:5296/api/order/status/${orderId}/${statusId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
  
      // Update orders state after successful status update
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, statusName: statusName, statusId: statusId } : order
      ));
      
      setUpdateMessage(`Order #${orderId} has been marked as ${statusName}`);
      setUpdateSuccess(true);
      
      // Refresh the order list after updating status
      fetchOrders();
    } catch (err) {
      console.error('Update order status error:', err);
      setUpdateMessage(`Failed to update order: ${err.message}`);
      setUpdateSuccess(false);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCloseSnackbar = () => {
    setUpdateMessage('');
  };

  // Sort orders function
  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'orderDate':
          comparison = new Date(b.orderDate) - new Date(a.orderDate);
          break;
        case 'totalAmount':
          comparison = b.totalAmount - a.totalAmount;
          break;
        case 'statusId':
          // Use getStatusId to ensure consistent comparison
          comparison = getStatusId(b.statusName) - getStatusId(a.statusName);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? -comparison : comparison;
    });
  };

  // Change page handler
  const handlePageChange = (event, value) => {
    setPage(value);
    setExpandedOrder(null); // Close any expanded orders when changing page
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSortField(event.target.value);
  };

  // Handle sort direction change
  const handleSortDirectionChange = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`http://localhost:5296/api/order/cancelorder/${orderId}`, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json',
          },
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to cancel order: ${errorText}`);
      }

      // Update the order status in the current state to show immediate feedback
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, statusName: 'Canceled', statusId: 6 } : order
      ));
      
      setUpdateMessage(`Order #${orderId} has been canceled`);
      setUpdateSuccess(true);
    } catch (err) {
      console.error('Cancel order error:', err);
      setUpdateMessage(`Failed to cancel order: ${err.message}`);
      setUpdateSuccess(false);
    } finally {
      setUpdatingOrderId(null);
    }
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

  // Calculate counts for the status cards
  const pendingCount = orders.filter(order => order.statusName === 'Waiting').length;
  const completedCount = orders.filter(order => order.statusName === 'Completed').length;
  const canceledCount = orders.filter(order => order.statusName === 'Canceled').length;

  // Get current orders for pagination
  const indexOfLastOrder = page * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const sortedAndFilteredOrders = sortOrders(orders);
  const currentOrders = sortedAndFilteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar 
        open={!!updateMessage} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={updateSuccess ? "success" : "error"} 
          sx={{ width: '100%' }}
        >
          {updateMessage}
        </Alert>
      </Snackbar>

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
                {pendingCount}
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
                {completedCount}
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
                {canceledCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortField}
            onChange={handleSortChange}
            label="Sort By"
          >
            <MenuItem value="orderDate">Order Date</MenuItem>
            <MenuItem value="totalAmount">Total Amount</MenuItem>
            <MenuItem value="statusId">Status</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={handleSortDirectionChange}>
          {sortDirection === 'asc' ? '↑' : '↓'}
        </IconButton>
      </Box>

      <Box sx={{ mb: 4 }}>
        {currentOrders.map(order =>  (
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
                          bgcolor: order.statusName === 'Canceled' ? '#c62828' : '#E91E63',
                          boxShadow: order.statusName === 'Canceled' 
                            ? '0 2px 10px rgba(198, 40, 40, 0.2)' 
                            : '0 2px 10px rgba(233, 30, 99, 0.2)'
                        }}
                      >
                        {order.statusName === 'Canceled' ? <Cancel /> : <ShoppingCart />}
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
                        <Typography variant="h6" fontWeight="bold" color={order.statusName === 'Canceled' ? '#c62828' : '#E91E63'}>
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
                          disabled={updatingOrderId === order.id}
                        >
                          {expandedOrder === order.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {order.statusName === 'Waiting' && (
                          <IconButton 
                            onClick={() => handleCancelOrder(order.id)}
                            sx={{ 
                              bgcolor: '#f5f5f5', 
                              '&:hover': { bgcolor: '#ffebee', color: '#c62828' },
                              transition: 'all 0.2s'
                            }}
                            disabled={updatingOrderId === order.id}
                          >
                            <Typography variant="body2">Cancel</Typography>
                          </IconButton>
                        )}
                        {order.statusName === 'Completed' && (
                          <CheckCircle sx={{ color: '#34a853' }} />
                        )}
                        {order.statusName === 'Canceled' && (
                          <Cancel sx={{ color: '#c62828' }} />
                        )}
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
                            {order.details && order.details.map((detail, index) => (
                              <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                  {detail.productName}
                                </TableCell>
                                <TableCell align="right">{detail.quantity}</TableCell>
                                <TableCell align="right">{formatCurrency(detail.unitPrice)}</TableCell>
                                <TableCell align="right">{formatCurrency(detail.quantity * detail.unitPrice)}</TableCell>
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
                                <Typography variant="subtitle2" fontWeight="bold" color={order.statusName === 'Canceled' ? '#c62828' : '#E91E63'}>
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

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={Math.ceil(orders.length / ordersPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
};

export default StaffOrder;