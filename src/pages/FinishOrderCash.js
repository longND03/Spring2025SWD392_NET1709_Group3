import { useState, useEffect } from 'react';
import { useLocation, Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const FinishOrderCash = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getOrderId = () => {
    // Check location state first
    if (location.state?.orderId) {
      return location.state.orderId;
    }
    
    // Check if orderData in state already has an ID
    if (location.state?.orderData?.orderResponse?.id) {
      return location.state.orderData.orderResponse.id;
    }
    
    // Check URL parameters
    const paramOrderId = searchParams.get('orderId') || params.orderId;
    if (paramOrderId) {
      return paramOrderId;
    }
    
    // Check if we can extract from pathname
    const pathMatch = location.pathname.match(/\/order\/(\d+)/);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    
    return null;
  };

  useEffect(() => {
    const initialize = async () => {
      if (location.state?.orderData) {
        console.log('Using order data from location state:', location.state.orderData);
        setOrderData(location.state.orderData.orderResponse); // Accessing orderResponse directly
        setLoading(false);
        return;
      }
      
      const orderId = getOrderId();
      console.log('Identified order ID:', orderId);
      
      if (orderId) {
        await fetchOrderData(orderId);
      } else {
        console.error('No order ID available');
        setError('No order ID found. Please try again.');
        setLoading(false);
      }
    };

    initialize();
  }, [location]);

  const fetchOrderData = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token') || user?.token;
      console.log('Fetching order data for ID:', id);

      const response = await axios.get(`http://localhost:5296/api/order/id/${id}`, {
        headers: {
          'accept': '*/*',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });

      console.log('API Response:', response);
      console.log('API Response Data:', response.data);

      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      setOrderData(response.data.orderResponse); // Accessing orderResponse directly
      console.log('Order data set:', response.data.orderResponse);
    } catch (err) {
      console.error('Error fetching order data:', err);
      setError(`Failed to load order details: ${err.message}`);
      toast.error('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  // Format dates properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Calculate total for each item
  const calculateItemTotal = (item) => {
    return ((item.unitPrice || item.price || 0) * (item.quantity || 0)).toFixed(2);
  };

  console.log('Current order data state:', orderData);
  console.log('Loading state:', loading);
  console.log('Error state:', error);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold">Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-4">{error}</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700">
          Return to Home
        </Link>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Invalid Order</h1>
        <p className="mt-4">No order data found. Please try again.</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700">
          Return to Home
        </Link>
      </div>
    );
  }

  // Debug output of what we're about to render
  console.log('Rendering with order data:', {
    id: orderData.id,
    orderDate: orderData.orderDate,
    userName: orderData.userName,
    address: orderData.address,
    shipAmount: orderData.shipAmount,
    finalAmount: orderData.finalAmount,
    totalAmount: orderData.totalAmount,
    statusName: orderData.statusName,
    details: orderData.details
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#E91E63] mb-8 text-center">Thank You for Your Purchase!</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Order Details</h2>
            <Link
              to="/profile?tab=orders"
              className="inline-block bg-[#E91E63] text-white px-4 py-2 rounded-md hover:bg-[#D81B60] transition-colors text-sm"
            >
              View Order History
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="font-semibold">Order ID:</div>
            <div>{orderData?.id || 'N/A'}</div>
            
            <div className="font-semibold">Order Date:</div>
            <div>{formatDate(orderData?.orderDate)}</div>
            
            <div className="font-semibold">Payment Method:</div>
            <div>Cash on Delivery</div>
            
            <div className="font-semibold">Customer Name:</div>
            <div>{orderData?.userName || 'N/A'}</div>
            
            <div className="font-semibold">Shipping Address:</div>
            <div>{orderData?.address || 'N/A'}</div>
            
            <div className="font-semibold">Shipping Fee:</div>
            <div>${(orderData?.shipAmount || 0).toFixed(2)}</div>
            
            <div className="font-semibold">Total Amount:</div>
            <div>${(orderData?.finalAmount || orderData?.totalAmount || 0).toFixed(2)}</div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Order Items</h3>
            {orderData?.details && orderData.details.length > 0 ? (
              <div className="space-y-2">
                {orderData.details.map((item, index) => (
                  <div key={index} className="flex justify-between text-left border-b pb-2">
                    <div>
                      <span className="font-medium">{item.productName || 'Unknown Product'}</span>
                      <span className="text-gray-600 ml-2">x {item.quantity || 0}</span>
                    </div>
                    <span>${calculateItemTotal(item)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No items found</p>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Your order has been placed successfully and is currently in <span className="font-semibold">{orderData?.statusName || 'Processing'}</span> status.</p>
            <Link
              to="/"
              className="inline-block bg-[#E91E63] text-white px-6 py-2 rounded-md hover:bg-[#D81B60] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishOrderCash;