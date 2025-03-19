import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Button, CircularProgress, Box, Chip } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import messages from '../constants/message.json';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/product/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
        toast.error(messages.error.loadProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error(messages.error.addToCart.requireLogin);
      return;
    }
    addToCart(product);
    toast.success(messages.success.addToCart.replace('{productName}', product.name));
  };

  const isCustomer = user?.role?.[0]?.roleName === 'Customer';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <p className="text-center text-xl">Product not found</p>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          {product.productImages && product.productImages.length > 0 ? (
            <img
              src={`data:image/jpeg;base64,${product.productImages[0]}`}
              alt={product.name}
              className="w-full rounded-lg shadow-lg object-cover"
              style={{ maxHeight: '500px' }}
            />
          ) : (
            <div className="w-full h-[500px] rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#E91E63]">
                ${product.price}
              </span>
              <span className="text-lg text-gray-500">
                ({product.stockQuantity} in stock)
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Brand</h3>
              <p className="text-gray-600 dark:text-gray-300">{product.brand}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Category</h3>
              <p className="text-gray-600 dark:text-gray-300">{product.category}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Suitable for</h3>
              <div className="flex flex-wrap gap-2">
                {product.productSkinTypes.map((type, index) => (
                  <Chip key={index} label={type} color="primary" />
                ))}
              </div>
            </div>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: '#E91E63',
                '&:hover': {
                  bgcolor: '#C2185B'
                }
              }}
              onClick={handleAddToCart}
              disabled={product.stockQuantity < 1 || !isCustomer}
            >
              {product.stockQuantity < 1 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </Grid>

        {/* Product Details Section */}
        <Grid item xs={12}>
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">How to Use</h3>
                <p className="text-gray-600 dark:text-gray-300">{product.direction}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Storage Instructions</h3>
                <p className="text-gray-600 dark:text-gray-300">{product.storage}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.productIngredients.map((ingredient, index) => (
                  <Chip key={index} label={ingredient} variant="outlined" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Additional Information</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li><strong>Formula Type:</strong> {product.formulationType}</li>
                  <li><strong>Packaging:</strong> {product.packaging}</li>
                  <li><strong>Period After Opening:</strong> {product.pao}</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Precautions</h3>
                <p className="text-gray-600 dark:text-gray-300">{product.precaution}</p>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail; 