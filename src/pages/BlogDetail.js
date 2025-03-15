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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CommentSection from "../components/CommentSection";

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([
    {
      id: 1,
      text: "Great article! Very informative and well-written.",
      author: "Jane Smith",
      avatar: "https://via.placeholder.com/40",
      date: "2024-03-15",
      postId: 1,
    },
    // Thêm các comment mẫu khác nếu muốn
  ]);

  useEffect(() => {
    // Simulate API fetch with setTimeout
    setLoading(true);
    setTimeout(() => {
      const foundPost = blogPosts.find(
        (post) => post.id === parseInt(id) || post.id === id
      );
      setPost(foundPost);

      // Find related posts (same category, excluding current post)
      if (foundPost) {
        const related = blogPosts
          .filter(
            (p) => p.category === foundPost.category && p.id !== foundPost.id
          )
          .slice(0, 3);
        setRelatedPosts(related);
      }

      setLoading(false);
    }, 500);

    // Scroll to top when post changes
    window.scrollTo(0, 0);
  }, [id]);

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
          src={post.image}
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
              By {post.author} • {post.date}
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

              <Typography
                variant="h5"
                component="h2"
                sx={{ mt: 4, mb: 2, fontWeight: "bold" }}
              >
                Key Takeaways
              </Typography>

              <Typography variant="body1" component="ul" sx={{ pl: 2 }}>
                <li>Important point about skincare routine</li>
                <li>How this relates to different skin types</li>
                <li>Product recommendations and tips</li>
                <li>Common mistakes to avoid</li>
              </Typography>
            </div>

            {/* Tags */}
            <Box mt={4}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {[
                  "skincare",
                  "beauty",
                  "tips",
                  post.category.toLowerCase(),
                ].map((tag) => (
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
                Related Posts
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {relatedPosts.length > 0 ? (
                relatedPosts.map((relatedPost) => (
                  <Box key={relatedPost.id} mb={2}>
                    <Link
                      to={`/blog/${relatedPost.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Box display="flex" gap={2}>
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          style={{
                            width: 80,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle2" color="text.primary">
                            {relatedPost.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {relatedPost.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Link>
                    {relatedPosts.indexOf(relatedPost) <
                      relatedPosts.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No related posts found.
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
