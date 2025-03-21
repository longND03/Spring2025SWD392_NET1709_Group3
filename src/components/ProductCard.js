import { Card, CardMedia, CardContent, Button, Chip } from '@mui/material';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import messages from '../constants/message.json';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    if (!user) {
      toast.error(messages.error.addToCart.requireLogin);
      return;
    }
    addToCart(product);
    // toast.success(messages.success.addToCart.replace('{productName}', product.name), {
    //   position: 'top-left',
    // });
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card 
      sx={{ 
        width: '12.5rem',
        height: '20rem',
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }
      }}
      onClick={handleCardClick}
    >
      <CardMedia
        component="img"
        image={product.productImage}
        alt={product.name}
        sx={{ 
          height: '6.25rem',
          width: '100%',
          objectFit: 'cover',
          objectPosition: 'center'
        }}
      />
      <CardContent sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        p: 2,
        overflow: 'hidden',
        pb: 2.5
      }}>
        <div className="space-y-1.5 flex-1">
          <div style={{ height: '2.5rem' }}>
            <h2 className="text-sm font-semibold mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
              {product.name}
            </h2>
            <p className="text-xs text-blue-600 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
              {product.brand}
            </p>
          </div>

          <div style={{ height: '2.5rem' }}>
            <h3 className="text-xs font-semibold mb-0.5 text-gray-600">Suitable for:</h3>
            <div className="flex flex-wrap gap-0.5 mb-1 overflow-hidden" style={{ maxHeight: '1.5rem' }}>
              {product.productSkinTypes.map((type, index) => (
                <Chip
                  key={index}
                  label={type}
                  size="small"
                  sx={{
                    bgcolor: '#E91E63',
                    '&:hover': {
                      bgcolor: '#C2185B'
                    },
                    height: '1.25rem',
                    '& .MuiChip-label': {
                      fontSize: '0.75rem',
                      padding: '0 0.5rem',
                      color: 'white'
                    },
                    color: 'white'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ height: '1rem' }}>
            <p className="text-xs font-semibold text-green-600">
              In Stock: {product.stockQuantity}
            </p>
          </div>

          <div className="mt-1.5 pt-1.5 border-t border-gray-200" style={{ height: '1.5rem' }}>
            <p className="text-base font-bold text-[#E91E63]">
              ${product.price}
            </p>
          </div>
        </div>

        <Button 
          variant="contained" 
          fullWidth
          size="small"
          sx={{ 
            mt: 1.5,
            bgcolor: '#E91E63',
            '&:hover': {
              bgcolor: '#C2185B'
            },
            fontSize: '0.8rem',
            padding: '4px 12px',
            minHeight: '1.875rem',
            '& .MuiButton-startIcon': {
              margin: '0 6px'
            }
          }} 
          onClick={handleAddToCart}
          disabled={product.stockQuantity < 1}
        >
          {product.stockQuantity < 1 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 