import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Axios from '../api/axios';
import { Pagination, CircularProgress, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const StaffProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState({ items: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await Axios.get(`/api/product?PageNumber=${page}&PageSize=10`);
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

    fetchProducts();
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <p className="mb-4">Welcome, {user.username}!</p>
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Manage Products</h2>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#4CAF50',
            '&:hover': {
              bgcolor: '#388E3C'
            }
          }}
        >
          Add
        </Button>
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
                    <td colSpan="5" className="py-4 text-center text-gray-500">
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
  );
};

export default StaffProductManagement; 