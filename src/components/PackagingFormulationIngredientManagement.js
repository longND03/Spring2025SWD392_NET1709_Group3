import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Axios from '../api/axios';
import { Pagination, CircularProgress, Button } from '@mui/material';
import { toast } from 'react-toastify';

const PackagingFormulationIngredientManagement = () => {
    const { user } = useAuth();
    const [packagings, setPackagings] = useState([]);
    const [formulations, setFormulations] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState({ packagings: true, formulations: true, ingredients: true });
    const [error, setError] = useState({ packagings: null, formulations: null, ingredients: null });
    const [page, setPage] = useState({ packagings: 1, formulations: 1, ingredients: 1 });
    const [searchTerm, setSearchTerm] = useState({ packagings: '', formulations: '', ingredients: '' });

    // Pagination settings
    const itemsPerPage = 10;

    // Filter and paginate data
    const filterAndPaginateData = (items, searchTerm, currentPage) => {
        // Filter items based on search term
        const filteredItems = items.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (item.type && item.type.toLowerCase().includes(searchLower)) ||
                (item.material && item.material.toLowerCase().includes(searchLower)) ||
                (item.texture && item.texture.toLowerCase().includes(searchLower)) ||
                (item.name && item.name.toLowerCase().includes(searchLower)) ||
                (item.description && item.description.toLowerCase().includes(searchLower))
            );
        });

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

    const fetchPackagings = async () => {
        try {
            setLoading(prev => ({ ...prev, packagings: true }));
            const response = await Axios.get('/api/packaging');
            setPackagings(response.data);
            setError(prev => ({ ...prev, packagings: null }));
        } catch (error) {
            console.error("Error fetching packagings:", error);
            setError(prev => ({ ...prev, packagings: "Failed to load packagings. Please try again later." }));
            toast.error("Failed to load packagings");
        } finally {
            setLoading(prev => ({ ...prev, packagings: false }));
        }
    };

    const fetchFormulations = async () => {
        try {
            setLoading(prev => ({ ...prev, formulations: true }));
            const response = await Axios.get('/api/formulationtype');
            setFormulations(response.data);
            setError(prev => ({ ...prev, formulations: null }));
        } catch (error) {
            console.error("Error fetching formulations:", error);
            setError(prev => ({ ...prev, formulations: "Failed to load formulations. Please try again later." }));
            toast.error("Failed to load formulations");
        } finally {
            setLoading(prev => ({ ...prev, formulations: false }));
        }
    };

    const fetchIngredients = async () => {
        try {
            setLoading(prev => ({ ...prev, ingredients: true }));
            const response = await Axios.get('/api/ingredient');
            setIngredients(response.data);
            setError(prev => ({ ...prev, ingredients: null }));
        } catch (error) {
            console.error("Error fetching ingredients:", error);
            setError(prev => ({ ...prev, ingredients: "Failed to load ingredients. Please try again later." }));
            toast.error("Failed to load ingredients");
        } finally {
            setLoading(prev => ({ ...prev, ingredients: false }));
        }
    };

    useEffect(() => {
        fetchPackagings();
        fetchFormulations();
        fetchIngredients();
    }, []);

    const handlePageChange = (type) => (event, value) => {
        setPage(prev => ({ ...prev, [type]: value }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (type) => (e) => {
        setSearchTerm(prev => ({ ...prev, [type]: e.target.value }));
        setPage(prev => ({ ...prev, [type]: 1 }));
    };

    // Get filtered and paginated data
    const paginatedPackagings = filterAndPaginateData(packagings, searchTerm.packagings, page.packagings);
    const paginatedFormulations = filterAndPaginateData(formulations, searchTerm.formulations, page.formulations);
    const paginatedIngredients = filterAndPaginateData(ingredients, searchTerm.ingredients, page.ingredients);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Packaging, Formulation & Ingredient Management</h1>
            <p className="mb-4">Welcome, {user?.username}!</p>

            {/* Packagings Section */}
            <div className="mb-8">
                {error.packagings && <p className="text-red-500">{error.packagings}</p>}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Manage Packagings</h2>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#4CAF50',
                            '&:hover': {
                                bgcolor: '#388E3C'
                            }
                        }}
                    >
                        Add Packaging
                    </Button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search packagings..."
                        value={searchTerm.packagings}
                        onChange={handleSearch('packagings')}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    {searchTerm.packagings && (
                        <p className="text-sm text-gray-600 mt-1">
                            Found {paginatedPackagings.totalItems} matching packagings
                        </p>
                    )}
                </div>

                {loading.packagings ? (
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
                                        <th className="py-2 px-4 border-b text-left">Type</th>
                                        <th className="py-2 px-4 border-b text-left">Material</th>
                                        <th className="py-2 px-4 border-b text-left">Size</th>
                                        <th className="py-2 px-4 border-b text-left">Refillable</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPackagings.items?.length > 0 ? (
                                        paginatedPackagings.items.map((packaging) => (
                                            <tr key={packaging.id}>
                                                <td className="py-2 px-4 border-b">{packaging.id}</td>
                                                <td className="py-2 px-4 border-b">{packaging.type}</td>
                                                <td className="py-2 px-4 border-b">{packaging.material}</td>
                                                <td className="py-2 px-4 border-b">{packaging.size}</td>
                                                <td className="py-2 px-4 border-b">
                                                    {packaging.isRefillable ? 'Yes' : 'No'}
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
                                                No packagings found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {paginatedPackagings.totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    count={paginatedPackagings.totalPages}
                                    page={page.packagings}
                                    onChange={handlePageChange('packagings')}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Formulations Section */}
            <div className="mt-12 mb-8">
                {error.formulations && <p className="text-red-500">{error.formulations}</p>}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Manage Formulations</h2>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#4CAF50',
                            '&:hover': {
                                bgcolor: '#388E3C'
                            }
                        }}
                    >
                        Add Formulation
                    </Button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search formulations..."
                        value={searchTerm.formulations}
                        onChange={handleSearch('formulations')}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    {searchTerm.formulations && (
                        <p className="text-sm text-gray-600 mt-1">
                            Found {paginatedFormulations.totalItems} matching formulations
                        </p>
                    )}
                </div>

                {loading.formulations ? (
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
                                        <th className="py-2 px-4 border-b text-left">Texture</th>
                                        <th className="py-2 px-4 border-b text-left">Fragrance Free</th>
                                        <th className="py-2 px-4 border-b text-left">Alcohol Free</th>
                                        <th className="py-2 px-4 border-b text-left">Paraben Free</th>
                                        <th className="py-2 px-4 border-b text-left">Essential Oil Free</th>
                                        <th className="py-2 px-4 border-b text-left">Silicone Free</th>
                                        <th className="py-2 px-4 border-b text-left">Sulfate Free</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedFormulations.items?.length > 0 ? (
                                        paginatedFormulations.items.map((formulation) => (
                                            <tr key={formulation.id}>
                                                <td className="py-2 px-4 border-b">{formulation.id}</td>
                                                <td className="py-2 px-4 border-b">{formulation.texture}</td>
                                                <td className="py-2 px-4 border-b">
                                                    {formulation.isFragranceFree ? 'Yes' : 'No'}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {formulation.isAlcoholFree ? 'Yes' : 'No'}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {formulation.isParabenFree ? 'Yes' : 'No'}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {formulation.isEssentialOilFree ? 'Yes' : 'No'}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {formulation.isSiliconeFree ? 'Yes' : 'No'}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {formulation.isSulfateFree ? 'Yes' : 'No'}
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
                                            <td colSpan="9" className="py-4 text-center text-gray-500">
                                                No formulations found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {paginatedFormulations.totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    count={paginatedFormulations.totalPages}
                                    page={page.formulations}
                                    onChange={handlePageChange('formulations')}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Ingredients Section */}
            <div className="mt-12">
                {error.ingredients && <p className="text-red-500">{error.ingredients}</p>}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Manage Ingredients</h2>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#4CAF50',
                            '&:hover': {
                                bgcolor: '#388E3C'
                            }
                        }}
                    >
                        Add Ingredient
                    </Button>
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        value={searchTerm.ingredients}
                        onChange={handleSearch('ingredients')}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    {searchTerm.ingredients && (
                        <p className="text-sm text-gray-600 mt-1">
                            Found {paginatedIngredients.totalItems} matching ingredients
                        </p>
                    )}
                </div>

                {loading.ingredients ? (
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
                                        <th className="py-2 px-4 border-b text-left">Name</th>
                                        <th className="py-2 px-4 border-b text-left">Description</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedIngredients.items?.length > 0 ? (
                                        paginatedIngredients.items.map((ingredient) => (
                                            <tr key={ingredient.id}>
                                                <td className="py-2 px-4 border-b">{ingredient.id}</td>
                                                <td className="py-2 px-4 border-b">{ingredient.name}</td>
                                                <td className="py-2 px-4 border-b">{ingredient.description}</td>
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
                                            <td colSpan="4" className="py-4 text-center text-gray-500">
                                                No ingredients found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {paginatedIngredients.totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    count={paginatedIngredients.totalPages}
                                    page={page.ingredients}
                                    onChange={handlePageChange('ingredients')}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PackagingFormulationIngredientManagement; 