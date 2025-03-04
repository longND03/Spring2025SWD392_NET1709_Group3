import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Grid, TextField, Button, Box, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel
} from '@mui/material';
import toast from 'react-hot-toast';
import axios from 'axios';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '1',
    district: '1',
    ward: '1',
    streetAddress: '',
    paymentMethod: 'COD'
  });

  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showQR, setShowQR] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Thêm state mới để lưu thông tin người dùng
  const [userData, setUserData] = useState(null);

  // Thêm useEffect để lấy thông tin người dùng từ API
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.id) {
        try {
          const response = await axios.get(`http://localhost:5296/api/user/${user.id}`);
          console.log('User data from API:', response.data); // Để debug dữ liệu

          // Điền sẵn form với dữ liệu người dùng từ API
          setFormData(prev => ({
            ...prev,
            // Đảm bảo truy cập đúng tên trường từ API response
            fullName: response.data.username || '', // Thay đổi từ fullName thành name
            email: response.data.email || '',
            phone: response.data.phone || '', // Thay đổi từ phoneNumber thành phone
          }));

          setUserData(response.data);
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
          toast.error('Không thể tải thông tin người dùng');
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Fetch city data when component mounts
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

  // Fetch districts when a city is selected
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

  // Fetch wards when a district is selected
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

  // Thêm useEffect để tự động fetch districts và wards khi component mount
  useEffect(() => {
    const fetchInitialLocations = async () => {
      try {
        // Fetch districts của Hà Nội
        const districtResponse = await fetch('https://provinces.open-api.vn/api/p/01?depth=2');
        const districtData = await districtResponse.json();
        setDistricts(districtData.districts);

        // Fetch wards của Ba Đình
        const wardResponse = await fetch('https://provinces.open-api.vn/api/d/001?depth=2');
        const wardData = await wardResponse.json();
        setWards(wardData.wards);
      } catch (error) {
        console.error('Error fetching initial locations:', error);
      }
    };

    fetchInitialLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Payment method selection modal
  const PaymentMethodModal = () => (
    <Dialog open={openPaymentModal} onClose={() => setOpenPaymentModal(false)}>
      <DialogTitle>Select Payment Method</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset">
          <FormLabel component="legend">Payment Method</FormLabel>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel value="COD" control={<Radio />} label="Cash on Delivery (COD)" />
            <FormControlLabel value="QR" control={<Radio />} label="QR Payment" />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenPaymentModal(false)} color="primary">
          Cancel
        </Button>
        <Button onClick={handlePaymentSubmit} color="primary" variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Instead of using qrcode.react, we can use the QR URL directly
  const QRCodeComponent = ({ value }) => (
    <img 
      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`}
      alt="QR Code"
      style={{ width: 256, height: 256 }}
    />
  );

  // Modal displaying QR and success message
  const SuccessModal = () => (
    <Dialog open={showQR} onClose={() => setShowQR(false)}>
      <DialogTitle>QR Payment</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" gutterBottom>
            Amount: ${getCartTotal()}
          </Typography>
          <QRCodeComponent 
            value={`Pay for order: ${getCartTotal()} USD`}
          />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Scan QR code to pay
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setShowQR(false);
          clearCart();
          navigate('/orders');
        }} color="primary">
          View Orders
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedCity = cities.find(c => c.code === formData.city)?.name || '';
      const selectedDistrict = districts.find(d => d.code === formData.district)?.name || '';
      const selectedWard = wards.find(w => w.code === formData.ward)?.name || '';
      
      const fullAddress = `${formData.streetAddress}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`;

      // Create order with user information from form
      const orderResponse = await axios.post('http://localhost:5296/api/order/create-order', {
        userId: user.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        paymentMethod: paymentMethod,
        orderItems: cart.map(item => ({
          productId: parseInt(item.id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        }))
      });

      if (orderResponse.data) {
        if (paymentMethod === 'QR') {
          try {
            // Call API to create payment according to Swagger structure
            const paymentResponse = await axios.post('http://localhost:5296/api/payment/create-payment', {
              orderID: orderResponse.data.id,
              paymentMethodID: 2, // 2 for QR payment
              address: fullAddress
            });

            if (paymentResponse.data) {
              setShowQR(true); // Show QR code
              toast.success('Please scan the QR code to complete payment');
            }
          } catch (paymentError) {
            console.error('Error creating payment:', paymentError);
            toast.error('Unable to create QR payment: ' + (paymentError.response?.data?.message || 'Please try again'));
          }
        } else {
          // COD payment
          toast.success('Order placed successfully');
          clearCart();
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Order failed: ' + (error.response?.data?.message || 'Please try again later'));
    }
  };

  // Modify handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenPaymentModal(true);
  };

  // Check login before rendering form
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to place an order');
      navigate('/login');
    }
  }, [user, navigate]);

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
    <Container sx={{ py: 8, bgcolor: '#f9f9f9', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom>
        Order Information
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
                  helperText="You can change the recipient's name"
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
                  helperText="Email to receive order information"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  helperText="Phone number for delivery"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  helperText="Select a city"
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
                  helperText={!formData.city ? "Please select a city first" : "Select a district"}
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
                  helperText={!formData.district ? "Please select a district first" : "Select a ward"}
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
                  label="Specific Address"
                  name="streetAddress"
                  multiline
                  rows={2}
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Enter house number, street name..."
                  helperText="E.g.: No. 123 ABC Street"
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
          <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff' }}>
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
      
      <PaymentMethodModal />
      <SuccessModal />
    </Container>
  );
};

export default Checkout; 