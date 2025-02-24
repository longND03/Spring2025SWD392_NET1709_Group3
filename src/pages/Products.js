import { Container, Grid, Card, CardMedia, CardContent, Typography, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success('Product added to cart!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5296/api/product');
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recommended Products
      </Typography>
      <Grid container spacing={3}>
        {products.length > 0 ? (
          products.map(product => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Suitable for {product.skinType} skin
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    ${product.price}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ 
                      mt: 1,
                      bgcolor: '#E91E63',
                      '&:hover': {
                        bgcolor: '#C2185B'
                      }
                    }} 
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1">No products available.</Typography>
        )}
      </Grid>
    </Container>
  );
};

export default Products;