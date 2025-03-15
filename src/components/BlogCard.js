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
  image={post.image || "/default-image.jpg"} 
  alt={post.title}
/>
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Box mb={1}>
          <Chip
            label={post.category}
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
          {post.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
  {post.excerpt || (post.description.length > 120 
    ? post.description.substring(0, 120) + "..." 
    : post.description)}
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
            {post.date}
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
