import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import Axios from '../api/axios';

const StaffCreateBatch = ({ open, onClose, onSave }) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"
  };

  const [formData, setFormData] = useState({
    productID: '',
    quantity: '',
    expiryDate: '',
    importDate: '',
    manufactureDate: ''
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await Axios.get('/api/product');
        const productList = response.data.items || [];
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      }
    };

    if (open) {
      fetchProducts();
      // Set current date/time for all date fields when modal opens
      const currentDateTime = getCurrentDateTime();
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
    }

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredProducts(filtered);
    setShowDropdown(true);
  };

  const handleProductSelect = (product) => {
    setSearchTerm(product.name);
    setFormData(prev => ({ ...prev, productID: product.id.toString() }));
    setShowDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateExpiryDate = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry > today;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.productID || !formData.quantity || !formData.expiryDate || 
        !formData.importDate || !formData.manufactureDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate expiry date
    if (!validateExpiryDate(formData.expiryDate)) {
      toast.error('Expiry date must be greater than today');
      return;
    }

    try {
      setLoading(true);
      const dataToSubmit = {
        ...formData,
        productID: parseInt(formData.productID),
        quantity: parseInt(formData.quantity)
      };

      await Axios.post('/api/batch', dataToSubmit);
      toast.success('Batch created successfully');
      clearForm();
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Check if form has been modified from its initial state
    if (formData.productID || formData.quantity || 
        (formData.expiryDate && formData.expiryDate !== getCurrentDateTime()) || 
        (formData.importDate && formData.importDate !== getCurrentDateTime()) || 
        (formData.manufactureDate && formData.manufactureDate !== getCurrentDateTime())) {
      setShowConfirmDialog(true);
    } else {
      clearForm();
      onClose();
    }
  };

  const clearForm = () => {
    setFormData({
      productID: '',
      quantity: '',
      expiryDate: '',
      importDate: '',
      manufactureDate: ''
    });
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
                    min={getCurrentDateTime()}
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