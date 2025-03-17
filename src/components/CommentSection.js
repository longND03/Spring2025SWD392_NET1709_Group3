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

const CommentSection = ({ postId, comments: initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const comment = {
      id: Date.now(),
      text: newComment,
      author: user.name || user.email,
      avatar: user.avatar || "https://via.placeholder.com/40",
      date: new Date().toLocaleDateString(),
      postId: postId,
    };

    setComments([...comments, comment]);
    setNewComment("");
    toast.success("Comment posted successfully!");
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
            disabled={!user}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!user}
            sx={{
              bgcolor: "#9C27B0",
              "&:hover": { bgcolor: "#7B1FA2" },
              "&:disabled": { bgcolor: "#E1BEE7" },
            }}
          >
            Post Comment
          </Button>
        </form>
      </Paper>

      {/* Comments List */}
      <Box sx={{ mt: 4 }}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Paper key={comment.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                <Avatar src={comment.avatar} alt={comment.author} />
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
                      {comment.author}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {comment.date}
                    </Typography>
                  </Box>
                  <Typography variant="body2">{comment.text}</Typography>
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

export default CommentSection;
