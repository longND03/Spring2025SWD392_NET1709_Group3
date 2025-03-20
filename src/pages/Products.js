import { Container, Grid2, CircularProgress, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import messages from '../constants/message.json';
import { Paper, Box, Card, Typography } from '@mui/material';

const Products = () => {
  const [products, setProducts] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('/api/brand');
        setBrands(response.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
        toast.error("Failed to load brands");
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/api/product?PageNumber=${page}&PageSize=20&IsDeleted=false`;
        if (selectedBrand !== null) {
          url += `&BrandId=${selectedBrand}`;
        }
        const response = await axios.get(url);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(messages.error.loadProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, selectedBrand]);

  const handleBrandChange = (brandId) => {
    setSelectedBrand(selectedBrand === brandId ? null : brandId);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <h1 className="text-4xl font-semibold text-[#2C3E50] mb-20">
        Available Products
      </h1>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Brand Filter Sidebar */}
        <Paper sx={{ 
          p: 3, 
          width: '25%',
          height: 'fit-content',
          position: 'sticky',
          top: '2rem'
        }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Brands
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            maxWidth: '100%'
          }}>
            {brands.map((brand) => (
              <Card
                key={brand.id}
                onClick={() => handleBrandChange(brand.id.toString())}
                sx={{
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: selectedBrand === brand.id.toString() ? '#E91E63' : 'white',
                  color: selectedBrand === brand.id.toString() ? 'white' : 'inherit',
                  '&:hover': {
                    bgcolor: selectedBrand === brand.id.toString() ? '#C2185B' : '#f5f5f5',
                    transform: 'translateY(-2px)',
                  },
                  boxShadow: selectedBrand === brand.id.toString() ? 3 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: 'calc(100% - 8px)', // Account for gap
                }}
              >
                <Typography sx={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}>
                  {brand.name}
                </Typography>
              </Card>
            ))}
          </Box>
        </Paper>

        {/* Products Grid */}
        <Box sx={{ width: '75%' }}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <CircularProgress />
            </div>
          ) : (
            <>
              <Grid2 container spacing={3}>
                {products.items?.length > 0 ? (
                  products.items.map(product => (
                    <Grid2
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      key={product.id}
                    >
                      <ProductCard 
                        product={product} 
                        onAddToCart={async () => {
                          if (!user) {
                            toast.error(messages.error.addToCart.requireLogin);
                            navigate('/login');
                            return;
                          }

                          if (product.stockQuantity < 1) {
                            toast.error(messages.error.addToCart.outOfStock);
                            return;
                          }

                          await addToCart(product, 1);
                          toast.success(messages.success.addToCart.replace('{productName}', product.name));
                        }}
                      />
                    </Grid2>
                  ))
                ) : (
                  <Grid2>
                    <p className="text-base">{messages.info.noProducts}</p>
                  </Grid2>
                )}
              </Grid2>
              {products.items?.length > 0 && (
                <div className="flex justify-center mt-8">
                  <Pagination 
                    count={products.totalPages} 
                    page={page}
                    onChange={handlePageChange}
                    variant="outlined" 
                    shape="rounded" 
                  />
                </div>
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Products;