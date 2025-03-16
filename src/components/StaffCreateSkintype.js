import React, { useState } from 'react';
import { Modal } from '@mui/material';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const StaffCreateSkintype = ({ open, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Skintype name is required');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        try {
            if (!validateForm()) return;
            setIsSaving(true);

            await axios.post('/api/skintype', {
                name: formData.name.trim(),
                description: formData.description.trim()
            });
            
            toast.success('Skintype created successfully');
            onSave();
            handleConfirmClose();
        } catch (error) {
            console.error('Error creating skintype:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to create skintype. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (formData.name || formData.description) {
            setShowConfirmDialog(true);
        } else {
            handleConfirmClose();
        }
    };

    const handleConfirmClose = () => {
        setFormData({
            name: '',
            description: ''
        });
        setShowConfirmDialog(false);
        onClose();
    };

    return (
        <>
            <Modal
                open={open}
                onClose={handleClose}
                disableAutoFocus
                disableEnforceFocus
                disableEscapeKeyDown
                style={{ zIndex: 1000 }}
                aria-labelledby="create-skintype-modal"
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Create New Skintype</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Skintype Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className={`px-4 py-2 text-white rounded flex items-center gap-2 ${
                                isSaving 
                                    ? 'bg-green-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Skintype'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[1001] flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Close</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to close? All unsaved changes will be lost.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClose}
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

export default StaffCreateSkintype; 