import React, { memo, useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import messages from '../constants/message.json';
import { TextField } from '@mui/material';

// Separate CartItem into its own memoized component
const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => {
  const [inputQuantity, setInputQuantity] = useState(item.quantity);

  // Update local state when item quantity changes
  useEffect(() => {
    setInputQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = (e) => {
    const newValue = e.target.value === '' ? '' : parseInt(e.target.value, 10);
    setInputQuantity(newValue);
  };

  const handleQuantityBlur = () => {
    let newQuantity = inputQuantity;
    
    // If empty or NaN, reset to 1
    if (inputQuantity === '' || isNaN(newQuantity)) {
      newQuantity = 1;
    }
    
    // Apply constraints
    newQuantity = Math.max(1, Math.min(newQuantity, item.stockQuantity));
    
    // Update state and call parent handler
    setInputQuantity(newQuantity);
    if (newQuantity !== item.quantity) {
      onUpdateQuantity(item.id, newQuantity, item.stockQuantity);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < item.stockQuantity) {
      onUpdateQuantity(item.id, item.quantity + 1, item.stockQuantity);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1, item.stockQuantity);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Trigger blur to update quantity
    }
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
          {console.log(item)}
          <img 
            src={item.productImage}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-gray-600">${item.price.toFixed(2)}</p>
          {item.stockQuantity !== undefined && (
            <p className="text-sm text-gray-500">
              Stock available: {item.stockQuantity}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDecrement}
            className={`px-2 py-1 rounded transition-colors ${
              item.quantity <= 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <TextField
            value={inputQuantity}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            onKeyDown={handleKeyDown}
            type="number"
            inputProps={{
              min: 1,
              max: item.stockQuantity,
              style: { 
                textAlign: 'center', 
                width: '32px', 
                padding: '0.25rem',
                appearance: 'textfield' 
              }
            }}
            size="small"
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgb(229, 231, 235)' },
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  '-webkit-appearance': 'none',
                  margin: 0
                }
              },
              width: '50px'
            }}
          />
          <button
            onClick={handleIncrement}
            className={`px-2 py-1 rounded transition-colors ${
              item.quantity >= item.stockQuantity 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={item.quantity >= item.stockQuantity}
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
});

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpdateQuantity = async (productId, newQuantity, stockQuantity) => {
    if (newQuantity > stockQuantity) {
      toast.error(messages.error.cart.exceedStock);
      return;
    }
    if (newQuantity < 1) {
      toast.error(messages.error.cart.minQuantity);
      return;
    }
    try {
      await updateQuantity(productId, newQuantity);
      toast.success(messages.success.updateQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(messages.error.cart.updateQuantity);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success(messages.success.removeProduct);
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error(messages.error.cart.removeProduct);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error(messages.error.checkout.requireLogin);
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-8 min-h-[100vh] flex flex-col items-center justify-center">
        <p className="text-gray-600">{messages.info.cart.empty}</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          {messages.info.cart.continueShopping}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[100vh]">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      <div className="space-y-4">
        {cart.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveFromCart}
          />
        ))}
      </div>
      <div className="mt-8 flex justify-between items-center">
        <div>
          <p className="text-lg">Total items: {getCartItemsCount()}</p>
          <p className="text-xl font-bold">Total amount: ${getCartTotal().toFixed(2)}</p>
        </div>
        <button
          onClick={handleCheckout}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart; 