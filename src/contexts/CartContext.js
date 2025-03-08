import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const fetchCart = () => {
    try {
      const localCart = localStorage.getItem('cart');
      setCart(localCart ? JSON.parse(localCart) : []);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCart([]);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []); // Remove user dependency since we're only using localStorage

  const addToCart = async (product, quantity = 1) => {
    try {
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        product: product,
        productImage: product.productImages?.[0],
        brand: product.brand,
        stockQuantity: product.stockQuantity
      };

      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        const updatedCart = existingItem
          ? prevCart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [...prevCart, newItem];
        
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Unable to add to cart');
    }
  };

  const updateQuantity = (productId, quantity) => {
    try {
      if (quantity < 1) return;

      setCart(prevCart => {
        const updatedCart = prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });

      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Unable to update quantity');
    }
  };

  const removeFromCart = (productId) => {
    try {
      setCart(prevCart => {
        const updatedCart = prevCart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
      toast.success('Item removed');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Unable to remove item');
    }
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 