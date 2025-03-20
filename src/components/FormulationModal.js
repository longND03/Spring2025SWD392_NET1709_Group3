import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { toast } from 'react-toastify';
import Axios from '../api/axios';

const FormulationModal = ({ open, onClose, onSave, formulation = null }) => {
    const [formData, setFormData] = useState({
        texture: '',
        isFragranceFree: false,
        isAlcoholFree: false,
        isParabenFree: false,
        isEssentialOilFree: false,
        isSiliconeFree: false,
        isSulfateFree: false
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        if (formulation) {
            setFormData({
                texture: formulation.texture || '',
                isFragranceFree: formulation.isFragranceFree || false,
                isAlcoholFree: formulation.isAlcoholFree || false,
                isParabenFree: formulation.isParabenFree || false,
                isEssentialOilFree: formulation.isEssentialOilFree || false,
                isSiliconeFree: formulation.isSiliconeFree || false,
                isSulfateFree: formulation.isSulfateFree || false
            });
        } else {
            setFormData({
                texture: '',
                isFragranceFree: false,
                isAlcoholFree: false,
                isParabenFree: false,
                isEssentialOilFree: false,
                isSiliconeFree: false,
                isSulfateFree: false
            });
        }
        setHasUnsavedChanges(false);
    }, [formulation, open]);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.startsWith('is') ? checked : value
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
            if (formulation) {
                await Axios.put(`/api/formulationtype/${formulation.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Formulation updated successfully');
            } else {
                await Axios.post('/api/formulationtype', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Formulation created successfully');
            }
            setHasUnsavedChanges(false);
            onSave();
        } catch (error) {
            console.error('Error saving formulation:', error);
            toast.error(formulation ? 'Failed to update formulation' : 'Failed to create formulation');
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{formulation ? 'Edit Formulation' : 'Create New Formulation'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            name="texture"
                            label="Texture"
                            value={formData.texture}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isFragranceFree"
                                    checked={formData.isFragranceFree}
                                    onChange={handleChange}
                                />
                            }
                            label="Fragrance Free"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isAlcoholFree"
                                    checked={formData.isAlcoholFree}
                                    onChange={handleChange}
                                />
                            }
                            label="Alcohol Free"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isParabenFree"
                                    checked={formData.isParabenFree}
                                    onChange={handleChange}
                                />
                            }
                            label="Paraben Free"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isEssentialOilFree"
                                    checked={formData.isEssentialOilFree}
                                    onChange={handleChange}
                                />
                            }
                            label="Essential Oil Free"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isSiliconeFree"
                                    checked={formData.isSiliconeFree}
                                    onChange={handleChange}
                                />
                            }
                            label="Silicone Free"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="isSulfateFree"
                                    checked={formData.isSulfateFree}
                                    onChange={handleChange}
                                />
                            }
                            label="Sulfate Free"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {formulation ? 'Update' : 'Create'}
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

export default FormulationModal; 