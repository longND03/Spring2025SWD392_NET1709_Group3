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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

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

  // Initialize TipTap editor for read-only content
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: post.content,
    editable: false,
  });

  // Generate excerpt from content
  const getExcerpt = () => {
    if (post.excerpt) return post.excerpt;

    // Remove HTML tags for plain text excerpt
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = post.content || "";
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    return textContent.length > 120
      ? textContent.substring(0, 120) + "..."
      : textContent;
  };

  // Get image URL with proper handling
  const getImageUrl = () => {
    // Check if post has imageUrls property and it's an array with content
    if (
      post.imageUrls &&
      Array.isArray(post.imageUrls) &&
      post.imageUrls.length > 0
    ) {
      const imageUrl = post.imageUrls[post.imageUrls.length - 1];

      // If it's already a complete URL (either http/https or data:image)
      if (imageUrl.startsWith("http") || imageUrl.startsWith("data:")) {
        return imageUrl;
      }

      // If it looks like base64 data without the prefix
      if (imageUrl.length > 100 && !imageUrl.startsWith("http")) {
        return `data:image/jpeg;base64,${imageUrl}`;
      }

      // Otherwise, return as is
      return imageUrl;
    }

    // Check if post has a single image property
    if (post.image) {
      if (post.image.startsWith("data:") || post.image.startsWith("http")) {
        return post.image;
      }

      if (post.image.length > 100 && !post.image.startsWith("http")) {
        return `data:image/jpeg;base64,${post.image}`;
      }

      return post.image;
    }

    // Default fallback image
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

        <div className="prose prose-sm max-w-none text-gray-600 mb-4">
          {getExcerpt()}
        </div>

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
