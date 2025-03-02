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
    city: '',
    district: '',
    ward: '',
    streetAddress: '', // Địa chỉ nhà cụ thể
    paymentMethod: 'COD'
  });

  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showQR, setShowQR] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Thêm useEffect để set thông tin user làm giá trị mặc định
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        // Thêm các trường khác nếu cần
      }));
    }
  }, [user]);

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

  // Modal chọn phương thức thanh toán
  const PaymentMethodModal = () => (
    <Dialog open={openPaymentModal} onClose={() => setOpenPaymentModal(false)}>
      <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset">
          <FormLabel component="legend">Phương thức thanh toán</FormLabel>
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <FormControlLabel value="COD" control={<Radio />} label="Thanh toán khi nhận hàng (COD)" />
            <FormControlLabel value="QR" control={<Radio />} label="Thanh toán qua QR" />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenPaymentModal(false)} color="primary">
          Hủy
        </Button>
        <Button onClick={handlePaymentSubmit} color="primary" variant="contained">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Thay vì dùng qrcode.react, ta có thể dùng URL của QR trực tiếp
  const QRCodeComponent = ({ value }) => (
    <img 
      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`}
      alt="QR Code"
      style={{ width: 256, height: 256 }}
    />
  );

  // Modal hiển thị QR và thông báo thành công
  const SuccessModal = () => (
    <Dialog open={showQR} onClose={() => setShowQR(false)}>
      <DialogTitle>Đặt hàng thành công!</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tổng tiền: ${getCartTotal()}
          </Typography>
          <QRCodeComponent 
            value={`Thanh toan don hang: ${getCartTotal()} USD`}
          />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Quét mã QR để thanh toán
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setShowQR(false);
          navigate('/orders');
        }} color="primary">
          Xem đơn hàng
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handlePaymentSubmit = async () => {
    setOpenPaymentModal(false);
    
    try {
      const selectedCity = cities.find(c => c.code === formData.city)?.name || '';
      const selectedDistrict = districts.find(d => d.code === formData.district)?.name || '';
      const selectedWard = wards.find(w => w.code === formData.ward)?.name || '';
      
      const fullAddress = `${formData.streetAddress}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`;

      const orderRequest = {
        userId: parseInt(user.id),
        orderDetails: cart.map(item => ({
          productId: parseInt(item.id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        })),
        shippingAddress: {
          recipientName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: fullAddress,
          ward: selectedWard,
          district: selectedDistrict,
          city: selectedCity
        },
        totalAmount: parseFloat(getCartTotal()),
        paymentMethod: paymentMethod
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5296/api/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        throw new Error('Đặt hàng thất bại');
      }

      setOrderSuccess(true);
      clearCart();
      
      if (paymentMethod === 'QR') {
        setShowQR(true);
      } else {
        toast.success('Đặt hàng thành công!');
        navigate('/orders');
      }
      
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  // Sửa lại hàm handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenPaymentModal(true);
  };

  // Kiểm tra đăng nhập trước khi render form
  useEffect(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng');
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
        Thông tin đặt hàng
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  helperText="Bạn có thể thay đổi tên người nhận"
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
                  helperText="Email để nhận thông tin đơn hàng"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  helperText="Số điện thoại để nhận hàng"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Tỉnh/Thành phố"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  helperText="Chọn tỉnh/thành phố"
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
                  label="Quận/Huyện"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.city}
                  helperText={!formData.city ? "Vui lòng chọn tỉnh/thành phố trước" : "Chọn quận/huyện"}
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
                  label="Phường/Xã"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  disabled={!formData.district}
                  helperText={!formData.district ? "Vui lòng chọn quận/huyện trước" : "Chọn phường/xã"}
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
                  label="Địa chỉ cụ thể"
                  name="streetAddress"
                  multiline
                  rows={2}
                  value={formData.streetAddress}
                  onChange={handleChange}
                  placeholder="Nhập số nhà, tên đường..."
                  helperText="VD: Số 123 đường ABC"
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
              Đặt hàng
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