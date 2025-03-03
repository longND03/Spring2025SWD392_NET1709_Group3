import React, { memo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Separate CartItem into its own memoized component
const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = async (newQuantity) => {
    try {
      if (newQuantity > item.stockQuantity) {
        toast.error('Quantity exceeds stock available');
        return;
      }
      if (newQuantity < 1) {
        toast.error('Quantity must be greater than 0');
        return;
      }
      await onUpdateQuantity(item.id, newQuantity, item.stockQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
          <img 
            src={item.productImage || item.imageURL}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/placeholder.jpg';
              e.target.onerror = null;
            }}
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
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className={`px-2 py-1 rounded transition-colors ${
              item.quantity <= 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
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
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount, addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (productId, newQuantity, stockQuantity) => {
    try {
      if (newQuantity > stockQuantity) {
        toast.error('Quantity exceeds stock available');
        return;
      }
      if (newQuantity < 1) {
        toast.error('Quantity must be greater than 0');
        return;
      }
      await updateQuantity(productId, newQuantity);
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Unable to update quantity');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Product removed');
    } catch (error) {
      console.error('Error removing product:', error);
      toast.error('Unable to remove product');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Your cart is empty</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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