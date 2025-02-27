import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, TextField, Button, Box, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    streetAddress: '', // Địa chỉ nhà cụ thể
    paymentMethod: 'COD'
  });

  // Fetch dữ liệu thành phố khi component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to load cities data');
      }
    };
    fetchCities();
  }, []);

  // Fetch quận/huyện khi chọn thành phố
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.city) return;
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${formData.city}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts);
        setFormData(prev => ({ ...prev, district: '', ward: '' }));
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, [formData.city]);

  // Fetch phường/xã khi chọn quận/huyện
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.district) return;
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${formData.district}?depth=2`);
        const data = await response.json();
        setWards(data.wards);
        setFormData(prev => ({ ...prev, ward: '' }));
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    };
    fetchWards();
  }, [formData.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Tạo địa chỉ đầy đủ
      const selectedCity = cities.find(c => c.code === formData.city)?.name || '';
      const selectedDistrict = districts.find(d => d.code === formData.district)?.name || '';
      const selectedWard = wards.find(w => w.code === formData.ward)?.name || '';
      
      const fullAddress = `${formData.streetAddress}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`;

      const order = {
        ...formData,
        address: fullAddress,
        items: cart,
        totalAmount: getCartTotal(),
        orderDate: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5296/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      clearCart();
      toast.success('Order placed successfully!');
      navigate('/');
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5">Your cart is empty</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/products')}
          sx={{ mt: 2, bgcolor: '#E91E63', '&:hover': { bgcolor: '#C2185B' } }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  label="City/Province"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                >
                  {cities.map((city) => (
                    <MenuItem key={city.code} value={city.code}>
                      {city.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  label="District"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.city}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.code} value={district.code}>
                      {district.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Ward"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  disabled={!formData.district}
                >
                  {wards.map((ward) => (
                    <MenuItem key={ward.code} value={ward.code}>
                      {ward.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Street Address"
                  name="streetAddress"
                  multiline
                  rows={2}
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Enter your street address, house number"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                mt: 3, 
                mb: 2,
                bgcolor: '#E91E63',
                '&:hover': {
                  bgcolor: '#C2185B'
                }
              }}
            >
              Place Order
            </Button>
          </form>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            {cart.map((item) => (
              <Box key={item.id} sx={{ py: 1 }}>
                <Typography>
                  {item.name} x {item.quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${item.price * item.quantity}
                </Typography>
              </Box>
            ))}

            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="h6">
                Total: ${getCartTotal()}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout; 