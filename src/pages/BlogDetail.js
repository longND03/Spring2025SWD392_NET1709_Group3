import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../data/blogData";
import {
  Container,
  Box,
  Chip,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CommentSection from "../components/CommentSection";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "../styles/tiptap.css";

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [id]);

  // Thay đổi hàm getImageUrl để xử lý base64 tương tự như trong BlogCard
  const getImageUrl = (post) => {
    if (post.imageUrls && post.imageUrls.length > 0) {
      // Nếu là base64 string
      if (post.imageUrls[0].startsWith("data:")) {
        return post.imageUrls[0];
      }
      // Nếu là base64 raw data
      return `data:image/jpeg;base64,${post.imageUrls[0]}`;
    }
    return "/images/default-img.jpg";
  };

  // Tương tự xử lý hình ảnh cho sản phẩm
  const getProductImageUrl = (product) => {
    if (product.imageUrls && product.imageUrls.length > 0) {
      if (product.imageUrls[0].startsWith("data:")) {
        return product.imageUrls[0];
      }
      return `data:image/jpeg;base64,${product.imageUrls[0]}`;
    }
    return "/images/default-img.jpg";
  };

  // Fetch related posts using /api/post with TagIds filter
  const fetchRelatedPosts = async (post) => {
    try {
      // Check if we have tag names from the post
      let tagNames = [];
      let tagIds = [];

      // Debug data structure
      if (process.env.NODE_ENV === "development") {
        console.group("Related Posts Debug");
        console.log("Post Data:", post);
        console.log("Tags:", post.tags);
        console.log("TagIds:", post.tagIds);
        console.groupEnd();
      }

      // Try to get tags as strings first
      if (
        post.tags &&
        post.tags.length > 0 &&
        typeof post.tags[0] === "string"
      ) {
        tagNames = post.tags;

        // Fetch tag IDs from tag names
        try {
          const tagsResponse = await axios.get("/api/tag");
          const allTags = tagsResponse.data || [];

          // Find matching tags by name
          const matchingTags = allTags.filter((tag) =>
            tagNames.some(
              (name) => name.toLowerCase() === tag.name.toLowerCase()
            )
          );

          if (matchingTags.length > 0) {
            tagIds = matchingTags.map((tag) => tag.id);
            console.log("Found tag IDs:", tagIds);
          }
        } catch (error) {
          console.error("Error fetching tags:", error);
        }
      }
      // Try other tag formats if needed
      else if (post.tagIds && post.tagIds.length > 0) {
        tagIds = post.tagIds;
      } else if (
        post.tags &&
        post.tags.length > 0 &&
        typeof post.tags[0] === "object"
      ) {
        // If tags are objects with id property
        tagIds = post.tags.map((tag) => tag.id);
      }

      // Only proceed if we have tags
      if (tagIds.length === 0) {
        console.log("No tag IDs found for related posts");
        setRelatedPosts([]);
        return;
      }

      // Fetch posts with tag filter - send as array
      const response = await axios.get("/api/post", {
        params: {
          TagIds: tagIds, // Send all matching tag IDs
          PageSize: 3, // Limit to 3 posts
          PageNumber: 1, // First page
          Status: true, // Only published posts
          IsDeleted: false, // Not deleted posts
        },
        paramsSerializer: (params) => {
          // Handle array params properly
          let result = [];
          for (const key in params) {
            if (Array.isArray(params[key])) {
              params[key].forEach((val) => {
                result.push(`${key}=${val}`);
              });
            } else {
              result.push(`${key}=${params[key]}`);
            }
          }
          return result.join("&");
        },
      });

      console.log("Related posts API response:", response.data);

      // Filter out the current post
      const filteredPosts = response.data.items.filter(
        (item) => item.id !== parseInt(id)
      );

      // Take only the first 3 posts
      setRelatedPosts(filteredPosts.slice(0, 3));
    } catch (error) {
      console.error("Error fetching related posts:", error);
      setRelatedPosts([]);
    }
  };

  // Chỉnh sửa hàm fetchPost
  const fetchPost = async () => {
    try {
      setLoading(true);

      // Fetch the blog post by ID
      const response = await axios.get(`/api/post/${id}`);
      const postData = response.data;

      if (process.env.NODE_ENV === "development") {
        console.group("Post Data Debug");
        console.log("Post ID:", id);
        console.log("Post Response:", postData);
        console.groupEnd();
      }

      // Không cần xử lý ảnh nữa, truyền trực tiếp data
      setPost(postData);

      // Fetch comments for this post
      try {
        const commentsResponse = await axios.get(`/api/comment/post/${id}`);
        const sortedComments = commentsResponse.data.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );
        setComments(sortedComments);
      } catch (commentError) {
        console.error("Error fetching comments:", commentError);
        setComments([]);
      }

      // Fetch related posts using the post data
      fetchRelatedPosts(postData);

      // Fetch related products
      fetchRelatedProducts(postData);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load blog post. Please try again later.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  // Chỉnh sửa hàm fetchRelatedProducts
  const fetchRelatedProducts = async (post) => {
    try {
      // Try to get tag names and IDs
      let tagNames = [];
      let tagIds = [];

      if (
        post.tags &&
        post.tags.length > 0 &&
        typeof post.tags[0] === "string"
      ) {
        tagNames = post.tags;

        // Fetch tag IDs from tag names for products
        try {
          const tagsResponse = await axios.get("/api/tag");
          const allTags = tagsResponse.data || [];

          // Find matching tags by name
          const matchingTags = allTags.filter((tag) =>
            tagNames.some(
              (name) => name.toLowerCase() === tag.name.toLowerCase()
            )
          );

          if (matchingTags.length > 0) {
            tagIds = matchingTags.map((tag) => tag.id);
            console.log("Found product tag IDs:", tagIds);
          }
        } catch (error) {
          console.error("Error fetching tags for products:", error);
        }
      }
      // Try other formats if needed
      else if (post.tagIds && post.tagIds.length > 0) {
        tagIds = post.tagIds;
      } else if (post.tags && post.tags.length > 0) {
        if (typeof post.tags[0] === "object" && post.tags[0].id) {
          tagIds = post.tags.map((tag) => tag.id);
        } else if (typeof post.tags[0] === "number") {
          tagIds = post.tags;
        }
      }

      if (tagIds.length === 0) {
        console.log("No tag IDs found for related products");
        setRelatedProducts([]);
        return;
      }

      // Use product API with TagIds filter
      const response = await axios.get("/api/product", {
        params: {
          TagIds: tagIds[0], // Use first tag ID for products
          PageSize: 3,
          PageNumber: 1,
        },
      });

      console.log("Related products API response:", response.data);
      setRelatedProducts(response.data.items || []);
    } catch (error) {
      console.error("Error fetching related products:", error);
      setRelatedProducts([]);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Cải thiện hàm renderHtmlContent để xử lý các trường hợp đặc biệt
  const renderHtmlContent = (htmlContent) => {
    // Nếu không có nội dung, hiển thị thông báo mặc định
    if (!htmlContent || htmlContent.trim() === "") {
      return { __html: `<p>This post doesn't have any content yet.</p>` };
    }

    try {
      // Thử parse nội dung HTML
      return { __html: htmlContent };
    } catch (error) {
      console.error("Error rendering HTML content:", error);
      return {
        __html: `<p>Error displaying content. Please try again later.</p>`,
      };
    }
  };

  // Thêm debug info khi ở chế độ development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && post) {
      console.group("BlogDetail Debug Info");
      console.log("Post ID:", id);
      console.log("Post data:", post);
      console.log("Image URLs:", post.imageUrls);
      console.log("Tags:", post.tags);
      console.log("Related posts:", relatedPosts);
      console.log("Comments:", comments);
      console.groupEnd();
    }
  }, [post, id, relatedPosts, comments]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container sx={{ py: 8 }}>
        <Box textAlign="center" py={8}>
          <Typography variant="h4" gutterBottom>
            Blog Post Not Found
          </Typography>
          <Link to="/blog">
            <Button
              startIcon={<ArrowBackIcon />}
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: "#9C27B0",
                "&:hover": { bgcolor: "#7B1FA2" },
              }}
            >
              Back to Blog
            </Button>
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Post Image */}
      <div className="relative h-96 bg-gradient-to-r from-pink-100 to-purple-100">
        <img
          src={getImageUrl(post)}
          alt={post.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
          <Container maxWidth="lg" sx={{ mb: 6 }}>
            <Chip
              label={post.category}
              sx={{
                bgcolor: "#9C27B0",
                color: "white",
                mb: 2,
              }}
            />
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: "white",
                fontWeight: "bold",
                textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              {post.title}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "white",
                mt: 1,
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              By {post.author} •{" "}
              {formatDate(post.publishedDate || post.createdDate)}
            </Typography>
          </Container>
        </div>
      </div>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box display="flex" justifyContent="space-between" flexWrap="wrap">
          {/* Main Content */}
          <Box flex="1 1 65%" minWidth="280px" pr={{ xs: 0, md: 4 }} mb={4}>
            <Link to="/blog">
              <Button
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 4, color: "#9C27B0" }}
              >
                Back to Blog
              </Button>
            </Link>

            {/* Post Content - Thay đổi phần hiển thị nội dung */}
            <div className="prose max-w-none">
              {/* Thay thế Typography bằng div với dangerouslySetInnerHTML */}
              <div
                className="tiptap-content"
                dangerouslySetInnerHTML={renderHtmlContent(post.content)}
              />

              {post.keyTakeaways && post.keyTakeaways.length > 0 && (
                <>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ mt: 4, mb: 2, fontWeight: "bold" }}
                  >
                    Key Takeaways
                  </Typography>

                  <Typography variant="body1" component="ul" sx={{ pl: 2 }}>
                    {post.keyTakeaways.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </Typography>
                </>
              )}
            </div>

            {/* Tags */}
            <Box mt={4}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(
                  post.tags || [
                    "skincare",
                    "beauty",
                    "tips",
                    post.category?.toLowerCase(),
                  ]
                ).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: "#9C27B0", color: "#9C27B0" }}
                  />
                ))}
              </Box>
            </Box>

            {/* Related Posts - Moved from sidebar to below tags */}
            <Box mt={5}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Related Posts
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((relatedPost) => (
                    <Box
                      key={relatedPost.id}
                      sx={{
                        flex: "1 1 300px",
                        maxWidth: "350px",
                        mb: 2,
                        bgcolor: "white",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: 1,
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: 3,
                        },
                      }}
                    >
                      <Link
                        to={`/blog/${relatedPost.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <img
                          src={getImageUrl(relatedPost)}
                          alt={relatedPost.title}
                          style={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                          }}
                        />
                        <Box sx={{ p: 2 }}>
                          <Typography
                            variant="subtitle1"
                            color="text.primary"
                            sx={{ fontWeight: "bold" }}
                          >
                            {relatedPost.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {relatedPost.excerpt ||
                              relatedPost.description?.substring(0, 80) ||
                              ""}
                            {relatedPost.excerpt ||
                            relatedPost.description?.length > 80
                              ? "..."
                              : ""}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(
                                relatedPost.publishedDate ||
                                  relatedPost.createdDate
                              )}
                            </Typography>
                            <Chip
                              label={relatedPost.category}
                              size="small"
                              sx={{
                                bgcolor: "#9C27B0",
                                color: "white",
                                fontSize: "0.7rem",
                                height: "24px",
                              }}
                            />
                          </Box>
                        </Box>
                      </Link>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No related posts found.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Comments Section */}
            <Box mt={6}>
              <Divider sx={{ mb: 4 }} />
              <CommentSection
                postId={post.id}
                comments={comments.map((comment) => ({
                  id: comment.id,
                  content: comment.content,
                  username: comment.username,
                  createdDate: comment.createdDate,
                  updatedDate: comment.updatedDate,
                }))}
              />
            </Box>
          </Box>

          {/* Sidebar */}
          <Box flex="1 1 30%" minWidth="280px">
            <Box sx={{ bgcolor: "white", p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Related Products
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {relatedProducts.length > 0 ? (
                relatedProducts.map((product) => (
                  <Card
                    key={product.id}
                    sx={{ mb: 2, boxShadow: 0, border: "1px solid #f0f0f0" }}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <CardMedia
                          component="img"
                          sx={{ width: 80, height: 80, objectFit: "cover" }}
                          image={getProductImageUrl(product)}
                          alt={product.name}
                        />
                        <CardContent sx={{ flex: "1 1 auto", py: 1 }}>
                          <Typography variant="subtitle2" color="text.primary">
                            {product.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.8rem" }}
                          >
                            {product.category}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            color="#E91E63"
                            sx={{ fontWeight: "bold", mt: 0.5 }}
                          >
                            ${product.price}
                          </Typography>
                        </CardContent>
                      </Box>
                    </Link>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No related products found.
                </Typography>
              )}

              {/* Newsletter Signup */}
              <Box mt={4} p={3} bgcolor="#f8f0ff" borderRadius={2}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold" }}
                >
                  Subscribe to Our News
                </Typography>
                <Typography variant="body2" paragraph>
                  Get the latest skincare tips and product recommendations.
                </Typography>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full p-2 border border-purple-300 rounded mb-2"
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: "#9C27B0",
                    "&:hover": { bgcolor: "#7B1FA2" },
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default BlogDetail;
