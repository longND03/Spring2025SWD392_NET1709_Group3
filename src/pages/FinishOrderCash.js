import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FinishOrderCash = () => {
  const location = useLocation();
  const { user } = useAuth();
  const orderData = location.state?.orderData;

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Invalid Order</h1>
        <p className="mt-4">No order data found. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-[#E91E63] mb-8">Thank You for Your Purchase!</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Order Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="font-semibold">Order ID:</div>
              <div>{orderData.id}</div>
              
              <div className="font-semibold">Order Date:</div>
              <div>{new Date(orderData.orderDate).toLocaleString()}</div>
              
              <div className="font-semibold">Payment Method:</div>
              <div>Cash on Delivery</div>
              
              <div className="font-semibold">Shipping Address:</div>
              <div>{orderData.address}</div>
              
              <div className="font-semibold">Shipping Fee:</div>
              <div>${orderData.shipprice.toFixed(2)}</div>
              
              <div className="font-semibold">Total Amount:</div>
              <div>${orderData.totalAmount.toFixed(2)}</div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-2">
                {orderData.details.map((item, index) => (
                  <div key={index} className="flex justify-between text-left">
                    <span>{item.productName} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/profile?tab=orders"
              className="inline-block bg-[#E91E63] text-white px-6 py-3 rounded-md hover:bg-[#D81B60] transition-colors"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishOrderCash; 