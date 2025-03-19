import React, { useState, useEffect } from "react";
import BlogCard from "../components/BlogCard";
import axios from "../api/axios";
import {
  CircularProgress,
  Box,
  Button,
  Typography,
  Tooltip,
} from "@mui/material";
import { toast } from "react-toastify";

const Blog = () => {
  const [selectedTag, setSelectedTag] = useState({ id: 0, name: "All" });
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([{ id: 0, name: "All" }]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch posts from API
  useEffect(() => {
    fetchPosts();
    window.scrollTo(0, 0);
  }, [selectedTag, page]);

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare query parameters for API call
      const params = {
        PageNumber: page,
        PageSize: 12,
        Status: true,
      };

      // Add tag filter if not "All"
      if (selectedTag.id !== 0) {
        params.TagIds = [selectedTag.id];
      }

      // Fetch posts from API
      const response = await axios.get(`/api/post?TagIds=${selectedTag.id}`);
      console.log(`/api/post?TagIds=${selectedTag.id}`);
      console.log("API Response:", response.data);
      console.log(
        "Total posts:",
        response.data.items ? response.data.items.length : 0
      );

      // Update posts state
      setPosts(response.data.items || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load blog posts. Please try again later.");
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available tags
  const fetchTags = async () => {
    try {
      // Fetch tags from API
      const response = await axios.get("/api/tag");
      const tagData = response.data || [];

      // Lưu trữ cả object tag thay vì chỉ tên
      const allOption = { id: 0, name: "All" };
      const sortedTags = [
        allOption,
        ...tagData.sort((a, b) => a.name.localeCompare(b.name)),
      ];

      setTags(sortedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      // Fallback tags với giả lập id
      setTags([
        { id: 0, name: "All" },
        { id: 1, name: "Hydrating" },
        { id: 2, name: "Anti-Aging" },
        { id: 3, name: "Sensitive Skin" },
        { id: 4, name: "Oil Control" },
        { id: 5, name: "Brightening" },
      ]);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-100 to-purple-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              Beauty & Skincare Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the latest in skincare—expert advice, product reviews,
              and tips for achieving your healthiest skin ever.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Tags */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Browse by Skin Concern
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {tags.map((tag) => (
              <Tooltip
                key={tag.id}
                title={
                  tag.name === "All"
                    ? "Show all posts"
                    : `Show posts about ${tag.name}`
                }
                arrow
              >
                <button
                  onClick={() => {
                    setSelectedTag(tag);
                    setPage(1); // Reset to first page when changing tag
                  }}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    selectedTag.id === tag.id
                      ? "bg-purple-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                  }`}
                >
                  {tag.name}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#9C27B0" }} />
          </Box>
        ) : error ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={fetchPosts}
              sx={{
                mt: 2,
                bgcolor: "#9C27B0",
                "&:hover": { bgcolor: "#7B1FA2" },
              }}
            >
              Try Again
            </Button>
          </Box>
        ) : (
          <>
            {selectedTag.name !== "All" && (
              <Box textAlign="center" mb={4}>
                <Typography
                  variant="h5"
                  sx={{ color: "#7B1FA2", fontWeight: "medium" }}
                >
                  Posts about {selectedTag.name}
                </Typography>
              </Box>
            )}

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* No Posts Message */}
            {posts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl text-gray-600">
                  No posts found for {selectedTag.name}.
                </h3>
                <button
                  onClick={() => setSelectedTag({ id: 0, name: "All" })}
                  className="mt-4 text-purple-600 hover:text-purple-700"
                >
                  View all posts
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={6} gap={2}>
                <Button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  sx={{
                    color: "#9C27B0",
                    "&:disabled": { color: "rgba(0, 0, 0, 0.26)" },
                  }}
                >
                  Previous
                </Button>

                <Box display="flex" alignItems="center" mx={2}>
                  <Typography variant="body2">
                    Page {page} of {totalPages}
                  </Typography>
                </Box>

                <Button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  sx={{
                    color: "#9C27B0",
                    "&:disabled": { color: "rgba(0, 0, 0, 0.26)" },
                  }}
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
