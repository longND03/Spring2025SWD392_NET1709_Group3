import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Axios from '../api/axios';
import { Pagination, CircularProgress, Button } from '@mui/material';
import { toast } from 'react-toastify';
import BrandModal from './BrandModal';
import CategoryModal from './CategoryModal';
import messages from '../constants/message.json';

const BrandCategoryManagement = () => {
    const { user } = useAuth();
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState({ brands: true, categories: true });
    const [error, setError] = useState({ brands: null, categories: null });
    const [page, setPage] = useState({ brands: 1, categories: 1 });
    const [searchTerm, setSearchTerm] = useState({ brands: '', categories: '' });
    const [modalState, setModalState] = useState({
        brand: { open: false, editData: null },
        category: { open: false, editData: null }
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ 
        open: false, 
        id: null, 
        type: null,
        name: ''
    });

    // Pagination settings
    const itemsPerPage = 10;

    // Filter and paginate data
    const filterAndPaginateData = (items, searchTerm, currentPage) => {
        // Filter items based on search term
        const filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.origin && item.origin.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Calculate pagination
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

        return {
            items: paginatedItems,
            totalPages,
            totalItems: filteredItems.length
        };
    };

    const fetchBrands = async () => {
        try {
            setLoading(prev => ({ ...prev, brands: true }));
            const response = await Axios.get('/api/brand');
            setBrands(response.data);
            setError(prev => ({ ...prev, brands: null }));
        } catch (error) {
            console.error("Error fetching brands:", error);
            setError(prev => ({ ...prev, brands: "Failed to load brands. Please try again later." }));
            toast.error("Failed to load brands");
        } finally {
            setLoading(prev => ({ ...prev, brands: false }));
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(prev => ({ ...prev, categories: true }));
            const response = await Axios.get('/api/category');
            setCategories(response.data);
            setError(prev => ({ ...prev, categories: null }));
        } catch (error) {
            console.error("Error fetching categories:", error);
            setError(prev => ({ ...prev, categories: "Failed to load categories. Please try again later." }));
            toast.error("Failed to load categories");
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    };

    useEffect(() => {
        fetchBrands();
        fetchCategories();
    }, []);

    const handlePageChange = (type) => (event, value) => {
        setPage(prev => ({ ...prev, [type]: value }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (type) => (e) => {
        setSearchTerm(prev => ({ ...prev, [type]: e.target.value }));
        setPage(prev => ({ ...prev, [type]: 1 }));
    };

    const handleDelete = async () => {
        try {
            if (deleteConfirmation.type === 'brand') {
                await Axios.delete(`/api/brand/soft-deletion/${deleteConfirmation.id}`);
                toast.success(messages.success.brand.delete);
                fetchBrands();
            } else if (deleteConfirmation.type === 'category') {
                await Axios.delete(`/api/category/soft-deletion/${deleteConfirmation.id}`);
                toast.success(messages.success.category.delete);
                fetchCategories();
            }
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error(deleteConfirmation.type === 'brand' ? messages.error.brand.delete : messages.error.category.delete);
        } finally {
            setDeleteConfirmation({ open: false, id: null, type: null, name: '' });
        }
    };

    // Get filtered and paginated data
    const paginatedBrands = filterAndPaginateData(brands, searchTerm.brands, page.brands);
    const paginatedCategories = filterAndPaginateData(categories, searchTerm.categories, page.categories);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Brands & Categories Management</h1>
            <p className="mb-4">Welcome, {user?.username}!</p>

            {/* Brands Section */}
            <div className="mb-8">
                {error.brands && <p className="text-red-500">{error.brands}</p>}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Manage Brands</h2>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#4CAF50',
                            '&:hover': {
                                bgcolor: '#388E3C'
                            }
                        }}
                        onClick={() => setModalState(prev => ({ 
                            ...prev, 
                            brand: { open: true, editData: null }
                        }))}
                    >
                        Add Brand
                    </Button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search brands..."
                        value={searchTerm.brands}
                        onChange={handleSearch('brands')}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    {searchTerm.brands && (
                        <p className="text-sm text-gray-600 mt-1">
                            Found {paginatedBrands.totalItems} matching brands
                        </p>
                    )}
                </div>

                {loading.brands ? (
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
                                        <th className="py-2 px-4 border-b text-left">Brand Name</th>
                                        <th className="py-2 px-4 border-b text-left">Description</th>
                                        <th className="py-2 px-4 border-b text-left">Origin</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedBrands.items?.length > 0 ? (
                                        paginatedBrands.items.map((brand) => (
                                            <tr key={brand.id}>
                                                <td className="py-2 px-4 border-b">{brand.id}</td>
                                                <td className="py-2 px-4 border-b">{brand.name}</td>
                                                <td className="py-2 px-4 border-b">{brand.description}</td>
                                                <td className="py-2 px-4 border-b">{brand.origin}</td>
                                                <td className="py-2 px-4 border-b">
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                                        onClick={() => setModalState(prev => ({
                                                            ...prev,
                                                            brand: { open: true, editData: brand }
                                                        }))}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => setDeleteConfirmation({
                                                            open: true,
                                                            id: brand.id,
                                                            type: 'brand',
                                                            name: brand.name
                                                        })}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-4 text-center text-gray-500">
                                                No brands found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {paginatedBrands.totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    count={paginatedBrands.totalPages}
                                    page={page.brands}
                                    onChange={handlePageChange('brands')}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Categories Section */}
            <div className="mt-12">
                {error.categories && <p className="text-red-500">{error.categories}</p>}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Manage Categories</h2>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#4CAF50',
                            '&:hover': {
                                bgcolor: '#388E3C'
                            }
                        }}
                        onClick={() => setModalState(prev => ({ 
                            ...prev, 
                            category: { open: true, editData: null }
                        }))}
                    >
                        Add Category
                    </Button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm.categories}
                        onChange={handleSearch('categories')}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    {searchTerm.categories && (
                        <p className="text-sm text-gray-600 mt-1">
                            Found {paginatedCategories.totalItems} matching categories
                        </p>
                    )}
                </div>

                {loading.categories ? (
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
                                        <th className="py-2 px-4 border-b text-left">Category Name</th>
                                        <th className="py-2 px-4 border-b text-left">Description</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCategories.items?.length > 0 ? (
                                        paginatedCategories.items.map((category) => (
                                            <tr key={category.id}>
                                                <td className="py-2 px-4 border-b">{category.id}</td>
                                                <td className="py-2 px-4 border-b">{category.name}</td>
                                                <td className="py-2 px-4 border-b">{category.description}</td>
                                                <td className="py-2 px-4 border-b">
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 mr-2"
                                                        onClick={() => setModalState(prev => ({
                                                            ...prev,
                                                            category: { open: true, editData: category }
                                                        }))}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => setDeleteConfirmation({
                                                            open: true,
                                                            id: category.id,
                                                            type: 'category',
                                                            name: category.name
                                                        })}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-4 text-center text-gray-500">
                                                No categories found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {paginatedCategories.totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    count={paginatedCategories.totalPages}
                                    page={page.categories}
                                    onChange={handlePageChange('categories')}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <BrandModal
                open={modalState.brand.open}
                onClose={() => setModalState(prev => ({ ...prev, brand: { open: false, editData: null } }))}
                onSave={fetchBrands}
                editData={modalState.brand.editData}
            />

            <CategoryModal
                open={modalState.category.open}
                onClose={() => setModalState(prev => ({ ...prev, category: { open: false, editData: null } }))}
                onSave={fetchCategories}
                editData={modalState.category.editData}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirmation.open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete {deleteConfirmation.type} "{deleteConfirmation.name}"? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setDeleteConfirmation({ open: false, id: null, type: null, name: '' })}
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

export default BrandCategoryManagement;
