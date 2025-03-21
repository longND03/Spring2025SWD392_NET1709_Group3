import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, CircularProgress } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import messages from '../constants/message.json';
import {
    BoldIcon,
    ItalicIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    StrikethroughIcon,
    UnderlineIcon,
} from 'lucide-react';

const StaffCreateProduct = ({ open, onClose, onSave }) => {
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
        status: true,
        productBatchIds: [],
        productTagIds: [],
        productImageFiles: [],
        productIngredientIds: [],
        productSkinTypeIds: []
    });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    // Options for dropdowns
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [packagings, setPackagings] = useState([]);
    const [formulationTypes, setFormulationTypes] = useState([]);
    const [tags, setTags] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [skinTypes, setSkinTypes] = useState([]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Underline,
        ],
        content: formData.description,
        onUpdate: ({ editor }) => {
            setFormData(prev => ({
                ...prev,
                description: editor.getHTML()
            }));
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
    });

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            fetchAllData();
        }
    }, [open]);

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
            toast.error(messages.error.server);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    toast.error('Image size should be less than 5MB');
                    return;
                }
                if (file.type !== 'image/jpeg') {
                    toast.error('Please select a JPEG image file');
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    return;
                }
                setFormData(prev => ({ ...prev, productImageFiles: file }));
                setImagePreview(URL.createObjectURL(file));
            }
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMultiSelect = (field, item) => {
        const itemId = parseInt(item.id);
        setFormData(prev => {
            const newIds = prev[field].includes(itemId)
                ? prev[field].filter(id => id !== itemId)
                : [...prev[field], itemId];

            return {
                ...prev,
                [field]: newIds
            };
        });
    };

    const validateForm = () => {
        const requiredFields = {
            name: messages.error.product.required.name,
            price: messages.error.product.required.price,
            brandId: messages.error.product.required.brand,
            categoryId: messages.error.product.required.category,
            packagingId: messages.error.product.required.packaging,
            formulationTypeId: messages.error.product.required.formulationType,
            description: messages.error.product.required.description
        };

        for (const [field, message] of Object.entries(requiredFields)) {
            if (!formData[field]) {
                toast.error(message);
                return false;
            }
        }

        if (formData.productTagIds.length === 0) {
            toast.error(messages.error.product.required.tags);
            return false;
        }

        if (formData.productIngredientIds.length === 0) {
            toast.error(messages.error.product.required.ingredients);
            return false;
        }

        if (formData.productSkinTypeIds.length === 0) {
            toast.error(messages.error.product.required.skinTypes);
            return false;
        }

        if (parseFloat(formData.price) <= 0) {
            toast.error(messages.error.product.validation.price);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            setIsSaving(true);

            console.log('Form data being sent:', {
                formData
            });

            await axios.post('/api/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Product created successfully');
            clearForm();
            onClose();
            onSave();
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error(error.response?.data?.message || 'Failed to create product');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (formData.name || formData.description || formData.price || formData.brandId ||
            formData.categoryId || formData.packagingId || formData.formulationTypeId ||
            formData.direction || formData.pao || formData.precaution || formData.storage ||
            formData.additionalInformation || formData.productTagIds.length > 0 ||
            formData.productIngredientIds.length > 0 || formData.productSkinTypeIds.length > 0 ||
            formData.productImageFiles.length > 0) {
            setShowConfirmDialog(true);
        } else {
            handleConfirmClose();
        }
    };

    const handleConfirmClose = () => {
        clearForm();
        setShowConfirmDialog(false);
        onClose();
    };

    const clearForm = () => {
        setFormData({
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
            status: true,
            productBatchIds: [],
            productTagIds: [],
            productImageFiles: [],
            productIngredientIds: [],
            productSkinTypeIds: []
        });
        editor?.commands.setContent('');
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
                aria-labelledby="create-product-modal"
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <CircularProgress />
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Create New Product</h2>
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
                                        required
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
                                                    setFormData(prev => ({ ...prev, productImageFiles: [] }));
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
                                                <option key={brand.id} value={parseInt(brand.id)}>
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
                                                <option key={category.id} value={parseInt(category.id)}>
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
                                            required
                                        >
                                            <option value="">Select Packaging</option>
                                            {packagings.map(packaging => (
                                                <option key={packaging.id} value={parseInt(packaging.id)}>
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
                                            required
                                        >
                                            <option value="">Select Formulation Type</option>
                                            {formulationTypes.map(type => (
                                                <option key={type.id} value={parseInt(type.id)}>
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
                                                    className={`px-3 py-1 rounded-full text-sm cursor-pointer ${formData.productTagIds.includes(parseInt(tag.id))
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {tag.name}
                                                    {formData.productTagIds.includes(parseInt(tag.id)) && (
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
                                                    className={`px-3 py-1 rounded-full text-sm cursor-pointer ${formData.productIngredientIds.includes(parseInt(ingredient.id))
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {ingredient.name}
                                                    {formData.productIngredientIds.includes(parseInt(ingredient.id)) && (
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
                                                    className={`px-3 py-1 rounded-full text-sm cursor-pointer ${formData.productSkinTypeIds.includes(parseInt(skinType.id))
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {skinType.name}
                                                    {formData.productSkinTypeIds.includes(parseInt(skinType.id)) && (
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
                                        {isSaving ? <CircularProgress size={24} /> : 'Create Product'}
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

export default StaffCreateProduct; 