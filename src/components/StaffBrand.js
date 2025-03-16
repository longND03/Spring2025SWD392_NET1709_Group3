import React, { useEffect, useState } from 'react';

const StaffBrand = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [brandOrigin, setBrandOrigin] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://localhost:5296/api/brand');
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        setBrands(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const deleteBrand = async (brandId) => {
    try {
      const response = await fetch(`http://localhost:5296/api/brand/${brandId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }
      setBrands(prevBrands => prevBrands.filter(brand => brand.id !== brandId));
    } catch (err) {
      console.error(err.message);
    }
  };

  const startEditing = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandDescription(brand.description);
    setBrandOrigin(brand.origin);
  };

  const updateBrand = async () => {
    try {
      const response = await fetch(`http://localhost:5296/api/brand/${editingBrand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: brandName,
          description: brandDescription,
          origin: brandOrigin,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update brand');
      }
      setBrands(prevBrands => 
        prevBrands.map(brand => 
          brand.id === editingBrand.id ? { ...brand, name: brandName, description: brandDescription, origin: brandOrigin } : brand
        )
      );
      setEditingBrand(null);
    } catch (err) {
      console.error(err.message);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#E91E63]">Brand Management</h2>
      <ul className="space-y-6">
        {brands.map(brand => (
          <li key={brand.id} className="p-4 border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 bg-white">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-lg">{brand.name}</span>
              <span className="text-gray-500">ID: {brand.id}</span>
            </div>
            <div className="text-gray-700 mb-2">
              <span className="font-semibold">Description:</span> {brand.description}
            </div>
            <div className="text-gray-700 mb-2">
              <span className="font-semibold">Origin:</span> {brand.origin}
            </div>
            <h3 className="font-semibold mt-4">Products:</h3>
            <ul className="ml-4 space-y-2">
              {brand.products.map(product => (
                <li key={product.id} className="border-b py-2">
                  <span className="font-semibold">{product.name}</span> - {product.description}
                  <div className="text-sm text-gray-600">
                    <span>Price: ${product.price.toFixed(2)}</span>
                    <span> | Packaging: {product.packaging}</span>
                    <span> | Stock: {product.stockQuantity}</span>
                  </div>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => startEditing(brand)} 
              className="mt-2 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
            >
              Edit Brand
            </button>
            <button 
              onClick={() => deleteBrand(brand.id)} 
              className="mt-2 bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
            >
              Delete Brand
            </button>
          </li>
        ))}
      </ul>

      {editingBrand && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white">
          <h3 className="text-lg font-semibold mb-2">Edit Brand</h3>
          <div className="mb-4">
            <label className="block mb-1">Brand Name:</label>
            <input 
              type="text" 
              value={brandName} 
              onChange={(e) => setBrandName(e.target.value)} 
              className="border rounded w-full p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Description:</label>
            <textarea 
              value={brandDescription} 
              onChange={(e) => setBrandDescription(e.target.value)} 
              className="border rounded w-full p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Origin:</label>
            <input 
              type="text" 
              value={brandOrigin} 
              onChange={(e) => setBrandOrigin(e.target.value)} 
              className="border rounded w-full p-2"
            />
          </div>
          <button 
            onClick={updateBrand} 
            className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
          >
            Update Brand
          </button>
          <button 
            onClick={() => setEditingBrand(null)} 
            className="ml-2 bg-gray-300 text-black rounded px-4 py-2 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffBrand;
