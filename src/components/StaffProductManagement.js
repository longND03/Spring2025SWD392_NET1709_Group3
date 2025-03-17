import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Axios from '../api/axios';
import { Pagination, CircularProgress, Button, Tabs, Tab } from '@mui/material';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import StaffCreateProduct from './StaffCreateProduct';
import StaffCreateBatch from './StaffCreateBatch';
import StaffEditProduct from './StaffEditProduct';
import StaffEditBatch from './StaffEditBatch';

const StaffProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState({ items: [], totalPages: 1 });
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchError, setBatchError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 for active products, 1 for removed products
  const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null, type: null });

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      const searchParam = search ? `&Name=${encodeURIComponent(search)}` : '';
      const isDeleted = activeTab === 1;
      const response = await Axios.get(`/api/product?PageNumber=${page}&PageSize=20${searchParam}&IsDeleted=${isDeleted}`);
      setProducts(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setBatchLoading(true);
      const response = await Axios.get('/api/batch');
      setBatches(response.data);
      setBatchError(null);
    } catch (error) {
      console.error("Error fetching batches:", error);
      setBatchError("Failed to load batches. Please try again later.");
      toast.error("Failed to load batches");
    } finally {
      setBatchLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(searchTerm);
    fetchBatches();
  }, [page, searchTerm, activeTab]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
    setSearchTerm('');
  };

  const handleDelete = async () => {
    try {
      if (deleteConfirmation.type === 'product') {
        await Axios.delete(`/api/product/${deleteConfirmation.id}`);
        toast.success('Product deleted successfully');
        fetchProducts(searchTerm);
      } else if (deleteConfirmation.type === 'batch') {
        await Axios.delete(`/api/batch/${deleteConfirmation.id}`);
        toast.success('Batch deleted successfully');
        fetchBatches();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error(error.response?.data?.message || "Failed to delete. Please try again.");
    } finally {
      setDeleteConfirmation({ open: false, id: null, type: null });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product & Batchs Management</h1>
      <p className="mb-4">Welcome, {user.username}!</p>
      
      {/* Products Section */}
      <div className="mb-8">
        {error && <p className="text-red-500">{error}</p>}
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Products</h2>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': {
                bgcolor: '#388E3C'
              }
            }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="mb-4"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Active Products" />
          <Tab label="Removed Products" />
        </Tabs>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">Product Name</th>
                    <th className="py-2 px-4 border-b text-left">Price</th>
                    <th className="py-2 px-4 border-b text-left">Stock</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.items?.length > 0 ? (
                    products.items.map((product) => (
                      <tr key={product.id} className={activeTab === 1 ? 'bg-gray-100' : ''}>
                        <td className={`py-2 px-4 border-b ${activeTab === 1 ? 'text-gray-500' : ''}`}>{product.id}</td>
                        <td className={`py-2 px-4 border-b ${activeTab === 1 ? 'text-gray-500' : ''}`}>
                          <Link 
                            to={`/products/${product.id}`}
                            className={`hover:underline ${activeTab === 1 ? 'text-gray-500' : 'text-blue-600 hover:text-blue-800'}`}
                          >
                            {product.name}
                          </Link>
                        </td>
                        <td className={`py-2 px-4 border-b ${activeTab === 1 ? 'text-gray-500' : ''}`}>${product.price.toFixed(2)}</td>
                        <td className={`py-2 px-4 border-b ${activeTab === 1 ? 'text-gray-500' : ''}`}>{product.stockQuantity}</td>
                        <td className="py-2 px-4 border-b">
                          {activeTab === 0 && (
                            <>
                              <button 
                                className="text-blue-500 hover:text-blue-700 mr-2"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setIsEditProductModalOpen(true);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => setDeleteConfirmation({ open: true, id: product.id, type: 'product' })}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {products.items?.length > 0 && (
              <div className="flex justify-center mt-6">
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
      </div>

      {/* Batches Section */}
      <div className="mt-12">
        {batchError && <p className="text-red-500">{batchError}</p>}
        
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Manage Batches</h2>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': {
                bgcolor: '#388E3C'
              }
            }}
            onClick={() => setIsCreateBatchModalOpen(true)}
          >
            Add Batch
          </Button>
        </div>
        
        {batchLoading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Product Name</th>
                  <th className="py-2 px-4 border-b text-left">Quantity</th>
                  <th className="py-2 px-4 border-b text-left">Manufacture Date</th>
                  <th className="py-2 px-4 border-b text-left">Import Date</th>
                  <th className="py-2 px-4 border-b text-left">Expiry Date</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches?.length > 0 ? (
                  batches.map((batch) => (
                    <tr key={batch.id}>
                      <td className="py-2 px-4 border-b">{batch.id}</td>
                      <td className="py-2 px-4 border-b">{batch.productName}</td>
                      <td className="py-2 px-4 border-b">{batch.quantity}</td>
                      <td className="py-2 px-4 border-b">{formatDate(batch.manufactureDate)}</td>
                      <td className="py-2 px-4 border-b">{formatDate(batch.importDate)}</td>
                      <td className="py-2 px-4 border-b">{formatDate(batch.expiryDate)}</td>
                      <td className="py-2 px-4 border-b">
                        <button 
                          className="text-blue-500 hover:text-blue-700 mr-2"
                          onClick={() => {
                            setEditingBatch(batch);
                            setIsEditBatchModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setDeleteConfirmation({ open: true, id: batch.id, type: 'batch' })}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">
                      No batches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StaffCreateProduct
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={fetchProducts}
      />

      <StaffEditProduct
        open={isEditProductModalOpen}
        onClose={() => {
          setIsEditProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={fetchProducts}
        product={editingProduct}
      />

      <StaffCreateBatch
        open={isCreateBatchModalOpen}
        onClose={() => setIsCreateBatchModalOpen(false)}
        onSave={fetchBatches}
      />

      <StaffEditBatch
        open={isEditBatchModalOpen}
        onClose={() => {
          setIsEditBatchModalOpen(false);
          setEditingBatch(null);
        }}
        onSave={fetchBatches}
        batch={editingBatch}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteConfirmation.type}? 
              {deleteConfirmation.type === 'batch' && " This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirmation({ open: false, id: null, type: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffProductManagement; 