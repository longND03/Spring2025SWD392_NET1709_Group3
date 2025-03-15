import { Container, Grid2, CircularProgress, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import messages from '../constants/message.json';

const Products = () => {
  const [products, setProducts] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/product?PageNumber=${page}&PageSize=20&IsDeleted=false`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error(messages.error.loadProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container sx={{ py: 4 }}>
      <h1 className="text-4xl font-semibold text-[#2C3E50] mb-20">
        Available Products
      </h1>
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
                  size={3}      // 3 cards per row on medium screens
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
    </Container>
  );
};

export default Products;