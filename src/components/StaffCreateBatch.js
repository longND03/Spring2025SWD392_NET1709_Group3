import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import Axios from '../api/axios';
import messages from '../constants/message.json';

const StaffCreateBatch = ({ open, onClose, onSave }) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    return localDateTime;
  };

  const formatDateForInput = (dateString) => {
    // No need to slice since getCurrentDateTime now returns the correct format
    return dateString;
  };

  const formatDateForApi = (dateString) => {
    // Convert local datetime to ISO string for API
    return new Date(dateString).toISOString();
  };

  const validateDates = (dates) => {
    const now = new Date();
    // Set time to end of day to allow same-day imports
    now.setHours(23, 59, 59, 999);
    const manufacture = new Date(dates.manufactureDate);
    const importDate = new Date(dates.importDate);
    const expiry = new Date(dates.expiryDate);
    
    // For create: manufacture must be less than current date
    if (manufacture >= now) {
      toast.error(messages.error.batch.validation.manufactureDate.beforeCurrent);
      return false;
    }

    // For create: import must be less than or equal to current date
    if (importDate > now) {
      toast.error(messages.error.batch.validation.importDate.beforeCurrent);
      return false;
    }

    // For create: expiry must be greater than current date
    if (expiry <= now) {
      toast.error(messages.error.batch.validation.expiryDate.afterCurrent);
      return false;
    }

    // Common validations
    if (manufacture >= importDate) {
      toast.error(messages.error.batch.validation.manufactureDate.beforeImport);
      return false;
    }

    if (expiry <= importDate) {
      toast.error(messages.error.batch.validation.expiryDate.afterImport);
      return false;
    }

    return true;
  };

  const [formData, setFormData] = useState({
    productID: '',
    quantity: '',
    manufactureDate: formatDateForInput(getCurrentDateTime()),
    importDate: formatDateForInput(getCurrentDateTime()),
    expiryDate: formatDateForInput(getCurrentDateTime()),
    status: true
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const dropdownRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const response = await Axios.get('/api/product?IsDeleted=false');
      const productList = response.data.items || [];
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(messages.error.product.load);
    }
  };

  const fetchProductsByName = async (name) => {
    try {
      const response = await Axios.get(`/api/product?Name=${encodeURIComponent(name)}&IsDeleted=false`);
      const productList = response.data.items || [];
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(messages.error.product.load);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProducts();
      // Set current date/time for all date fields when modal opens
      const currentDateTime = formatDateForInput(getCurrentDateTime());
      setFormData(prev => ({
        ...prev,
        manufactureDate: currentDateTime,
        importDate: currentDateTime,
        expiryDate: currentDateTime
      }));
    }
  }, [open]);

  useEffect(() => {
    // Add click event listener to handle clicking outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    // Reset product ID if search field is cleared
    if (!searchValue) {
      setFormData(prev => ({ ...prev, productID: '' }));
      setFilteredProducts([]);
      return;
    }

    // Fetch products by name
    fetchProductsByName(searchValue);
  };

  const handleProductSelect = (product) => {
    setSearchTerm(product.name);
    setFormData(prev => ({ ...prev, productID: product.id.toString() })); // Changed to match API expectation
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate other dates
    if (!validateDates(formData)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const batchData = {
        ...formData,
        productID: parseInt(formData.productID, 10),
        quantity: parseInt(formData.quantity, 10),
        manufactureDate: formatDateForApi(formData.manufactureDate),
        importDate: formatDateForApi(formData.importDate),
        expiryDate: formatDateForApi(formData.expiryDate)
      };

      console.log('Submitting batch data:', JSON.stringify(batchData, null, 2));
      await Axios.post('/api/batch', batchData);
      toast.success(messages.success.batch.create);
      await fetchProducts(); // Refresh product list
      clearForm(); // Clear the form after successful creation
      onClose();
      onSave();
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error(error.response?.data?.message || messages.error.batch.save);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Check if form has been modified from its initial state
    if (formData.productID || formData.quantity || 
        (formData.expiryDate && formData.expiryDate !== formatDateForInput(getCurrentDateTime())) || 
        (formData.importDate && formData.importDate !== formatDateForInput(getCurrentDateTime())) || 
        (formData.manufactureDate && formData.manufactureDate !== formatDateForInput(getCurrentDateTime()))) {
      setShowConfirmDialog(true);
    } else {
      clearForm();
      onClose();
    }
  };

  const clearForm = () => {
    const currentDateTime = formatDateForInput(getCurrentDateTime());
    setFormData({
      productID: '',
      quantity: '',
      expiryDate: currentDateTime,
      importDate: currentDateTime,
      manufactureDate: currentDateTime
    });
    setSearchTerm('');
  };

  const handleConfirmClose = () => {
    clearForm();
    setShowConfirmDialog(false);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown
        style={{ zIndex: 1000 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-white rounded-lg shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Batch</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search products..."
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                          <div
                            key={product.id}
                            onClick={() => handleProductSelect(product)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No products found</div>
                      )}
                    </div>
                  )}
                  {formData.productID && !showDropdown && (
                    <p className="mt-1 text-sm text-gray-500">
                      Product ID: {formData.productID}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacture Date
                  </label>
                  <input
                    type="datetime-local"
                    name="manufactureDate"
                    value={formData.manufactureDate}
                    onChange={handleChange}
                    max={getCurrentDateTime()}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Import Date
                  </label>
                  <input
                    type="datetime-local"
                    name="importDate"
                    value={formData.importDate}
                    onChange={handleChange}
                    max={getCurrentDateTime()}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    min={formatDateForInput(getCurrentDateTime())}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: '#4CAF50',
                    '&:hover': {
                      bgcolor: '#388E3C'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Batch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[1001] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Close</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to close? All unsaved changes will be lost.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffCreateBatch; 