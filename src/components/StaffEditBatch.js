import React, { useState, useEffect } from 'react';
import { Modal, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import Axios from '../api/axios';

const StaffEditBatch = ({ open, onClose, onSave, batch }) => {
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
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDateForApi = (dateString) => {
    return new Date(dateString).toISOString();
  };

  const validateDates = (dates) => {
    const now = new Date();
    const manufacture = new Date(dates.manufactureDate);
    const importDate = new Date(dates.importDate);
    const expiry = new Date(dates.expiryDate);
    
    // Import date must be less than current date
    if (importDate >= now) {
      toast.error('Import date must be before current date');
      return false;
    }

    // Common validations
    if (manufacture >= importDate) {
      toast.error('Manufacture date must be before import date');
      return false;
    }

    if (expiry <= importDate) {
      toast.error('Expiry date must be after import date');
      return false;
    }

    return true;
  };

  const [formData, setFormData] = useState({
    productID: '',
    quantity: '',
    manufactureDate: '',
    importDate: '',
    expiryDate: '',
    status: true
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [product, setProduct] = useState(null);

  const fetchProductByName = async (name) => {
    try {
      const response = await Axios.get(`/api/product?Name=${encodeURIComponent(name)}&IsDeleted=false`);
      const products = response.data.items || [];
      if (products.length > 0) {
        setProduct(products[0]);
        setFormData(prev => ({ ...prev, productID: products[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    }
  };

  useEffect(() => {
    const loadBatchData = async () => {
      if (batch) {
        setFormData({
          productID: '', // Will be set after fetching product
          quantity: batch.quantity,
          manufactureDate: formatDateForInput(batch.manufactureDate),
          importDate: formatDateForInput(batch.importDate),
          expiryDate: formatDateForInput(batch.expiryDate)
        });
        
        // Fetch product by name
        if (batch.productName) {
          await fetchProductByName(batch.productName);
        }
      }
    };

    if (open) {
      loadBatchData();
    }
  }, [batch, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates before submitting
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

      await Axios.put(`/api/batch/${batch.id}`, batchData);
      toast.success('Batch updated successfully');
      onClose();
      onSave();
    } catch (error) {
      console.error('Error updating batch:', error);
      toast.error(error.response?.data?.message || 'Failed to update batch');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (JSON.stringify(formData) !== JSON.stringify({
      productID: product?.id.toString() || '',
      quantity: batch.quantity,
      manufactureDate: formatDateForInput(batch.manufactureDate),
      importDate: formatDateForInput(batch.importDate),
      expiryDate: formatDateForInput(batch.expiryDate)
    })) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
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
              <h2 className="text-2xl font-bold">Edit Batch</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <div className="p-2 border border-gray-300 rounded bg-gray-50">
                    <p className="font-medium">{product?.name}</p>
                    <p className="text-sm text-gray-500">ID: {product?.id}</p>
                  </div>
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
                    required
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
                    required
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
                    required
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
                    required
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
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
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

export default StaffEditBatch; 