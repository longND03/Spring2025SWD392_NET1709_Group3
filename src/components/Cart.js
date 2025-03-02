import React, { memo } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Tách CartItem thành component riêng và memo
const CartItem = memo(({ item, onUpdateQuantity, onRemove }) => (
  <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
        <img 
          src={item.productImages} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-gray-600">${item.price}</p>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1, item.stockQuantity)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          -
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1, item.stockQuantity)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          +
        </button>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="text-red-500 hover:text-red-700"
      >
        Xóa
      </button>
    </div>
  </div>
));

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemsCount, isLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (productId, newQuantity, stockQuantity) => {
    try {
      if (newQuantity > stockQuantity) {
        toast.error('Số lượng vượt quá hàng tồn kho');
        return;
      }
      if (newQuantity < 1) {
        toast.error('Số lượng phải lớn hơn 0');
        return;
      }
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Giỏ hàng trống</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Giỏ hàng</h2>
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
          <p className="text-lg">Tổng sản phẩm: {getCartItemsCount()}</p>
          <p className="text-xl font-bold">Tổng tiền: ${getCartTotal()}</p>
        </div>
        <button
          onClick={handleCheckout}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default Cart; 