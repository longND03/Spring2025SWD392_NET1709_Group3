import { Container, Grid2 } from '@mui/material';
import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
=======
import axios from 'axios';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import ProductCard from '../components/ProductCard';
>>>>>>> main

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
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

      console.log('Thêm vào giỏ hàng:', {
        product,
        userId: user.id
      });

      await addToCart(product, 1);
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };
=======
>>>>>>> main

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5296/api/product');
        console.log('API Response:', response.data);
        
        const productList = response.data.items || [];
        setProducts(productList);
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
<<<<<<< HEAD
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Đang tải...</Typography>
      </Container>
    );
=======
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <CircularProgress />
      </div>
    )
>>>>>>> main
  }

  return (
    <Container sx={{ py: 4 }}>
<<<<<<< HEAD
      <Typography variant="h4" gutterBottom>
        Sản phẩm
      </Typography>
      <Grid container spacing={3}>
        {products.length > 0 ? (
          products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.productImages?.[0] || '/placeholder.png'}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thương hiệu: {product.brand}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh mục: {product.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Còn lại: {product.stockQuantity}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    ${product.price}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    disabled={product.stockQuantity < 1}
                    sx={{ 
                      mt: 1,
                      width: '100%',
                      bgcolor: '#E91E63',
                      '&:hover': {
                        bgcolor: '#C2185B'
                      },
                      '&.Mui-disabled': {
                        bgcolor: '#ccc'
                      }
                    }} 
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.stockQuantity < 1 ? 'Hết hàng' : 'Thêm vào giỏ'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1">Không có sản phẩm.</Typography>
=======
      <h1 className="text-4xl font-semibold text-[#2C3E50] mb-20">
        Available Products
      </h1>
      <Grid2 container spacing={3}>
        {products.items?.length > 0 ? (
          products.items.map(product => (
            <Grid2 
              size={2.4}      // 4 cards per row on medium screens
              key={product.id}
            >
              <ProductCard product={product} />
            </Grid2>
          ))
        ) : (
          <Grid2>
            <p className="text-base">No products available.</p>
          </Grid2>
>>>>>>> main
        )}
      </Grid2>
    </Container>
  );
};

export default Products;