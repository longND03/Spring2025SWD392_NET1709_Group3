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
        PageSize: 6,
        Status: true,
        IsDeleted: false,
      };

      // Add tag filter if not "All"
      if (selectedTag.id !== 0) {
        params.TagIds = [selectedTag.id];
      }

      // Fetch posts from API
      const response = await axios.get(`/api/post`, { params });
      console.log("API Response:", response.data);

      // Không cần xử lý ảnh ở đây nữa, truyền trực tiếp data từ API
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
              <div className="mt-12 flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    }`}
                  >
                    First
                  </button>

                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show current page, and 2 pages before and after
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= page - 2 && pageNumber <= page + 2)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`w-8 h-8 rounded-full ${
                              page === pageNumber
                                ? "bg-purple-600 text-white"
                                : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === page - 3 ||
                        pageNumber === page + 3
                      ) {
                        return (
                          <span key={pageNumber} className="px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      page === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    }`}
                  >
                    Next
                  </button>

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      page === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    }`}
                  >
                    Last
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                  {posts.length > 0 && ` • Showing ${posts.length} posts`}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
