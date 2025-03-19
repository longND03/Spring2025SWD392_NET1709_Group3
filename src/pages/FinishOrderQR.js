import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FinishOrderQR = () => {
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#E91E63] mb-8 text-center">Thank You for Your Purchase!</h1>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Order Details */}
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
            
            <div className="space-y-4">
              <div className="font-semibold">Order ID:</div>
              <div>{orderData.id || 'N/A'}</div>
              
              <div className="font-semibold">Order Date:</div>
              <div>{orderData.orderDate ? new Date(orderData.orderDate).toLocaleString() : 'N/A'}</div>
              
              <div className="font-semibold">Payment Method:</div>
              <div>QR Code Bank Transfer</div>
              
              <div className="font-semibold">Shipping Address:</div>
              <div>{orderData.address || 'N/A'}</div>
              
              <div className="font-semibold">Shipping Fee:</div>
              <div>${(orderData.shipprice || 0).toFixed(2)}</div>
              
              <div className="font-semibold">Total Amount:</div>
              <div>${(orderData.totalAmount || 0).toFixed(2)}</div>
            </div>
          </div>

          {/* Right Column - Payment Instructions */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Payment Instructions</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="mb-6">
                Please scan the QR code below and transfer the exact amount of ${(orderData.totalAmount || 0).toFixed(2)}.
                Use the following description for your transfer: <span className="font-semibold">ORDER_{orderData.id || 'N/A'}</span>
              </p>
              
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/payments/QR Bank.jfif" 
                  alt="Payment QR Code"
                  className="max-w-full object-contain"
                />
              </div>

              <p className="text-sm text-gray-600">
                After completing the transfer, please wait for our confirmation. You can check your order status in your order history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishOrderQR; 