import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; // Ensure axios is configured correctly

const StaffVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [newVoucher, setNewVoucher] = useState({
    discountPercentage: '',
    minimumPurchase: '',
    value: '',
    status: true // or false based on your default
  });
  const [error, setError] = useState('');
  const [editVoucherId, setEditVoucherId] = useState(null);
  const [editVoucherValue, setEditVoucherValue] = useState({
    discountPercentage: '',
    minimumPurchase: '',
    value: '',
    status: true // or false based on your default
  });

  // Function to fetch the list of vouchers
  const fetchVouchers = async () => {
    try {
      const response = await axios.get('http://localhost:5296/api/voucher'); // API endpoint to fetch vouchers
      console.log('Vouchers fetched:', response.data); // Check returned data
      setVouchers(response.data); // Save voucher list to state
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setError('Failed to fetch vouchers');
    }
  };

  // Function to add a new voucher
  const handleAddVoucher = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5296/api/voucher', newVoucher); // API endpoint to add voucher
      setVouchers([...vouchers, response.data]); // Update voucher list
      setNewVoucher({ discountPercentage: '', minimumPurchase: '', value: '', status: true }); // Reset input
    } catch (error) {
      console.error('Error adding voucher:', error);
      setError('Failed to add voucher');
    }
  };

  // Function to delete a voucher
  const handleDeleteVoucher = async (id) => {
    try {
      await axios.delete(`http://localhost:5296/api/voucher/${id}`); // API endpoint to delete voucher
      setVouchers(vouchers.filter(voucher => voucher.id !== id)); // Update voucher list
    } catch (error) {
      console.error('Error deleting voucher:', error);
      setError('Failed to delete voucher');
    }
  };

  // Function to update a voucher
  const handleUpdateVoucher = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5296/api/voucher/${id}`, { 
        discountPercentage: editVoucherValue.discountPercentage,
        minimumPurchase: editVoucherValue.minimumPurchase,
        value: editVoucherValue.value,
        status: editVoucherValue.status
      }); // API endpoint to update voucher
      setVouchers(vouchers.map(voucher => (voucher.id === id ? response.data : voucher))); // Update voucher list
      setEditVoucherId(null); // Reset edit state
      setEditVoucherValue({ discountPercentage: '', minimumPurchase: '', value: '', status: true }); // Reset input
    } catch (error) {
      console.error('Error updating voucher:', error);
      setError('Failed to update voucher');
    }
  };

  useEffect(() => {
    fetchVouchers(); // Call function to fetch vouchers when component mounts
  }, []);

  // Check vouchers state
  useEffect(() => {
    console.log('Current vouchers:', vouchers);
  }, [vouchers]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Voucher Management</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleAddVoucher} className="mb-4 flex">
        <input
          type="number"
          value={newVoucher.discountPercentage}
          onChange={(e) => setNewVoucher({ ...newVoucher, discountPercentage: e.target.value })}
          placeholder="Discount Percentage"
          className="border rounded p-2 mr-2 flex-grow"
          required
        />
        <input
          type="number"
          value={newVoucher.minimumPurchase}
          onChange={(e) => setNewVoucher({ ...newVoucher, minimumPurchase: e.target.value })}
          placeholder="Minimum Purchase"
          className="border rounded p-2 mr-2 flex-grow"
          required
        />
        <input
          type="number"
          value={newVoucher.value}
          onChange={(e) => setNewVoucher({ ...newVoucher, value: e.target.value })}
          placeholder="Value"
          className="border rounded p-2 mr-2 flex-grow"
          required
        />
        <button type="submit" className="bg-[#E91E63] text-white p-2 rounded hover:bg-[#D81B60] transition">
          Add Voucher
        </button>
      </form>
      <ul className="space-y-4">
        {vouchers.map((voucher) => (
          <li key={voucher.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
            <div className="font-semibold">ID: {voucher.id}</div>
            <div>Discount Percentage: <span className="font-bold">{voucher.discountPercentage}%</span></div>
            <div>Minimum Purchase: <span className="font-bold">{voucher.minimumPurchase}</span></div>
            <div>Value: <span className="font-bold">{voucher.value}</span></div>
            <div>Status: <span className={voucher.status ? 'text-green-500' : 'text-red-500'}>{voucher.status ? 'Active' : 'Inactive'}</span></div>
            <button onClick={() => { 
              setEditVoucherId(voucher.id); 
              setEditVoucherValue({
                discountPercentage: voucher.discountPercentage,
                minimumPurchase: voucher.minimumPurchase,
                value: voucher.value,
                status: voucher.status
              }); 
            }} className="text-blue-500">Edit</button>
            <button onClick={() => handleDeleteVoucher(voucher.id)} className="text-red-500 ml-2">Delete</button>
            {editVoucherId === voucher.id && (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateVoucher(voucher.id); }}>
                <input
                  type="number"
                  value={editVoucherValue.discountPercentage}
                  onChange={(e) => setEditVoucherValue({ ...editVoucherValue, discountPercentage: e.target.value })}
                  className="border rounded p-2 mr-2"
                  required
                />
                <input
                  type="number"
                  value={editVoucherValue.minimumPurchase}
                  onChange={(e) => setEditVoucherValue({ ...editVoucherValue, minimumPurchase: e.target.value })}
                  className="border rounded p-2 mr-2"
                  required
                />
                <input
                  type="number"
                  value={editVoucherValue.value}
                  onChange={(e) => setEditVoucherValue({ ...editVoucherValue, value: e.target.value })}
                  className="border rounded p-2 mr-2"
                  required
                />
                <button type="submit" className="bg-green-500 text-white p-2 rounded">Update</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffVoucher; 