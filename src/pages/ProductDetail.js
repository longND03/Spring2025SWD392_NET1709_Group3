import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Button, CircularProgress, Box, Chip, Paper } from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import messages from '../constants/message.json';
import ProductCard from '../components/ProductCard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ScienceIcon from '@mui/icons-material/Science';
import InfoIcon from '@mui/icons-material/Info';
import DescriptionIcon from '@mui/icons-material/Description';
import SpaIcon from '@mui/icons-material/Spa';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/product/${id}`);
        setProduct(response.data);
        
        // Fetch skin types and tags data
        const [skinTypesResponse, tagsResponse] = await Promise.all([
          axios.get('/api/skintype?IsDeleted=false'),
          axios.get('/api/tag')
        ]);

        // Create maps for quick lookup
        const skinTypeMap = new Map(skinTypesResponse.data.items.map(type => [type.name, type.id]));
        const tagMap = new Map(tagsResponse.data.map(tag => [tag.name, tag.id]));

        // Build query parameters
        let queryParams = [];
        
        // Add skin type IDs
        response.data.productSkinTypes.forEach(typeName => {
          const typeId = skinTypeMap.get(typeName);
          if (typeId) {
            queryParams.push(`SkinTypeIds=${typeId}`);
          }
        });

        // Add tag IDs
        response.data.productTags.forEach(tagName => {
          const tagId = tagMap.get(tagName);
          if (tagId) {
            queryParams.push(`TagIds=${tagId}`);
          }
        });

        queryParams.push('IsDeleted=false');
        
        const relatedResponse = await axios.get(`/api/product?${queryParams.join('&')}`);
        // Filter out the current product
        const filteredProducts = relatedResponse.data.items.filter(p => p.id !== parseInt(id));
        
        // Randomly select 5 products from filtered list
        const selectedProducts = [];
        const totalProducts = Math.min(5, filteredProducts.length);
        while (selectedProducts.length < totalProducts) {
          const randomIndex = Math.floor(Math.random() * filteredProducts.length);
          const randomProduct = filteredProducts[randomIndex];
          if (!selectedProducts.some(p => p.id === randomProduct.id)) {
            selectedProducts.push(randomProduct);
          }
        }
        setRelatedProducts(selectedProducts);
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
        {/* Product Image and Info */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              height: '100%',
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
              boxShadow: '0 4px 20px rgba(233, 30, 99, 0.1)',
              border: '1px solid rgba(233, 30, 99, 0.1)'
            }}
          >
            {product.productImage ? (
              <img
                src={`data:image/jpeg;base64,${product.productImage}`}
                alt={product.name}
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '500px' }}
              />
            ) : (
              <div className="w-full h-[500px] rounded-lg bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
              boxShadow: '0 4px 20px rgba(233, 30, 99, 0.1)',
              border: '1px solid rgba(233, 30, 99, 0.1)'
            }}
          >
            <div className="flex-grow space-y-4">
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
            </div>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 'auto',
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
          </Paper>
        </Grid>

        {/* Description Section - Full Width */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              mt: 4,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #E0E0E0'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <DescriptionIcon sx={{ color: '#E91E63' }} />
              <h2 className="text-2xl font-bold">Description</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {product.description}
            </p>
          </Paper>
        </Grid>

        {/* Product Details and Related Products */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E0E0E0'
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <LocalShippingIcon sx={{ color: '#E91E63' }} />
                      <h3 className="text-xl font-semibold">How to Use</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{product.direction}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <InfoIcon sx={{ color: '#E91E63' }} />
                      <h3 className="text-xl font-semibold">Storage Instructions</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{product.storage}</p>
                  </div>
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E0E0E0'
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ScienceIcon sx={{ color: '#E91E63' }} />
                  <h3 className="text-xl font-semibold">Ingredients</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.productIngredients.map((ingredient, index) => (
                    <Chip key={index} label={ingredient} variant="outlined" />
                  ))}
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  borderRadius: 2,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E0E0E0'
                }}
              >
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <InfoIcon sx={{ color: '#E91E63' }} />
                      <h3 className="text-xl font-semibold">Additional Information</h3>
                    </div>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li><strong>Formula Type:</strong> {product.formulationType}</li>
                      <li><strong>Packaging:</strong> {product.packaging}</li>
                      <li><strong>Period After Opening:</strong> {product.pao}</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <SpaIcon sx={{ color: '#E91E63' }} />
                      <h3 className="text-xl font-semibold">Precautions</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{product.precaution}</p>
                  </div>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Related Products Section */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              background: 'linear-gradient(145deg, #FFF5F7 0%, #FFE4E8 100%)',
              boxShadow: '0 4px 20px rgba(233, 30, 99, 0.1)',
              border: '1px solid rgba(233, 30, 99, 0.2)'
            }}
          >
            <h2 className="text-2xl font-bold mb-4 text-[#E91E63]">Related Products</h2>
            <div className="space-y-4">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="mb-4">
                  <div className="transform scale-90 origin-top">
                    <ProductCard product={relatedProduct} />
                  </div>
                </div>
              ))}
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail; 