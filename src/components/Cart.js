import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    getCartItemsCount 
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Shopping Cart</h2>
      <div className="space-y-4">
        {cart.map(item => (
          <div 
            key={item.id} 
            className="flex items-center justify-between bg-white dark:bg-[#2A303C] p-4 rounded-lg shadow"
          >
            <div className="flex items-center space-x-4">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold dark:text-white">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">${item.price}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  -
                </button>
                <span className="dark:text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <div>
          <p className="text-lg dark:text-white">
            Total Items: {getCartItemsCount()}
          </p>
          <p className="text-xl font-bold dark:text-white">
            Total: ${getCartTotal()}
          </p>
        </div>
        <Button
          onClick={handleCheckout}
          variant="contained"
          sx={{ 
            bgcolor: '#E91E63',
            '&:hover': {
              bgcolor: '#C2185B'
            }
          }}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart; 