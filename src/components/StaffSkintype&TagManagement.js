import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Axios from '../api/axios';
import { Pagination, CircularProgress, Button, Tabs, Tab, Modal } from '@mui/material';
import { toast } from 'react-toastify';
import StaffCreateSkintype from './StaffCreateSkintype';
import StaffEditSkintype from './StaffEditSkintype';

const StaffSkintypeTagManagement = () => {
    const { user } = useAuth();
    const [skintypes, setSkintypes] = useState({ items: [], totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0); // 0 for active, 1 for removed
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [selectedSkintype, setSelectedSkintype] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchSkintypes = async (search = '') => {
        try {
            setLoading(true);
            const searchParam = search ? `&Name=${encodeURIComponent(search)}` : '';
            const isDeleted = activeTab === 1;
            const response = await Axios.get(`/api/skintype?PageNumber=${page}&PageSize=20${searchParam}&IsDeleted=${isDeleted}`);
            setSkintypes(response.data);
            setError(null);
        } catch (error) {
            console.error("Error fetching skintypes:", error);
            setError("Failed to load skintypes. Please try again later.");
            toast.error("Failed to load skintypes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkintypes(searchTerm);
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
    };

    const handleEdit = (skintype) => {
        setSelectedSkintype(skintype);
        setIsEditModalOpen(true);
    };

    const handleRemoveClick = (skintype) => {
        setSelectedSkintype(skintype);
        setIsConfirmDeleteOpen(true);
    };

    const handleRemove = async () => {
        if (isProcessing || !selectedSkintype) return;

        try {
            setIsProcessing(true);
            await Axios.delete(`/api/skintype/soft-deletion/${selectedSkintype.id}`);
            toast.success('Skintype removed');
            setIsConfirmDeleteOpen(false);
            setSelectedSkintype(null);
            fetchSkintypes(searchTerm);
        } catch (error) {
            console.error('Error removing skintype:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to remove skintype');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Skintype & Tag Management</h1>
            <p className="mb-4">Welcome, {user.username}!</p>

            <div className="mb-8">
                {error && <p className="text-red-500">{error}</p>}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {activeTab === 0 ? 'Active Skintypes' : 'Removed Skintypes'}
                    </h2>
                    {activeTab === 0 && (
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
                            Add Skintype
                        </Button>
                    )}
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search skintypes..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>

                <Tabs value={activeTab} onChange={handleTabChange} className="mb-4">
                    <Tab label="Active Skintypes" />
                    <Tab label="Removed Skintypes" />
                </Tabs>

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
                                        <th className="py-2 px-4 border-b text-left">Name</th>
                                        <th className="py-2 px-4 border-b text-left">Description</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {skintypes.items?.length > 0 ? (
                                        skintypes.items.map((skintype) => (
                                            <tr key={skintype.id} className={activeTab === 1 ? 'text-gray-500 bg-gray-50' : ''}>
                                                <td className={`py-2 px-4 border-b ${activeTab === 1 ? 'bg-gray-50' : ''}`}>{skintype.id}</td>
                                                <td className={`py-2 px-4 border-b ${activeTab === 1 ? 'bg-gray-50' : ''}`}>{skintype.name}</td>
                                                <td className={`py-2 px-4 border-b ${activeTab === 1 ? 'bg-gray-50' : ''}`}>{skintype.description}</td>
                                                <td className={`py-2 px-4 border-b ${activeTab === 1 ? 'bg-gray-50' : ''}`}>
                                                    {activeTab === 0 && (
                                                        <>
                                                            <button
                                                                className="text-blue-500 hover:text-blue-700 mr-2"
                                                                onClick={() => handleEdit(skintype)}
                                                                disabled={isProcessing}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="text-red-500 hover:text-red-700"
                                                                onClick={() => handleRemoveClick(skintype)}
                                                                disabled={isProcessing}
                                                            >
                                                                Remove
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-4 text-center text-gray-500">
                                                No skintypes found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {skintypes.items?.length > 0 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    count={skintypes.totalPages}
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

            <StaffCreateSkintype
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={fetchSkintypes}
            />

            {selectedSkintype && (
                <StaffEditSkintype
                    open={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedSkintype(null);
                    }}
                    onSave={fetchSkintypes}
                    skintype={selectedSkintype}
                />
            )}

            <Modal
                open={isConfirmDeleteOpen}
                onClose={() => {
                    setIsConfirmDeleteOpen(false);
                    setSelectedSkintype(null);
                }}
                disableAutoFocus
                disableEnforceFocus
                style={{ zIndex: 1000 }}
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-lg shadow-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Confirm Remove</h2>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to remove skintype "{selectedSkintype?.name}"? This action cant be undone later.
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => {
                                setIsConfirmDeleteOpen(false);
                                setSelectedSkintype(null);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={isProcessing}
                            className={`px-4 py-2 text-white rounded flex items-center gap-2 ${
                                isProcessing 
                                    ? 'bg-red-400 cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Removing...
                                </>
                            ) : (
                                'Remove'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StaffSkintypeTagManagement;