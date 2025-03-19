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

  // Fetch post data from API
  const fetchPost = async () => {
    try {
      setLoading(true);

      // Fetch the blog post by ID
      const response = await axios.get(`/api/post/${id}`);
      const postData = response.data;
      setPost(postData);

      // Fetch comments for this post
      try {
        const commentsResponse = await axios.get(`/api/comment/post/${id}`);
        setComments(commentsResponse.data || []);
      } catch (commentError) {
        console.error("Error fetching comments:", commentError);
        setComments([]);
      }

      // Fetch related posts (based on tags or category)
      if ((postData.tags && postData.tags.length > 0) || postData.category) {
        try {
          const tagQuery =
            postData.tags?.length > 0
              ? postData.tags.join(",")
              : postData.category;

          const relatedResponse = await axios.get(`/api/post/related`, {
            params: {
              tags: tagQuery,
              exclude: id,
              limit: 3,
            },
          });
          setRelatedPosts(relatedResponse.data || []);
        } catch (relatedError) {
          console.error("Error fetching related posts:", relatedError);
          setRelatedPosts([]);
        }
      }

      // Fetch related products based on tags
      fetchRelatedProducts(postData.tags || [postData.category]);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load blog post. Please try again later.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch related products based on tags
  const fetchRelatedProducts = async (tags) => {
    try {
      // Call to product API with tags
      const response = await axios.get(`/api/product/related`, {
        params: {
          tags: Array.isArray(tags) ? tags.join(",") : tags,
          limit: 3,
        },
      });

      setRelatedProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching related products:", error);

      // Fallback to mock data if API fails
      setRelatedProducts([
        {
          id: 1,
          name: "Hydrating Facial Cleanser",
          price: 24.99,
          image: "https://via.placeholder.com/150",
          category: "Cleansers",
        },
        {
          id: 2,
          name: "Vitamin C Serum",
          price: 39.99,
          image: "https://via.placeholder.com/150",
          category: "Serums",
        },
        {
          id: 3,
          name: "Retinol Night Cream",
          price: 49.99,
          image: "https://via.placeholder.com/150",
          category: "Moisturizers",
        },
      ]);
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
          src={
            post.imageUrl ||
            post.image ||
            "https://via.placeholder.com/1200x600"
          }
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

            {/* Post Content */}
            <div className="prose max-w-none">
              <Typography variant="body1" paragraph>
                {post.content ||
                  `This is a detailed content for the blog post "${post.title}". 
                In a real application, this would be a full article with multiple paragraphs, 
                possibly with formatting, images, and other rich content elements.`}
              </Typography>

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
                          src={
                            relatedPost.imageUrl ||
                            relatedPost.image ||
                            "https://via.placeholder.com/350x180"
                          }
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
              <CommentSection postId={post.id} comments={comments} />
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
                          image={
                            product.productImages?.[0]
                              ? `data:image/jpeg;base64,${product.productImages[0]}`
                              : product.image ||
                                "https://via.placeholder.com/80"
                          }
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
