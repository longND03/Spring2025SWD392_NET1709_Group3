import React, { useEffect, useState } from 'react';

const StaffOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5296/api/order/all');
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
  }, []);

  const fetchUserDetails = async (userID) => {
    try {
      const response = await fetch(`http://localhost:5296/api/user/${userID}`);
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

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Order Management</h2>
      <ul className="space-y-4">
        {orders.map(order => (
          <li key={order.id} className="p-4 border rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between">
              <span className="font-semibold">Order ID:</span>
              <span>{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">User ID:</span>
              <span>{order.userID}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Username:</span>
              <span>{userDetails[order.userID]?.username || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Phone:</span>
              <span>{userDetails[order.userID]?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Quantity:</span>
              <span>{order.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Address:</span>
              <span>{order.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Total Amount:</span>
              <span>{order.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Order Date:</span>
              <span>{new Date(order.orderDate).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Status:</span>
              <span>{order.status || 'N/A'}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffOrder;
