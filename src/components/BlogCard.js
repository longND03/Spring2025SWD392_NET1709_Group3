import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const BlogCard = ({ post }) => {
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate excerpt from content or description
  const getExcerpt = () => {
    if (post.excerpt) return post.excerpt;
    if (post.description && post.description.length > 0) {
      return post.description.length > 120
        ? post.description.substring(0, 120) + "..."
        : post.description;
    }
    if (post.content && post.content.length > 0) {
      return post.content.length > 120
        ? post.content.substring(0, 120) + "..."
        : post.content;
    }
    return "Read more about this article...";
  };

  // Get image URL function
  const getImageUrl = () => {
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

  // Default category if missing
  const category = post.category || "General";

  // Display date from publishedDate or createdDate or fallback to current date
  const displayDate =
    post.publishedDate ||
    post.createdDate ||
    post.date ||
    new Date().toISOString();

  return (
    <Card
      className="h-full flex flex-col transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
      sx={{
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={getImageUrl()}
        alt={post.title || "Blog post"}
        sx={{ height: 200 }}
      />
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Box mb={1}>
          <Chip
            label={category}
            size="small"
            sx={{
              bgcolor: "#9C27B0",
              color: "white",
              fontSize: "0.7rem",
              height: "24px",
            }}
          />
        </Box>

        <Typography
          gutterBottom
          variant="h6"
          component="h2"
          sx={{
            fontWeight: "bold",
            mb: 1,
            lineHeight: 1.3,
          }}
        >
          {post.title || "Untitled Post"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {getExcerpt()}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {formatDate(displayDate)}
          </Typography>

          <Link to={`/blog/${post.id}`} style={{ textDecoration: "none" }}>
            <Button
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: "#9C27B0",
                "&:hover": {
                  bgcolor: "rgba(156, 39, 176, 0.08)",
                },
              }}
            >
              Read More
            </Button>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
