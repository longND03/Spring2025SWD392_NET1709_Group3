import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@mui/material';
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

const StaffUpdateBlog = ({ open, onClose, onSave, post }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3]
                }
            }),
            Underline,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px]',
            },
        },
    });

    // Load post data when component mounts or post changes
    useEffect(() => {
        if (post && open) {
            setTitle(post.title);
            setContent(post.content);
            editor?.commands.setContent(post.content);
            
            // Handle existing image if available
            if (post.imageUrls && post.imageUrls.length > 0) {
                setImagePreview(post.imageUrls[post.imageUrls.length - 1]);
            } else {
                setImagePreview('');
            }
            setIsInitialized(true);
        }
    }, [post, editor, open]);

    // Effect to clear the form when modal is closed
    useEffect(() => {
        if (!open && isInitialized) {
            setTitle('');
            setContent('');
            setSelectedTags([]);
            setSelectedImage(null);
            setImagePreview('');
            editor?.commands.clearContent();
            setIsInitialized(false);
        }
    }, [open, editor, isInitialized]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get('/api/tag');
                setAvailableTags(response.data);
                
                // If post is available, match tag names with tag IDs
                if (post && post.tags && post.tags.length > 0) {
                    const tagObjects = post.tags.map(tagName => {
                        // Find the tag object with matching name from available tags
                        const matchingTag = response.data.find(tag => tag.name === tagName);
                        return matchingTag || { id: tagName, name: tagName }; // Fallback if no match found
                    });
                    setSelectedTags(tagObjects);
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
                toast.error('Failed to load tags');
            }
        };

        fetchTags();
    }, [post]);

    const handleSave = async () => {
        try {
            // Find tags that were removed
            const oldTagIds = post.tags.map(tagName => {
                const matchingTag = availableTags.find(tag => tag.name === tagName);
                return matchingTag ? matchingTag.id : null;
            }).filter(id => id !== null);

            const newTagIds = selectedTags.map(tag => tag.id);
            const removedTagIds = oldTagIds.filter(id => !newTagIds.includes(id));

            // Remove tags that were unselected
            for (const tagId of removedTagIds) {
                try {
                    await axios.delete(`/api/tag/post/${post.id}?tagId=${tagId}`);
                } catch (error) {
                    console.error('Error removing tag:', error);
                    toast.error(messages.error.tag.remove.blog);
                    return;
                }
            }

            // Proceed with the regular update
            await axios.put(`/api/post/${post.id}`, {
                title: title,
                content: content,
                tagIds: selectedTags.map(tag => tag.id),
                imageFiles: selectedImage
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(messages.success.product.update);
            onClose();
            onSave();
        } catch (error) {
            console.error('Error updating post:', error);
            toast.error(messages.error.product.save);
        }
    };

    const handleImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                toast.error('Image size should be less than 10MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview('');
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleTagToggle = (tag) => {
        setSelectedTags(prev => {
            const isSelected = prev.find(t => t.id === tag.id);
            if (isSelected) {
                return prev.filter(t => t.id !== tag.id);
            }
            return [...prev, tag];
        });
    };

    const handleClose = () => {
        if (title !== post.title || content !== post.content || 
            JSON.stringify(selectedTags) !== JSON.stringify(post.tags.map(tag => ({ id: tag, name: tag }))) || 
            selectedImage) {
            setShowConfirmDialog(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowConfirmDialog(false);
        onClose();
        // Form will be cleared by the useEffect above
    };

    return (
        <>
            <Modal
                open={open}
                disableAutoFocus
                disableEnforceFocus
                disableEscapeKeyDown
                style={{ zIndex: 1000 }}
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90vh] bg-white rounded-lg shadow-2xl overflow-auto">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                    >
                        ×
                    </button>

                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Update Blog Post</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    placeholder="Enter title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                <button
                                    onClick={handleImageUpload}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Upload Image
                                </button>
                            </div>
                            {imagePreview && (
                                <div className="mt-2 relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-32 object-contain rounded"
                                    />
                                    <button
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded min-h-[42px]">
                                {selectedTags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded flex items-center gap-1"
                                    >
                                        {tag.name}
                                        <button
                                            onClick={() => handleTagToggle(tag)}
                                            className="text-blue-600 hover:text-blue-800 font-bold"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {availableTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagToggle(tag)}
                                        className={`px-2 py-1 rounded text-sm ${selectedTags.find(t => t.id === tag.id)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
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
                                <div className="[&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror]:focus:outline-none">
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Update
                            </button>
                        </div>
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

export default StaffUpdateBlog; 