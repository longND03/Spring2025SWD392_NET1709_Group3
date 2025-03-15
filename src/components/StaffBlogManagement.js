import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Axios from '../api/axios';
import { Pagination, CircularProgress, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import StaffCreateBlog from './StaffCreateBlog';
import StaffUpdateBlog from './StaffUpdateBlog';

const StaffBlogManagement = () => {
    const { user } = useAuth();
    const [draftPosts, setDraftPosts] = useState({ items: [], totalPages: 1 });
    const [publishedPosts, setPublishedPosts] = useState({ items: [], totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [publishedPage, setPublishedPage] = useState(1);
    const [draftPage, setDraftPage] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const draftResponse = await Axios.get(`/api/post?PageNumber=${draftPage}&PageSize=10&Status=false`);
            const publishedResponse = await Axios.get(`/api/post?PageNumber=${publishedPage}&PageSize=10&Status=true`);

            setDraftPosts({
                items: draftResponse.data.items || [],
                totalPages: draftResponse.data.totalPages || 1
            });
            setPublishedPosts({
                items: publishedResponse.data.items || [],
                totalPages: publishedResponse.data.totalPages || 1
            });
            setError(null);
        } catch (error) {
            console.error("Error fetching posts:", error);
            setError("Failed to load blog posts. Please try again later.");
            toast.error("Failed to load blog posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [draftPage, publishedPage]);

    const handlePublishedPageChange = (event, value) => {
        setPublishedPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDraftPageChange = (event, value) => {
        setDraftPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePublish = async (postId) => {
        try {
            await Axios.put(`/api/post/publication/${postId}`);
            toast.success('Post published successfully');
            fetchPosts(); // Refresh both lists
        } catch (error) {
            console.error("Error publishing post:", error);
            toast.error("Failed to publish post");
        }
    };

    const handleRemove = async (postId) => {
        try {
            await Axios.delete(`/api/post/soft-delete/${postId}`);
            toast.success('Post removed successfully');
            fetchPosts(); // Refresh both lists
        } catch (error) {
            console.error("Error removing post:", error);
            toast.error("Failed to remove post");
        }
    };

    const handleEdit = (post) => {
        setSelectedPost(post);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        fetchPosts();
        setIsUpdateModalOpen(false);
        setSelectedPost(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const PostTable = ({ posts, isDraft }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 table-fixed">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-left w-64">Title</th>
                        <th className="py-2 px-4 border-b text-left w-32">Author</th>
                        <th className="py-2 px-4 border-b text-left w-40">Created Date</th>
                        <th className="py-2 px-4 border-b text-left w-40">Published Date</th>
                        <th className="py-2 px-4 border-b text-left w-48">Tags</th>
                        <th className="py-2 px-4 border-b text-left w-40">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.items.length > 0 ? (
                        posts.items.map((post) => (
                            <tr key={post.id}>
                                <td className="py-2 px-4 border-b truncate w-64">
                                    <Link
                                        to={`/posts/${post.id}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="py-2 px-4 border-b truncate w-32">{post.author}</td>
                                <td className="py-2 px-4 border-b w-40">{formatDate(post.createdDate)}</td>
                                <td className="py-2 px-4 border-b w-40">
                                    {post.publishedDate ? formatDate(post.publishedDate) : '-'}
                                </td>
                                <td className="py-2 px-4 border-b w-48">
                                    <div className="flex flex-wrap gap-1">
                                        {post.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-2 px-4 border-b w-40">
                                    <div className="flex gap-2">
                                        {isDraft && (
                                            <button
                                                onClick={() => handlePublish(post.id)}
                                                className="text-green-500 hover:text-green-700"
                                            >
                                                Publish
                                            </button>
                                        )}
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => handleEdit(post)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleRemove(post.id)}
                                        >
                                            {post.isDeleted ? 'Delete' : 'Remove'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="py-4 text-center text-gray-500">
                                No {isDraft ? 'draft' : 'published'} posts found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Blog Management</h1>
            <p className="mb-4">Welcome, {user.username}!</p>
            {error && <p className="text-red-500">{error}</p>}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Manage Blog Posts</h2>
                <Button
                    variant="contained"
                    onClick={() => setIsCreateModalOpen(true)}
                    sx={{
                        bgcolor: '#4CAF50',
                        '&:hover': {
                            bgcolor: '#388E3C'
                        }
                    }}
                >
                    Create New Post
                </Button>
            </div>

            <StaffCreateBlog 
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={fetchPosts}
            />

            <StaffUpdateBlog
                open={isUpdateModalOpen}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedPost(null);
                }}
                onSave={handleUpdateSuccess}
                post={selectedPost}
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <CircularProgress />
                </div>
            ) : (
                <>
                    {/* Draft Posts Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">Draft Posts</h3>
                        <PostTable posts={draftPosts} isDraft={true} />
                        {draftPosts.items.length > 0 && (
                            <div className="flex justify-center mt-4">
                                <Pagination
                                    count={draftPosts.totalPages}
                                    page={draftPage}
                                    onChange={handleDraftPageChange}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </div>
                        )}
                    </div>

                    {/* Published Posts Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Published Posts</h3>
                        <PostTable posts={publishedPosts} isDraft={false} />
                        {publishedPosts.items.length > 0 && (
                            <div className="flex justify-center mt-4">
                                <Pagination
                                    count={publishedPosts.totalPages}
                                    page={publishedPage}
                                    onChange={handlePublishedPageChange}
                                    variant="outlined"
                                    shape="rounded"
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StaffBlogManagement;