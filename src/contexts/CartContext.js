import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth();

  const fetchCart = async () => {
    try {
      if (!user?.id) {
        const localCart = localStorage.getItem('cart');
        setCart(localCart ? JSON.parse(localCart) : []);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5296/api/cart/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải giỏ hàng');

      const data = await response.json();
      console.log('Raw cart data:', data);

      if (data && Array.isArray(data.cartProducts)) {
        const uniqueCartItems = data.cartProducts.filter((item, index, self) =>
          index === self.findIndex((t) => t.productId === item.productId)
        ).map(item => ({
          id: item.productId,
          name: item.productName,
          price: item.price,
          quantity: item.quantity,
          product: item.product,
          productImage: item.product?.productImages?.[0],
          brand: item.brand,
          stockQuantity: item.stockQuantity
        }));

        console.log('Processed cart items:', uniqueCartItems);
        setCart(uniqueCartItems);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error);
      toast.error('Không thể tải giỏ hàng');
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    try {
      if (!user?.id) {
        const updatedCart = [...cart];
        const existingItem = updatedCart.find(item => item.id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          updatedCart.push({ ...product, quantity });
        }
        
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success('Đã thêm vào giỏ hàng');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const cartRequest = {
        userId: parseInt(user.id),
        productId: parseInt(product.id),
        quantity: parseInt(quantity)
      };

      console.log('Gửi request:', cartRequest);

      const response = await fetch(`http://localhost:5296/api/cart/add-product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartRequest)
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Không thể thêm vào giỏ hàng');
      }

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
        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, newItem];
      });

      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity < 1) return;

      if (!user?.id) {
        setCart(prevCart => {
          const updatedCart = prevCart.map(item =>
            item.id === productId ? { ...item, quantity } : item
          );
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          return updatedCart;
        });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Vui lòng đăng nhập');

      const response = await fetch(`http://localhost:5296/api/cart/update-product`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(user.id),
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật số lượng');
      }

      setCart(prevCart => 
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );

      toast.success('Đã cập nhật số lượng');
    } catch (error) {
      console.error('Lỗi cập nhật số lượng:', error);
      toast.error(error.message || 'Không thể cập nhật số lượng');
      await fetchCart();
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (!user?.id) {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
        localStorage.setItem('cart', JSON.stringify(cart));
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Vui lòng đăng nhập');

      const response = await fetch(`http://localhost:5296/api/cart/remove-product`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          productId: productId
        })
      });

      if (!response.ok) throw new Error('Không thể xóa sản phẩm');

      await fetchCart();
      toast.success('Đã xóa sản phẩm');
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      toast.error(error.message);
    }
  };

  const clearCart = () => {
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