import { Container, Grid2 } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (product) => {
    try {
      if (!user) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
        navigate('/login');
        return;
      }

      if (product.stockQuantity < 1) {
        toast.error('Sản phẩm đã hết hàng');
        return;
      }

      await addToCart(product, 1);
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5296/api/product');
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <h1 className="text-4xl font-semibold text-[#2C3E50] mb-20">
        Available Products
      </h1>
      <Grid2 container spacing={3}>
        {products.items?.length > 0 ? (
          products.items.map(product => (
            <Grid2 
              size={2.4}
              key={product.id}
            >
              <ProductCard 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            </Grid2>
          ))
        ) : (
          <Grid2>
            <p className="text-base">No products available.</p>
          </Grid2>
        )}
      </Grid2>
    </Container>
  );
};

export default Products;