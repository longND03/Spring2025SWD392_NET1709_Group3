import React, { useState, useEffect } from 'react';
import { Modal, Button, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import axios from '../api/axios';

const StaffEditTag = ({ open, onClose, onSave, tag }) => {
    const [formData, setFormData] = useState({
        name: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (tag) {
            setFormData({
                name: tag.name
            });
        }
    }, [tag]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Tag name is required');
            return;
        }

        try {
            setIsSaving(true);
            await axios.put(`/api/tag/${tag.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('Tag updated successfully');
            onSave();
            handleClose();
        } catch (error) {
            console.error('Error updating tag:', error);
            toast.error(error.response?.data?.message || 'Failed to update tag');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '' });
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            disableAutoFocus
            disableEnforceFocus
            style={{ zIndex: 1000 }}
        >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-lg shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Edit Tag</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            color="inherit"
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSaving}
                            sx={{
                                bgcolor: '#4CAF50',
                                '&:hover': {
                                    bgcolor: '#388E3C'
                                }
                            }}
                        >
                            {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default StaffEditTag; 