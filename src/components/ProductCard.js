import { Card, CardMedia, CardContent, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      position: "bottom-center",
      autoClose: 1000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
    });
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.productImages[0]}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {product.name}
          </h2>
          <p className="text-sm text-gray-600">
            Suitable for {product.skinType} skin
          </p>
          <h3 className='text-lg font-semibold mt-2 text-green-600'>
            {`Quantity: ${product.stockQuantity}`}
          </h3>
        </div>
        <div>
          <p className="text-xl font-semibold mt-3 text-[#E91E63]">
            ${product.price}
          </p>
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
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 