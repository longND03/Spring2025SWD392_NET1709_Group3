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
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#E91E63]">Order Management</h2>
      <ul className="space-y-6">
        {orders.map(order => (
          <li key={order.id} className="p-5 bg-white border border-gray-300 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Order ID:</span>
                <span className="text-gray-700">{order.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">User ID:</span>
                <span className="text-gray-700">{order.userID}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Username:</span>
                <span className="text-gray-700">{userDetails[order.userID]?.username || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Phone:</span>
                <span className="text-gray-700">{userDetails[order.userID]?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Quantity:</span>
                <span className="text-gray-700">{order.quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Address:</span>
                <span className="text-gray-700">{order.address}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-gray-700">{order.totalAmount} đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Order Date:</span>
                <span className="text-gray-700">{new Date(order.orderDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Status:</span>
                <span className={`font-bold ${order.statusName === 'Completed' ? 'text-green-500' : order.statusName === 'Waiting' ? 'text-yellow-500' : 'text-red-500'}`}>
                  {order.statusName || 'N/A'}
                </span>
              </div>
            </div>
            {/* Hiển thị chi tiết sản phẩm */}
            {order.details.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold text-lg">Product Details:</h3>
                <ul className="list-disc pl-5">
                  {order.details.map((detail, index) => (
                    <li key={index} className="text-gray-700">
                      {detail.productName} - {detail.quantity} x {detail.price} đ
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffOrder;
