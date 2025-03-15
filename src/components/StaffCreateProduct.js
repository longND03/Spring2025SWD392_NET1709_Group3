import React, { useState, useEffect } from 'react';
import { Modal } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import axios from '../api/axios';
import { toast } from 'react-toastify';
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
        productTags: [],
        productIngredients: [],
        productSkinTypes: []
    });
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
            toast.error('Failed to load necessary data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMultipleSelect = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item.id)
                ? prev[field].filter(id => id !== item.id)
                : [...prev[field], item.id]
        }));
    };

    const validateForm = () => {
        const requiredFields = {
            name: 'Product Name',
            price: 'Price',
            brandId: 'Brand',
            categoryId: 'Category',
            packagingId: 'Packaging',
            formulationTypeId: 'Formulation Type',
            description: 'Description'
        };

        for (const [field, label] of Object.entries(requiredFields)) {
            if (!formData[field]) {
                toast.error(`${label} is required`);
                return false;
            }
        }

        if (formData.productTags.length === 0) {
            toast.error('Please select at least one tag');
            return false;
        }

        if (formData.productIngredients.length === 0) {
            toast.error('Please select at least one ingredient');
            return false;
        }

        if (formData.productSkinTypes.length === 0) {
            toast.error('Please select at least one skin type');
            return false;
        }

        if (parseFloat(formData.price) <= 0) {
            toast.error('Price must be greater than 0');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        try {
            if (!validateForm()) return;
            setIsSaving(true);

            const productData = {
                name: formData.name,
                description: formData.description,
                brandId: formData.brandId,
                categoryId: formData.categoryId,
                price: parseFloat(formData.price),
                // Optional fields
                packagingId: formData.packagingId || null,
                formulationTypeId: formData.formulationTypeId || null,
                direction: formData.direction || '',
                pao: formData.pao || '',
                precaution: formData.precaution || '',
                storage: formData.storage || '',
                additionalInformation: formData.additionalInformation || '',
                productTags: formData.productTags,
                productIngredients: formData.productIngredients,
                productSkinTypes: formData.productSkinTypes
            };

            // Log the data in a formatted way
            console.log('Product Data for API:');
            console.log(JSON.stringify(productData, null, 2));

            await axios.post('/api/product', productData);
            
            toast.success('Product created successfully');
            onSave();
            handleConfirmClose();
        } catch (error) {
            console.error('Error creating product:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to create product. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (formData.name || formData.description || formData.price || formData.brandId || 
            formData.categoryId || formData.packagingId || formData.formulationTypeId || 
            formData.direction || formData.pao || formData.precaution || formData.storage || 
            formData.additionalInformation || formData.productTags.length > 0 || 
            formData.productIngredients.length > 0 || formData.productSkinTypes.length > 0) {
            setShowConfirmDialog(true);
        } else {
            handleConfirmClose();
        }
    };

    const handleConfirmClose = () => {
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
            productTags: [],
            productIngredients: [],
            productSkinTypes: []
        });
        editor?.commands.setContent('');
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
                aria-labelledby="create-product-modal"
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Create New Product</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                            <select
                                name="brandId"
                                value={formData.brandId}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Select Brand</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Packaging</label>
                            <select
                                name="packagingId"
                                value={formData.packagingId}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Select Packaging</option>
                                {packagings.map((packaging) => (
                                    <option key={packaging.id} value={packaging.id}>
                                        {packaging.type} - {packaging.material} ({packaging.size})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Formulation Type</label>
                            <select
                                name="formulationTypeId"
                                value={formData.formulationTypeId}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">Select Formulation Type</option>
                                {formulationTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.texture}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-2">
                                <button
                                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
                                    title="Heading 1"
                                >
                                    <Heading1Icon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
                                    title="Heading 2"
                                >
                                    <Heading2Icon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
                                    title="Heading 3"
                                >
                                    <Heading3Icon className="w-5 h-5" />
                                </button>
                                <div className="w-px h-6 bg-gray-300 my-auto"></div>
                                <button
                                    onClick={() => editor?.chain().focus().toggleBold().run()}
                                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                                    title="Bold"
                                >
                                    <BoldIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                                    title="Italic"
                                >
                                    <ItalicIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('strike') ? 'bg-gray-200' : ''}`}
                                    title="Strikethrough"
                                >
                                    <StrikethroughIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('underline') ? 'bg-gray-200' : ''}`}
                                    title="Underline"
                                >
                                    <UnderlineIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Directions</label>
                            <textarea
                                name="direction"
                                value={formData.direction}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Storage Instructions</label>
                            <textarea
                                name="storage"
                                value={formData.storage}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Period After Opening</label>
                            <input
                                type="text"
                                name="pao"
                                value={formData.pao}
                                onChange={handleChange}
                                placeholder="e.g., 12M"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Precautions</label>
                            <textarea
                                name="precaution"
                                value={formData.precaution}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                        <textarea
                            name="additionalInformation"
                            value={formData.additionalInformation}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[42px]">
                                {tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        onClick={() => handleMultipleSelect('productTags', tag)}
                                        className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                                            formData.productTags.includes(tag.id)
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tag.name}
                                        {formData.productTags.includes(tag.id) && (
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
                                        onClick={() => handleMultipleSelect('productIngredients', ingredient)}
                                        className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                                            formData.productIngredients.includes(ingredient.id)
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        {ingredient.name}
                                        {formData.productIngredients.includes(ingredient.id) && (
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
                                        onClick={() => handleMultipleSelect('productSkinTypes', skinType)}
                                        className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                                            formData.productSkinTypes.includes(skinType.id)
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                    >
                                        {skinType.name}
                                        {formData.productSkinTypes.includes(skinType.id) && (
                                            <span className="ml-2 text-blue-600 hover:text-blue-800">×</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
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
                                'Create Product'
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

export default StaffCreateProduct; 