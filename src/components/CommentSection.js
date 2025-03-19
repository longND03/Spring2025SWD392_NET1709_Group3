import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "../api/axios";

const CommentSection = ({ postId, comments: initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      // Chuẩn bị dữ liệu gửi đến API theo định dạng mới
      const commentData = {
        content: newComment,
        userId: user.id, // Sử dụng userId từ user đang đăng nhập
        postId: parseInt(postId), // Đảm bảo postId là số nguyên
      };

      console.log("Sending comment data:", commentData);

      // Gửi comment đến API
      const response = await axios.post("/api/comment", commentData, {
        headers: {
          "Content-Type": "application/json",
          // Authorization header sẽ được tự động thêm bởi axios interceptor nếu bạn đã cấu hình
        },
      });

      // Thêm comment mới vào danh sách hiện tại
      const addedComment = response.data;

      // Đảm bảo comment có username để hiển thị trong UI
      const displayComment = {
        ...addedComment,
        username: user.name || user.email || "Anonymous",
      };

      setComments([displayComment, ...comments]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (error) {
      console.error("Error posting comment:", error);

      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        // Server trả về lỗi với status code
        toast.error(
          `Failed to post comment: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        // Không nhận được response
        toast.error("Network error. Please check your connection.");
      } else {
        // Lỗi khác
        toast.error("Failed to post comment. Please try again.");
      }

      // Fallback nếu API lỗi - thêm comment vào UI nhưng không lưu vào database
      if (process.env.NODE_ENV === "development") {
        const tempComment = {
          id: Date.now(),
          content: newComment,
          username: user.name || user.email || "Anonymous",
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          postId: postId,
          userId: user.id,
        };
        setComments([tempComment, ...comments]);
        console.warn("Using fallback comment display in development mode");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm format date từ ISO string sang định dạng thân thiện với người dùng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Comments ({comments.length})
      </Typography>

      {/* Comment Form */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <form onSubmit={handleSubmitComment}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder={
              user ? "Write your comment..." : "Please login to comment"
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user || submitting}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!user || submitting}
            sx={{
              bgcolor: "#9C27B0",
              "&:hover": { bgcolor: "#7B1FA2" },
              "&:disabled": { bgcolor: "#E1BEE7" },
            }}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </Paper>

      {/* Comments List */}
      <Box sx={{ mt: 4 }}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Paper key={comment.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                <Avatar
                  alt={comment.username}
                  sx={{ bgcolor: generateAvatarColor(comment.username) }}
                >
                  {comment.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {comment.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(comment.createdDate)}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{comment.content}</Typography>
                </Box>
              </Box>
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Hàm tạo màu avatar dựa trên username
const generateAvatarColor = (username) => {
  const colors = [
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#ff9800",
    "#ff5722",
  ];

  // Tạo số từ chuỗi username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Chọn màu từ mảng colors
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default CommentSection;
