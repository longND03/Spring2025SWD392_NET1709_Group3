import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Axios from '../api/axios';
import { Pagination, CircularProgress, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import StaffCreateProduct from './StaffCreateProduct';
import StaffCreateBatch from './StaffCreateBatch';

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

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      const searchParam = search ? `&Name=${encodeURIComponent(search)}` : '';
      const response = await Axios.get(`/api/product?PageNumber=${page}&PageSize=20${searchParam}`);
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
  }, [page, searchTerm]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
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
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.items?.length > 0 ? (
                    products.items.map((product) => (
                      <tr key={product.id}>
                        <td className="py-2 px-4 border-b">{product.id}</td>
                        <td className="py-2 px-4 border-b">
                          <Link 
                            to={`/products/${product.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {product.name}
                          </Link>
                        </td>
                        <td className="py-2 px-4 border-b">${product.price.toFixed(2)}</td>
                        <td className="py-2 px-4 border-b">{product.stockQuantity}</td>
                        <td className="py-2 px-4 border-b">
                          <span className={`px-2 py-1 rounded ${product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b">
                          <button 
                            className="text-blue-500 hover:text-blue-700 mr-2"
                            onClick={() => {/* TODO: Implement edit */}}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {/* TODO: Implement delete */}}
                          >
                            Delete
                          </button>
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
                          onClick={() => {/* TODO: Implement edit */}}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {/* TODO: Implement delete */}}
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

      <StaffCreateBatch
        open={isCreateBatchModalOpen}
        onClose={() => setIsCreateBatchModalOpen(false)}
        onSave={fetchBatches}
      />
    </div>
  );
};

export default StaffProductManagement; 