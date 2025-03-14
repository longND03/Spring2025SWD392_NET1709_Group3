import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Axios from '../api/axios';
import { Pagination, CircularProgress, Button } from '@mui/material';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import StaffCreateBlog from './StaffCreateBlog';

const StaffBlogManagement = () => {
    const { user } = useAuth();
    const [draftPosts, setDraftPosts] = useState([]);
    const [publishedPosts, setPublishedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [publishedPage, setPublishedPage] = useState(1);
    const [draftPage, setDraftPage] = useState(1);
    const [publishedTotalPages, setPublishedTotalPages] = useState(1);
    const [draftTotalPages, setDraftTotalPages] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const [draftResponse, publishedResponse] = await Promise.all([
                Axios.get(`/api/post?PageNumber=${draftPage}&PageSize=10&IsDeleted=false&Status=false`),
                Axios.get(`/api/post?PageNumber=${publishedPage}&PageSize=10&IsDeleted=false&Status=true`)
            ]);
            
            setDraftPosts(draftResponse.data || []);
            setPublishedPosts(publishedResponse.data || []);
            setDraftTotalPages(Math.max(1, Math.ceil((draftResponse.data?.length || 0) / 10)));
            setPublishedTotalPages(Math.max(1, Math.ceil((publishedResponse.data?.length || 0) / 10)));
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
            await Axios.put(`/api/post/${postId}/publish`);
            toast.success('Post published successfully');
            fetchPosts(); // Refresh both lists
        } catch (error) {
            console.error("Error publishing post:", error);
            toast.error("Failed to publish post");
        }
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
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-left">Title</th>
                        <th className="py-2 px-4 border-b text-left">Author</th>
                        <th className="py-2 px-4 border-b text-left">Created Date</th>
                        <th className="py-2 px-4 border-b text-left">Published Date</th>
                        <th className="py-2 px-4 border-b text-left">Tags</th>
                        <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <tr key={post.id}>
                                <td className="py-2 px-4 border-b">
                                    <Link
                                        to={`/posts/${post.id}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="py-2 px-4 border-b">{post.author}</td>
                                <td className="py-2 px-4 border-b">{formatDate(post.createdDate)}</td>
                                <td className="py-2 px-4 border-b">
                                    {post.publishedDate ? formatDate(post.publishedDate) : '-'}
                                </td>
                                <td className="py-2 px-4 border-b">
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
                                <td className="py-2 px-4 border-b">
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
                                            onClick={() => {/* TODO: Implement edit */}}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => {/* TODO: Implement delete */}}
                                        >
                                            Delete
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
                        {draftPosts.length > 0 && (
                            <div className="flex justify-center mt-4">
                                <Pagination
                                    count={draftTotalPages}
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
                        {publishedPosts.length > 0 && (
                            <div className="flex justify-center mt-4">
                                <Pagination
                                    count={publishedTotalPages}
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