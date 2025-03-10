import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StaffProductManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role[0].roleName !== 'Staff') {
      navigate('/login');
    } else {
      fetchProducts();
    }
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5296/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching products:', error);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5296/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (error) {
      setError(error.message);
      console.error('Error deleting product:', error);
    }
  };

  if (!user || user.role[0].roleName !== 'Staff') {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>
      <p className="mb-4">Welcome, {user.username}!</p>
      {error && <p className="text-red-500">{error}</p>}
      <h2 className="text-xl font-semibold mb-2">Manage Products</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Product Name</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="py-2 px-4 border-b">{product.name}</td>
                <td className="py-2 px-4 border-b">{product.price}</td>
                <td className="py-2 px-4 border-b">
                  <button 
                    onClick={() => handleDelete(product.id)} 
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffProductManagement; 