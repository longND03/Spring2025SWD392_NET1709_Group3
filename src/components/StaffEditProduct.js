import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, CircularProgress } from '@mui/material';
import axios from '../api/axios';
import { toast } from 'react-toastify';

const StaffEditProduct = ({ open, onClose, onSave, product }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brandId: '',
        categoryId: '',
        packagingId: '',
        price: '',
        formulationTypeId: '',
        direction: '',
        pao: '',
        precaution: '',
        storage: '',
        additionalInformation: '',
        productTagIds: [],
        productIngredientIds: [],
        productSkinTypeIds: []
    });

    const [imagePreview, setImagePreview] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Options for dropdowns
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [packagings, setPackagings] = useState([]);
    const [formulationTypes, setFormulationTypes] = useState([]);
    const [tags, setTags] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [skinTypes, setSkinTypes] = useState([]);

    useEffect(() => {
        if (open) {
            setLoading(true);
            fetchAllData();
        }
    }, [open]);

    useEffect(() => {
        if (product && brands.length > 0 && categories.length > 0 && packagings.length > 0 && 
            formulationTypes.length > 0 && tags.length > 0 && ingredients.length > 0 && skinTypes.length > 0) {
            console.log('Product received:', product);
            
            // Find IDs by matching names
            const brandId = brands.find(b => b.name === product.brand)?.id?.toString() || '';
            const categoryId = categories.find(c => c.name === product.category)?.id?.toString() || '';
            const packagingData = product.packaging.split(" ");
            packagingData[0] = !packagingData[0].toLowerCase().includes("non");
            const packagingId = packagings.find(p => 
                product.packaging.includes(p.type) &&
                product.packaging.includes(p.material) &&
                product.packaging.includes(p.size) &&
                p.isRefillable === !(product.packaging.split(" ")[0].toLowerCase().includes("non"))
            )?.id?.toString() || '';
            const formulationTypeId = formulationTypes.find(f => f.texture === product.formulationType)?.id?.toString() || '';

            // Find tag IDs by matching names
            const tagIds = product.productTags?.map(tagName => 
                tags.find(t => t.name === tagName)?.id?.toString()
            ).filter(Boolean) || [];

            // Find ingredient IDs by matching names
            const ingredientIds = product.productIngredients?.map(ingredientName => 
                ingredients.find(i => i.name === ingredientName)?.id?.toString()
            ).filter(Boolean) || [];

            // Find skin type IDs by matching names
            const skinTypeIds = product.productSkinTypes?.map(skinTypeName => 
                skinTypes.find(s => s.name === skinTypeName)?.id?.toString()
            ).filter(Boolean) || [];

            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                brandId: brandId,
                categoryId: categoryId,
                packagingId: packagingId,
                formulationTypeId: formulationTypeId,
                direction: product.direction || '',
                pao: product.pao || '',
                precaution: product.precaution || '',
                storage: product.storage || '',
                additionalInformation: product.additionalInformation || '',
                productTagIds: tagIds,
                productIngredientIds: ingredientIds,
                productSkinTypeIds: skinTypeIds
            });

            if (product.productImage) {
                setImagePreview(`data:image/jpeg;base64,${product.productImage}`);
            }
            setLoading(false);
        }
    }, [product, brands, categories, packagings, formulationTypes, tags, ingredients, skinTypes]);

    const fetchAllData = async () => {
        try {
            const [
                brandsRes,
                categoriesRes,
                packagingsRes,
                formulationTypesRes,
                tagsRes,
                ingredientsRes,
                skinTypesRes
            ] = await Promise.all([
                axios.get('/api/brand'),
                axios.get('/api/category'),
                axios.get('/api/packaging'),
                axios.get('/api/formulationtype'),
                axios.get('/api/tag'),
                axios.get('/api/ingredient'),
                axios.get('/api/skintype?IsDeleted=false')
            ]);

            setBrands(brandsRes.data);
            setCategories(categoriesRes.data);
            setPackagings(packagingsRes.data);
            setFormulationTypes(formulationTypesRes.data);
            setTags(tagsRes.data);
            setIngredients(ingredientsRes.data);
            setSkinTypes(skinTypesRes.data.items);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load necessary data');
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) {
                    toast.error('Image size should be less than 10MB');
                    return;
                }
                if (file.type !== 'image/jpeg') {
                    toast.error('Please select a JPEG image file');
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    return;
                }
                setSelectedImage(file);
                setFormData(prev => ({ ...prev, productImageFiles: file }));
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMultiSelect = (field, item) => {
        const itemId = item.id.toString();
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(itemId)
                ? prev[field].filter(id => id !== itemId)
                : [...prev[field], itemId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        console.log(formData);
        try {
            await axios.put(`/api/product/${product.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Product updated successfully');
            onClose();
            onSave();
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (JSON.stringify(formData) !== JSON.stringify({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            brandId: brands.find(b => b.name === product.brand)?.id?.toString() || '',
            categoryId: categories.find(c => c.name === product.category)?.id?.toString() || '',
            // packagingId: packagings.find(p => 
            //     p.type === product.packaging?.type && 
            //     p.material === product.packaging?.material && 
            //     p.size === product.packaging?.size
            // )?.id?.toString() || '',
            formulationTypeId: formulationTypes.find(f => f.texture === product.formulationType)?.id?.toString() || '',
            direction: product.direction || '',
            pao: product.pao || '',
            precaution: product.precaution || '',
            storage: product.storage || '',
            additionalInformation: product.additionalInformation || '',
            productTagIds: product.productTags?.map(tagName => 
                tags.find(t => t.name === tagName)?.id?.toString()
            ).filter(Boolean) || [],
            productIngredientIds: product.productIngredients?.map(ingredientName => 
                ingredients.find(i => i.name === ingredientName)?.id?.toString()
            ).filter(Boolean) || [],
            productSkinTypeIds: product.productSkinTypes?.map(skinTypeName => 
                skinTypes.find(s => s.name === skinTypeName)?.id?.toString()
            ).filter(Boolean) || []
        }) || selectedImage) {
            setShowConfirmDialog(true);
        } else {
            handleConfirmClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirmDialog(false);
        setImagePreview('');
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    return (
        <>
        <Modal
                open={open}
                onClose={handleClose}
                disableAutoFocus
                disableEnforceFocus
                style={{ zIndex: 1000 }}
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <CircularProgress />
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Edit Product</h2>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Basic Information */}
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Image
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/jpeg"
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    />
                                    {imagePreview && (
                                        <div className="mt-2 relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-32 object-contain rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview('');
                                                    setSelectedImage(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Brand
                                        </label>
                                        <select
                                            name="brandId"
                                            value={formData.brandId}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Brand</option>
                                            {brands.map(brand => (
                                                <option key={brand.id} value={brand.id.toString()}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Packaging
                                        </label>
                                        <select
                                            name="packagingId"
                                            value={formData.packagingId}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select Packaging</option>
                                            {packagings.map(packaging => (
                                                <option key={packaging.id} value={packaging.id.toString()}>
                                                    {`${packaging.type} - ${packaging.material} (${packaging.size})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Formulation Type
                                        </label>
                                        <select
                                            name="formulationTypeId"
                                            value={formData.formulationTypeId}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select Formulation Type</option>
                                            {formulationTypes.map(type => (
                                                <option key={type.id} value={type.id.toString()}>
                                                    {type.texture}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Multi-select sections */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[42px]">
                                            {tags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    onClick={() => handleMultiSelect('productTagIds', tag)}
                                                    className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                                                        formData.productTagIds.includes(tag.id.toString())
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {tag.name}
                                                    {formData.productTagIds.includes(tag.id.toString()) && (
                                                        <span className="ml-2 text-blue-600 hover:text-blue-800">×</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
                                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[42px]">
                                            {ingredients.map((ingredient) => (
                                                <span
                                                    key={ingredient.id}
                                                    onClick={() => handleMultiSelect('productIngredientIds', ingredient)}
                                                    className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                                                        formData.productIngredientIds.includes(ingredient.id.toString())
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {ingredient.name}
                                                    {formData.productIngredientIds.includes(ingredient.id.toString()) && (
                                                        <span className="ml-2 text-blue-600 hover:text-blue-800">×</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Skin Types</label>
                                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[42px]">
                                            {skinTypes.map((skinType) => (
                                                <span
                                                    key={skinType.id}
                                                    onClick={() => handleMultiSelect('productSkinTypeIds', skinType)}
                                                    className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                                                        formData.productSkinTypeIds.includes(skinType.id.toString())
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {skinType.name}
                                                    {formData.productSkinTypeIds.includes(skinType.id.toString()) && (
                                                        <span className="ml-2 text-blue-600 hover:text-blue-800">×</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Direction
                                        </label>
                                        <textarea
                                            name="direction"
                                            value={formData.direction}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Storage
                                        </label>
                                        <textarea
                                            name="storage"
                                            value={formData.storage}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Period After Opening (PAO)
                                        </label>
                                        <input
                                            type="text"
                                            name="pao"
                                            value={formData.pao}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Precaution
                                        </label>
                                        <textarea
                                            name="precaution"
                                            value={formData.precaution}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional Information
                                    </label>
                                    <textarea
                                        name="additionalInformation"
                                        value={formData.additionalInformation}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <Button
                                        onClick={handleClose}
                                        variant="outlined"
                                        color="inherit"
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
                    )}
                </div>
            </Modal>

            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[1001] flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Confirm Close</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to close? All unsaved changes will be lost.
                        </p>
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

export default StaffEditProduct; 