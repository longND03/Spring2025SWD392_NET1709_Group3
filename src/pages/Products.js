import { Container, Grid2, CircularProgress, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import messages from '../constants/message.json';
import { Paper, Box, Card, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Checkbox, FormGroup, FormControlLabel } from '@mui/material';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [skinTypes, setSkinTypes] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSkinTypes, setSelectedSkinTypes] = useState(
    searchParams.getAll('SkinTypeIds') || []
  );
  const [sortConfig, setSortConfig] = useState({
    field: searchParams.get('sortBy') || '',
    ascending: searchParams.get('ascending') !== 'false'
  });

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
        toast.error(messages.error.brands.load);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchSkinTypes = async () => {
      try {
        const response = await axios.get('/api/skintype?IsDeleted=false');
        setSkinTypes(response.data.items);
      } catch (error) {
        console.error("Error fetching skin types:", error);
        toast.error(messages.error.skinTypes.load);
      }
    };
    fetchSkinTypes();
  }, []);

  useEffect(() => {
    const brandFromUrl = searchParams.get('brand');
    const searchFromUrl = searchParams.get('search');
    const sortByFromUrl = searchParams.get('sortBy');
    const ascendingFromUrl = searchParams.get('ascending');
    const skinTypesFromUrl = searchParams.getAll('SkinTypeIds');
    
    if (brandFromUrl) {
      setSelectedBrand(brandFromUrl);
    }
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
    if (sortByFromUrl) {
      setSortConfig(prev => ({
        ...prev,
        field: sortByFromUrl,
        ascending: ascendingFromUrl !== 'false'
      }));
    }
    if (skinTypesFromUrl.length > 0) {
      setSelectedSkinTypes(skinTypesFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/api/product?PageNumber=${page}&PageSize=20&IsDeleted=false`;
        if (selectedBrand !== null) {
          url += `&BrandId=${selectedBrand}`;
        }
        if (searchQuery) {
          url += `&Name=${searchQuery}`;
        }
        if (sortConfig.field) {
          url += `&SortBy=${sortConfig.field}&Ascending=${sortConfig.ascending}`;
        }
        if (selectedSkinTypes.length > 0) {
          selectedSkinTypes.forEach(typeId => {
            url += `&SkinTypeIds=${typeId}`;
          });
        }
        const response = await axios.get(url);
        
        // Sort out-of-stock products to the end
        const sortedItems = [...response.data.items].sort((a, b) => {
          if (a.stockQuantity === 0 && b.stockQuantity > 0) return 1;
          if (a.stockQuantity > 0 && b.stockQuantity === 0) return -1;
          return 0;
        });

        setProducts({ ...response.data, items: sortedItems });
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(messages.error.loadProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, selectedBrand, searchQuery, sortConfig, selectedSkinTypes]);

  const handleBrandChange = (brandId) => {
    const newBrandId = selectedBrand === brandId ? null : brandId;
    setSelectedBrand(newBrandId);
    setPage(1);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (newBrandId) {
      newParams.set('brand', newBrandId);
    } else {
      newParams.delete('brand');
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (event) => {
    const newSearch = event.target.value;
    setSearchQuery(newSearch);
    setPage(1);

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (newSearch) {
      newParams.set('search', newSearch);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (event) => {
    const [field, ascending] = event.target.value.split(':');
    setSortConfig({
      field,
      ascending: ascending === 'true'
    });
    setPage(1);

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (field) {
      newParams.set('sortBy', field);
      newParams.set('ascending', ascending);
    } else {
      newParams.delete('sortBy');
      newParams.delete('ascending');
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkinTypeChange = (typeId) => {
    const newSelectedTypes = selectedSkinTypes.includes(typeId)
      ? selectedSkinTypes.filter(id => id !== typeId)
      : [...selectedSkinTypes, typeId];
    
    setSelectedSkinTypes(newSelectedTypes);
    setPage(1);

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('SkinTypeIds');
    newSelectedTypes.forEach(id => {
      newParams.append('SkinTypeIds', id);
    });
    setSearchParams(newParams);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <div className="relative mb-20 py-16 px-4 rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center">
        <img 
          src="https://www.shankara.in/cdn/shop/articles/13_Skincare_Tips_for_Dry_Skin___From_Cleansing_to_Moisturizing.jpg?v=1726823781&width=2048"
          alt="Cosmetics Background"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/60 via-[#9C27B0]/50 to-[#673AB7]/40"></div>
        <h1 className="text-4xl font-semibold text-white relative text-center z-10">
          Available Products
        </h1>
      </div>
      <Box sx={{ display: 'flex', gap: 6 }}>
        {/* Filters Sidebar */}
        <Paper sx={{ 
          p: 3, 
          width: '25%',
          height: 'fit-content',
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          bgcolor: '#f8f9fa',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          {/* Search Filter */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                color: '#2C3E50',
                borderBottom: '2px solid #E91E63',
                paddingBottom: 1
              }}>
              Search Products
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#E91E63',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#E91E63',
                  },
                },
              }}
            />
          </Box>

          {/* Sort Filter */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                color: '#2C3E50',
                borderBottom: '2px solid #E91E63',
                paddingBottom: 1
              }}>
              Sort By
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={sortConfig.field ? `${sortConfig.field}:${sortConfig.ascending}` : ''}
                onChange={handleSortChange}
                displayEmpty
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E91E63',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#E91E63',
                  },
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="Name:true">Name (A-Z)</MenuItem>
                <MenuItem value="Name:false">Name (Z-A)</MenuItem>
                <MenuItem value="Price:true">Price (Low to High)</MenuItem>
                <MenuItem value="Price:false">Price (High to Low)</MenuItem>
                <MenuItem value="StockQuantity:true">Stock (Low to High)</MenuItem>
                <MenuItem value="StockQuantity:false">Stock (High to Low)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Brand Filter */}
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              color: '#2C3E50',
              borderBottom: '2px solid #E91E63',
              paddingBottom: 1
            }}>
            Brands
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            maxWidth: '100%',
            mb: 4
          }}>
            {brands.map((brand) => (
              <Card
                key={brand.id}
                onClick={() => handleBrandChange(brand.id.toString())}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: selectedBrand === brand.id.toString() ? '#E91E63' : 'white',
                  color: selectedBrand === brand.id.toString() ? 'white' : '#2C3E50',
                  '&:hover': {
                    bgcolor: selectedBrand === brand.id.toString() ? '#C2185B' : '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  },
                  boxShadow: selectedBrand === brand.id.toString() ? 3 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: 'calc(100% - 8px)',
                  border: '1px solid #e0e0e0',
                  minHeight: '1.5rem'
                }}
              >
                <Typography sx={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {brand.name}
                </Typography>
              </Card>
            ))}
          </Box>

          {/* Skin Type Filter */}
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              color: '#2C3E50',
              borderBottom: '2px solid #E91E63',
              paddingBottom: 1
            }}>
            Skin Types
          </Typography>
          <FormGroup>
            {skinTypes.map((type) => (
              <FormControlLabel
                key={type.id}
                control={
                  <Checkbox
                    checked={selectedSkinTypes.includes(type.id.toString())}
                    onChange={() => handleSkinTypeChange(type.id.toString())}
                    sx={{
                      color: '#E91E63',
                      '&.Mui-checked': {
                        color: '#E91E63',
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.875rem' }}>
                    {type.name}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
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