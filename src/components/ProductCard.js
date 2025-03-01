import { Card, CardMedia, CardContent, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${ product.name } added to cart!`, {
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
        </div>
        <div>
          <p className="text-xl font-semibold mt-4 text-[#E91E63]">
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