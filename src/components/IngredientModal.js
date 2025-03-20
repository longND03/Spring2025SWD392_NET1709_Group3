import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import Axios from '../api/axios';

const IngredientModal = ({ open, onClose, onSave, ingredient = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        if (ingredient) {
            setFormData({
                name: ingredient.name || '',
                description: ingredient.description || ''
            });
        } else {
            setFormData({
                name: '',
                description: ''
            });
        }
        setHasUnsavedChanges(false);
    }, [ingredient, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            if (ingredient) {
                await Axios.put(`/api/ingredient/${ingredient.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Ingredient updated successfully');
            } else {
                await Axios.post('/api/ingredient', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Ingredient created successfully');
            }
            setHasUnsavedChanges(false);
            onSave();
        } catch (error) {
            console.error('Error saving ingredient:', error);
            toast.error(ingredient ? 'Failed to update ingredient' : 'Failed to create ingredient');
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{ingredient ? 'Edit Ingredient' : 'Create New Ingredient'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            name="name"
                            label="Name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <TextField
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            multiline
                            rows={4}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {ingredient ? 'Update' : 'Create'}
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

export default IngredientModal; 