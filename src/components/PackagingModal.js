import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { toast } from 'react-toastify';
import Axios from '../api/axios';

const PackagingModal = ({ open, onClose, onSave, packaging = null }) => {
    const [formData, setFormData] = useState({
        type: '',
        material: '',
        size: '',
        isRefillable: false
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        if (packaging) {
            setFormData({
                type: packaging.type || '',
                material: packaging.material || '',
                size: packaging.size || '',
                isRefillable: packaging.isRefillable || false
            });
        } else {
            setFormData({
                type: '',
                material: '',
                size: '',
                isRefillable: false
            });
        }
        setHasUnsavedChanges(false);
    }, [packaging, open]);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'isRefillable' ? checked : value
        }));
        setHasUnsavedChanges(true);
    };

    const handleClose = () => {
        if (hasUnsavedChanges) {
            setShowConfirmDialog(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirmDialog(false);
        setHasUnsavedChanges(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (packaging) {
                await Axios.put(`/api/packaging/${packaging.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Packaging updated successfully');
            } else {
                await Axios.post('/api/packaging', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Packaging created successfully');
            }
            setHasUnsavedChanges(false);
            onSave();
        } catch (error) {
            console.error('Error saving packaging:', error);
            toast.error(packaging ? 'Failed to update packaging' : 'Failed to create packaging');
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{packaging ? 'Edit Packaging' : 'Create New Packaging'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            name="type"
                            label="Type"
                            value={formData.type}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="material"
                            label="Material"
                            value={formData.material}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="size"
                            label="Size"
                            value={formData.size}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isRefillable"
                                    checked={formData.isRefillable}
                                    onChange={handleChange}
                                />
                            }
                            label="Refillable"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {packaging ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
                <DialogTitle>Unsaved Changes</DialogTitle>
                <DialogContent>
                    Are you sure you want to close? Any unsaved changes will be lost.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                    <Button onClick={handleConfirmClose} color="primary">
                        Close Without Saving
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PackagingModal; 