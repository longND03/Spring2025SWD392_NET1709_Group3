import { useEffect, useState } from 'react';
import { Divider, CircularProgress, Paper, Typography, Box, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import axios from 'axios';
import { CalendarToday, LocalAtm, ShoppingBag, Close } from '@mui/icons-material';

const OrdersHistoryBox = ({ userInfo }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get the token from local storage
        const token = localStorage.getItem('token');
        console.log("Token:", token);
        
        // Include the token in the request headers
        const response = await axios.get(
          `http://localhost:5296/api/order/user/${userInfo.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userInfo.id]);

  const fetchOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log("Fetching details for order ID:", orderId);
      
      const response = await axios.get(
        `http://localhost:5296/api/order/id/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.details) {
        console.log("Order Details:", response.data.details);
        setOrderDetails(response.data.details);
      } else {
        console.error("No details found in the response");
        setOrderDetails([]);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    console.log("Selected Order ID:", order.id);
    setSelectedOrder(order);
    fetchOrderDetails(order.id);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderDetails([]);
  };

  const getOrderStatusColor = (status) => {
    const statusMap = {
      'Delivered': '#4CAF50',
      'Waiting': '#FF9800',
      'Shipped': '#2196F3',
      'Complete': '#FFC107',
      'Cancelled': '#F44336'
    };
    
    return statusMap[status] || '#9E9E9E';
  };

  const getFormattedDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Do you want to cancel this order?")) {
      return;
    }

    // Find the order to check its status
    const orderToCancel = orders.find(order => order.id === orderId);
    
    if (orderToCancel && orderToCancel.statusName === 'Waiting') {
      try {
        const token = localStorage.getItem('token');
        const status = 6; // Assuming 6 is the status code for "Cancelled"

        const response = await axios.put(`http://localhost:5296/api/order/status/${orderId}/${status}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Update the orders state to reflect the cancellation
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, statusName: 'Cancelled' } : order
          )
        );
        alert(`Order #${orderId} has been canceled successfully.`);
      } catch (error) {
        console.error('Error canceling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    } else {
      alert('This order cannot be canceled because it is not in "Waiting" status.');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
      <CircularProgress color="secondary" />
    </Box>
  );
  
  if (error) return (
    <Paper elevation={3} sx={{ p: 4, m: 2, bgcolor: '#FFEBEE', borderRadius: 2 }}>
      <Typography variant="h6" color="error">Error loading your orders</Typography>
      <Typography>{error}</Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f9', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, mb: 4, bgcolor: '#E91E63', color: 'white' }}>
        <Typography variant="h3" fontWeight="bold" textAlign="center">
          My Orders
        </Typography>
        <Typography variant="subtitle1" textAlign="center" sx={{ mt: 1, opacity: 0.9 }}>
          Track and manage your purchase history
        </Typography>
      </Paper>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="600" color="#424242">
            <ShoppingBag sx={{ mr: 1, verticalAlign: 'middle' }} />
            Order History
          </Typography>
          <Chip 
            label={`${orders.length} orders`} 
            color="secondary" 
            size="small" 
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {orders.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {orders.map(order => (
              <Card 
                key={order.id} 
                elevation={1} 
                sx={{ 
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Order #{order.id}
                    </Typography>
                    <Chip 
                      label={order.statusName || 'Waiting'} 
                      sx={{ 
                        backgroundColor: getOrderStatusColor(order.statusName || 'Waiting'),
                        color: 'white',
                        fontWeight: '500'
                      }} 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 4 }, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ color: '#757575', mr: 1, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Date</Typography>
                        <Typography variant="body1">{getFormattedDate(order.orderDate)}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalAtm sx={{ color: '#757575', mr: 1, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total</Typography>
                        <Typography variant="body1" fontWeight="500">${order.finalAmount.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#E91E63', 
                        cursor: 'pointer', 
                        '&:hover': { textDecoration: 'underline' } 
                      }}
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Typography>
                  </Box>

                  {order.statusName === 'Waiting' && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#F44336', 
                          cursor: 'pointer', 
                          '&:hover': { textDecoration: 'underline' } 
                        }}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <ShoppingBag sx={{ fontSize: 60, color: '#E0E0E0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No orders found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Looks like you haven't placed any orders yet.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Chip 
                label="Start Shopping" 
                color="secondary" 
                clickable 
              />
            </Box>
          </Box>
        )}
      </Paper>

      {/* Order Details Dialog */}
      <Dialog 
        open={Boolean(selectedOrder)} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              bgcolor: '#f5f5f9',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="h6">
                Order Details #{selectedOrder.id}
              </Typography>
              <IconButton onClick={handleCloseDetails} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {detailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} color="secondary" />
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                    <Typography variant="body1">{getFormattedDate(selectedOrder.orderDate)}</Typography>
                    
                    <Box sx={{ display: 'flex', mt: 2, gap: 4 }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                        <Chip 
                          label={selectedOrder.statusName || 'Waiting'} 
                          size="small"
                          sx={{ 
                            backgroundColor: getOrderStatusColor(selectedOrder.statusName || 'Waiting'),
                            color: 'white',
                          }} 
                        />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                        <Typography variant="body1" fontWeight="bold">${selectedOrder.finalAmount.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" sx={{ mb: 2 }}>Items</Typography>
                  
                  <TableContainer component={Paper} elevation={0} variant="outlined">
                    <Table sx={{ minWidth: 500 }}>
                      <TableHead sx={{ bgcolor: '#f5f5f9' }}>
                        <TableRow>
                          <TableCell>Product ID</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Subtotal</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderDetails.length > 0 ? (
                          orderDetails.map((item) => (
                            <TableRow key={item.orderID + "-" + item.productId}>
                              <TableCell>{item.productId}</TableCell>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                              <TableCell align="right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">No item details available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrdersHistoryBox;