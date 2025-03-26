import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Button, CircularProgress, Box, Chip, Paper, Rating, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
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
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import StarIcon from '@mui/icons-material/Star';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
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

  const handleAddToCart = async () => {
    if (!user) {
      toast.error(messages.error.addToCart.requireLogin);
      navigate('/login');
      return;
    }

    if (quantity < 1) {
      toast.error(messages.error.addToCart.minQuantity);
      return;
    }

    if (product.stockQuantity < quantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    try {
      await addToCart(product, quantity);
      toast.success(messages.success.addToCart.replace('{productName}', product.name));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value, 10);
    
    // If input is NaN, set to 1
    if (isNaN(value)) {
      value = 1;
    }
    
    // Ensure quantity is at least 1
    if (value < 1) {
      value = 1;
    }
    
    // Ensure quantity doesn't exceed stock
    if (product && value > product.stockQuantity) {
      value = product.stockQuantity;
    }
    
    setQuantity(value);
  };

  const isCustomer = user?.role?.[0]?.roleName === 'Customer';
  const isStaffOrManager = user && user.role && (user.role[0].roleName === 'Staff' || user.role[0].roleName === 'Manager');

  const handleSubmitReview = async () => {
    try {
      if (!rating) {
        toast.error(messages.error.feedback.required.rating);
        return;
      }

      const reviewData = {
        userId: user.id,
        productId: parseInt(id),
        rating: rating,
        comment: comment
      };

      await axios.post('/api/feedback', reviewData);
      toast.success(messages.success.feedback.create);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Refresh page to show new review
      window.location.reload();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(messages.error.feedback.create);
    }
  };

  const handleDeleteClick = (feedbackId) => {
    setFeedbackToDelete(feedbackId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/feedback/${feedbackToDelete}`);
      toast.success(messages.success.feedback.delete);
      setDeleteDialogOpen(false);
      // Refresh page to update reviews
      window.location.reload();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(messages.error.feedback.delete);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFeedbackToDelete(null);
  };

  const handleBrandClick = async () => {
    try {
      const response = await axios.get('/api/brand');
      const brandData = response.data.find(b => b.name === product.brand);
      if (brandData) {
        navigate(`/products?brand=${brandData.id}`);
      }
    } catch (error) {
      console.error("Error finding brand:", error);
    }
  };

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
                src={product.productImage}
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
                <p 
                  className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                  onClick={handleBrandClick}
                >
                  {product.brand}
                </p>
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
              
              {isCustomer && product.stockQuantity > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-lg font-semibold">Quantity</h3>
                  <TextField
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    inputProps={{
                      min: 1,
                      max: product.stockQuantity,
                      step: 1,
                      style: { 
                        textAlign: 'center',
                        appearance: 'textfield'
                      }
                    }}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      width: '70px',
                      '& .MuiOutlinedInput-root': {
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                          '-webkit-appearance': 'none',
                          margin: 0
                        }
                      }
                    }}
                  />
                  <div className="text-sm text-gray-500">
                    {product.stockQuantity > 0 
                      ? `Available: ${product.stockQuantity}` 
                      : "Out of stock"}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: '2',
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

            {/* Customer Reviews Section - Moved to bottom */}
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
                  <CommentIcon sx={{ color: '#E91E63' }} />
                  <h3 className="text-xl font-semibold">Customer Reviews</h3>
                </div>

                {/* Rating Statistics */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <StarIcon sx={{ color: '#E91E63', fontSize: '2rem' }} />
                    <span className="text-3xl font-bold text-gray-800">
                      {product.feedbacks && product.feedbacks.length > 0 
                        ? (product.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / product.feedbacks.length).toFixed(1)
                        : '0.0'
                      }
                    </span>
                  </div>
                  <div className="text-gray-500">
                    ({product.feedbacks?.length || 0} reviews)
                  </div>
                </div>

                {/* Add Review Section (only for logged-in customers) */}
                {user && user.role?.[0]?.roleName === 'Customer' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">Write a Review</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Rating
                          name="rating"
                          value={rating}
                          precision={1}
                          onChange={(event, newValue) => {
                            setRating(newValue);
                          }}
                          sx={{
                            '& .MuiRating-iconFilled': {
                              color: '#E91E63',
                            },
                          }}
                        />
                      </div>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Share your thoughts about this product..."
                        variant="outlined"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSubmitReview}
                        sx={{
                          bgcolor: '#E91E63',
                          '&:hover': {
                            bgcolor: '#C2185B'
                          },
                          alignSelf: 'flex-end'
                        }}
                      >
                        Submit Review
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {product.feedbacks?.map((feedback) => (
                    <Paper
                      key={feedback.id}
                      elevation={feedback.userID === user?.id ? 3 : 1}
                      sx={{
                        p: 3,
                        position: 'relative',
                        border: feedback.userID === user?.id ? '1px solid rgba(233, 30, 99, 0.2)' : 'none',
                        bgcolor: feedback.userID === user?.id ? 'rgba(233, 30, 99, 0.02)' : 'white'
                      }}
                    >
                      {/* Delete Button for User's Own Comments */}
                      {(feedback.userID === user?.id || isStaffOrManager) && (
                        <Button
                          onClick={() => handleDeleteClick(feedback.id)}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            minWidth: 'auto',
                            p: 1,
                            color: '#E91E63'
                          }}
                        >
                          <DeleteIcon />
                        </Button>
                      )}

                      <div className="flex items-start gap-4">
                        {/* User Avatar */}
                        {feedback.userID === user?.id ? (
                          user.image ? (
                            <img
                              src={`data:image/jpeg;base64,${user.image}`}
                              alt="User Avatar"
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#E91E63] flex items-center justify-center text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            U
                          </div>
                        )}

                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <Rating
                              value={feedback.rating}
                              readOnly
                              size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: '#E91E63',
                                },
                              }}
                            />
                            <span className="text-sm text-gray-500">
                              {new Date(feedback.createdDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{feedback.comment}</p>
                        </div>
                      </div>
                    </Paper>
                  ))}
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

      {/* Add Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Review"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {messages.confirm.delete.feedback}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ color: 'gray' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            sx={{ 
              color: '#E91E63',
              '&:hover': {
                bgcolor: 'rgba(233, 30, 99, 0.08)'
              }
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetail; 