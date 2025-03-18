import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import useShippingCalculator from '../hooks/useShippingCalculator';
import messages from '../constants/message.json';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, refetchUserData } = useAuth();
  const { shippingFee, loading: calculatingShipping, error: shippingError, calculateShipping } = useShippingCalculator();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    specificAddress: '',
    provinceName: ''
  });

  const paymentMethods = [
    { id: 1, methodName: 'Cash (COD)', isInternalPayment: true },
    { id: 2, methodName: 'VNPay', isInternalPayment: false },
    { id: 3, methodName: 'QR Code (Bank Transfer)', isInternalPayment: true }
  ];


  const fetchProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      toast.error(messages.error.location.provinces);
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      const data = await response.json();
      if (data && data.districts) {
        setDistricts(data.districts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error(messages.error.location.districts);
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data = await response.json();
      if (data && data.wards) {
        setWards(data.wards);
      }
    } catch (error) {
      console.error('Error fetching wards:', error);
      toast.error(messages.error.location.wards);
    }
  };

  useEffect(() => {
    if (!user) {
      toast.error(messages.error.checkout.requireLogin);
      navigate('/login');
      return;
    }

    const fetchVoucherDetails = async () => {
      if (!user.voucherStorage) return;

      try {
        const voucherPromises = user.voucherStorage.map(async (storage) => {
          const response = await axios.get(`/api/voucher/${storage.voucherId}`);
          return {
            ...response.data,
            quantity: storage.quantity,
            isAvailable: response.data.minimumPurchase <= getCartTotal()
          };
        });

          const voucherDetails = await Promise.all(voucherPromises);
          const sortedVouchers = voucherDetails.sort((a, b) => {
            if (a.isAvailable && !b.isAvailable) return -1;
            if (!a.isAvailable && b.isAvailable) return 1;
            return b.discountPercentage - a.discountPercentage;
          });
          
          setVouchers(sortedVouchers);
        } catch (error) {
          console.error('Error fetching voucher details:', error);
          toast.error(messages.error.vouchers.load);
        }
      };

    const initializeLocationData = async (provinceCode, districtCode) => {
      try {
        if (provinceCode) {
          await fetchDistricts(provinceCode);
          // Get province name but don't calculate shipping here
          const response = await fetch('https://provinces.open-api.vn/api/p/');
          const provincesData = await response.json();
          const provinceName = provincesData.find(p => p.code.toString() === provinceCode)?.name;
          if (provinceName) {
            // We'll handle shipping calculation in a separate useEffect
            setFormData(prev => ({
              ...prev,
              provinceName: provinceName
            }));
          }
        }
        if (districtCode) {
          await fetchWards(districtCode);
        }
      } catch (error) {
        console.error('Error initializing location data:', error);
      }
    };

    // Initialize user data
    setFormData(prev => ({
      ...prev,
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || ''
    }));

    // Initialize location data if available
    if (user.location) {
      const [specificAddress, wardCode, districtCode, provinceCode] = user.location.split('|');
      
      setFormData(prev => ({
        ...prev,
        specificAddress,
        province: provinceCode,
        district: districtCode,
        ward: wardCode
      }));

      initializeLocationData(provinceCode, districtCode);
    }

    // Fetch initial data
    fetchProvinces();
    fetchVoucherDetails();

  }, [user, navigate, getCartTotal]);

  // Separate useEffect for handling shipping calculations
  useEffect(() => {
    if (formData.provinceName) {
      calculateShipping(formData.provinceName);
    }
  }, [formData.provinceName]); // Only recalculate when province name changes

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        if (formData.province) {
          await fetchDistricts(formData.province);
        }
        if (formData.district) {
          await fetchWards(formData.district);
        }
      } catch (error) {
        console.error('Error fetching address data:', error);
      }
    };

    fetchAddressData();
  }, [formData.province, formData.district]);

  // Update handlers for address selection
  const handleProvinceChange = async (e) => {
    const selectedProvince = e.target.value;
    setFormData(prev => ({
      ...prev,
      province: selectedProvince,
      district: '',  // Reset district when province changes
      ward: '',      // Reset ward when province changes
      provinceName: provinces.find(p => p.code.toString() === selectedProvince)?.name || ''
    }));
    setDistricts([]); // Clear districts
    setWards([]); // Clear wards

    if (selectedProvince) {
      await fetchDistricts(selectedProvince);
    }
  };

  const handleDistrictChange = async (e) => {
    const selectedDistrict = e.target.value;
    setFormData(prev => ({
      ...prev,
      district: selectedDistrict,
      ward: ''  // Reset ward when district changes
    }));
    setWards([]); // Clear wards

    if (selectedDistrict) {
      await fetchWards(selectedDistrict);
    }
  };

  const handleWardChange = (e) => {
    setFormData(prev => ({
      ...prev,
      ward: e.target.value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceedToPayment = async () => {
    // Validate required fields
    if (!formData.phone || !formData.province || !formData.district || !formData.ward || !formData.specificAddress) {
      toast.error(messages.error.checkout.addressRequired);
      return;
    }

    // Validate payment method selection
    if (!selectedPaymentMethod) {
      toast.error(messages.error.checkout.paymentRequired);
      return;
    }

    // Prepare order data
    const orderData = {
      userID: user.id,
      address: `${formData.specificAddress}|${formData.ward}|${formData.district}|${formData.province}`,
      paymentMethodID: selectedPaymentMethod.id,
      voucherID: selectedVoucher?.id || 0,
      shipprice: shippingFee || 0,
      details: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    // Handle different payment methods
    switch (selectedPaymentMethod.id) {
      case 1: // Cash
        try {
          const response = await axios.post('/api/order/checkout', orderData);
          console.log('Order response:', response.data);
          clearCart();
          await refetchUserData(); // Refresh user data after successful order
          toast.success(messages.success.order);
          navigate('/finish-order-cash', { state: { orderData: response.data } });
        } catch (error) {
          console.error('Error creating order:', error);
          toast.error(messages.error.order.create);
        }
        break;

      case 2: // VNPay
        try {
          const response = await axios.post('/api/order/checkout', orderData);
          console.log('Order response:', response.data);
          clearCart();
          await refetchUserData(); // Refresh user data after successful order
          toast.success(messages.success.order);
          // TODO: Handle VNPay redirect
        } catch (error) {
          console.error('Error creating order:', error);
          toast.error(messages.error.order.create);
        }
        break;

      case 3: // QR Code
        try {
          const response = await axios.post('/api/order/checkout', orderData);
          console.log('Order response:', response.data);
          clearCart();
          await refetchUserData(); // Refresh user data after successful order
          toast.success(messages.success.order);
          navigate('/finish-order-qr', { state: { orderData: response.data } });
        } catch (error) {
          console.error('Error creating order:', error);
          toast.error(messages.error.order.create);
        }
        break;

      default:
        toast.error(messages.error.payment.invalid);
        return;
    }
  };

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!selectedVoucher) return 0;
    const subtotal = getCartTotal();
    // Apply discount only to product price, not shipping
    const discountAmount = (subtotal * selectedVoucher.discountPercentage) / 100;
    return discountAmount;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-[#E91E63]">Checkout</h1>

      {/* Order Items - Full Width */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center border-b pb-4">
              <img
                src={`data:image/jpeg;base64,${item.productImage}`}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="ml-4 flex-grow">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-600">Quantity: {item.quantity}</p>
                <p className="text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout for Shipping and Voucher */}
      <div className="grid grid-cols-2 gap-8 mb-8">

        {/* Left Column - Shipping Information */}
        <div className="bg-white p-6 rounded-lg shadow h-[600px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                  focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                  focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                  focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]"
              />
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Province</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleProvinceChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                    focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]"
                >
                  <option value="">Select Province</option>
                  {provinces.map(province => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    disabled={!formData.province}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                      focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]
                      disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ward</label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleWardChange}
                    disabled={!formData.district}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                      focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]
                      disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Ward</option>
                    {wards.map(ward => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specific Address</label>
                <input
                  type="text"
                  name="specificAddress"
                  value={formData.specificAddress}
                  onChange={handleChange}
                  placeholder="House number, Street name"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm
                    focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Voucher Selection */}
        <div className="bg-white p-6 rounded-lg shadow h-[600px] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Voucher</h2>
            <span className="text-sm text-gray-600">
              Remaining: {user.voucherStorage?.length || 0} vouchers
            </span>
          </div>
          <div className="h-[calc(100%-8rem)] overflow-y-auto mb-4">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className={`p-3 border rounded-md mb-2 cursor-pointer transition-colors
                  ${voucher.isAvailable
                    ? selectedVoucher?.id === voucher.id
                      ? 'border-[#E91E63] bg-pink-50'
                      : 'border-gray-200 hover:border-[#E91E63]'
                    : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                onClick={() => voucher.isAvailable && setSelectedVoucher(voucher.id === selectedVoucher?.id ? null : voucher)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg">{voucher.discountPercentage}% OFF</span>
                    <p className="text-sm text-gray-600">
                      Min. spend ${voucher.minimumPurchase}
                    </p>
                  </div>
                  {!voucher.isAvailable && (
                    <span className="text-sm text-gray-500">
                      Minimum spend not met
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/profile"
            className="block w-full text-center py-2 text-sm text-[#E91E63] hover:bg-pink-50 rounded-md transition-colors"
          >
            Get More Vouchers
          </Link>
        </div>
      </div>

      {/* Order Summary - Full Width */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Shipping</span>
              <span>
                {calculatingShipping ? (
                  'Calculating...'
                ) : shippingError ? (
                  'Error calculating shipping'
                ) : shippingFee ? (
                  `$${shippingFee.toFixed(2)}`
                ) : (
                  'Select province'
                )}
              </span>
            </div>
            {selectedVoucher && (
              <div className="flex justify-between text-sm text-green-600 mt-2">
                <span>Voucher Discount</span>
                <span>-${getDiscountAmount().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>Total</span>
              <span>${(getCartTotal() + (shippingFee || 0) - getDiscountAmount()).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
        <div className="grid grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors
                ${selectedPaymentMethod?.id === method.id
                  ? 'border-[#E91E63] bg-pink-50'
                  : 'border-gray-200 hover:border-[#E91E63]'
                }`}
              onClick={() => setSelectedPaymentMethod(method)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border ${selectedPaymentMethod?.id === method.id
                    ? 'border-4 border-[#E91E63]'
                    : 'border-gray-300'
                  }`} />
                <span className="font-medium">{method.methodName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proceed to Payment Button */}
      <button
        onClick={handleProceedToPayment}
        className="w-full bg-[#E91E63] text-white py-4 rounded-md hover:bg-[#D81B60] transition-colors text-lg font-semibold"
      >
        {selectedPaymentMethod?.isInternalPayment ? 'Finish Order' : 'Proceed to Payment'}
      </button>
    </div>
  );
};

export default Checkout; 