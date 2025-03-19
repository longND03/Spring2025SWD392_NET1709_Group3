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
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
      onClick={handleCardClick}
    >
      <CardMedia
        component="img"
        image={`data:image/jpeg;base64,${product.productImage}`}
        alt={product.name}
        sx={{ 
          height: 250,
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
        p: 3 // Increase padding
      }}>
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold mb-2 line-clamp-2">
              {product.name}
            </h2>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-600">Suitable for:</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {product.productSkinTypes.map((type, index) => (
                <Chip
                  key={index}
                  label={type}
                  size="small"
                  color="primary"
                  sx={{
                    bgcolor: '#E91E63',
                    '&:hover': {
                      bgcolor: '#C2185B'
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold text-green-600">
              In Stock: {product.stockQuantity}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xl font-bold text-[#E91E63]">
              ${product.price}
            </p>
          </div>
        </div>

        <Button 
          variant="contained" 
          fullWidth
          sx={{ 
            mt: 3,
            bgcolor: '#E91E63',
            '&:hover': {
              bgcolor: '#C2185B'
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