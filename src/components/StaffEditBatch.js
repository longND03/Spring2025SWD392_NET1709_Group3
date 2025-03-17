import React, { useState, useEffect } from 'react';
import { Modal, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import Axios from '../api/axios';

const StaffEditBatch = ({ open, onClose, onSave, batch }) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    manufactureDate: '',
    importDate: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (batch) {
      setFormData({
        productId: batch.productId,
        quantity: batch.quantity,
        manufactureDate: new Date(batch.manufactureDate).toISOString().split('T')[0],
        importDate: new Date(batch.importDate).toISOString().split('T')[0],
        expiryDate: new Date(batch.expiryDate).toISOString().split('T')[0]
      });
      fetchProduct(batch.productId);
    }
  }, [batch]);

  const fetchProduct = async (productId) => {
    try {
      const response = await Axios.get(`/api/product/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    }
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
    setLoading(true);

    try {
      const batchData = {
        ...formData,
        quantity: parseInt(formData.quantity, 10)
      };

      console.log('Submitting batch data:', JSON.stringify(batchData, null, 2));

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
      productId: batch.productId,
      quantity: batch.quantity,
      manufactureDate: new Date(batch.manufactureDate).toISOString().split('T')[0],
      importDate: new Date(batch.importDate).toISOString().split('T')[0],
      expiryDate: new Date(batch.expiryDate).toISOString().split('T')[0]
    })) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
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
                    type="date"
                    name="manufactureDate"
                    value={formData.manufactureDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Import Date
                  </label>
                  <input
                    type="date"
                    name="importDate"
                    value={formData.importDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
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
                onClick={onClose}
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