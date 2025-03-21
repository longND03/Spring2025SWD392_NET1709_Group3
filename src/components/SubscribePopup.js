import React, { useState } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  CircularProgress,
  Grow,
  Zoom,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import axios from "../api/axios";
import { motion } from "framer-motion";

const SubscribePopup = ({
  buttonLabel = "Subscribe",
  buttonClassName = "",
}) => {
  // State for managing the form and dialog
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: "",
    message: "",
    isSuccess: true,
  });

  // Validate email format
  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle newsletter subscription
  const handleSubscribe = async () => {
    // Clear previous errors
    setEmailError("");

    // Check if email is provided
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setSubscribeLoading(true);

    try {
      // Here you would call your API endpoint to save the email
      // For demo, we'll simulate an API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 800));

      // If we have a real API endpoint, use it
      // await axios.post('/api/newsletter/subscribe', { email });

      // Show success dialog
      setDialogConfig({
        title: "Subscription Successful!",
        message:
          "Thank you for subscribing to our newsletter. You'll receive the latest skincare tips and product recommendations straight to your inbox.",
        isSuccess: true,
      });
      setOpenDialog(true);
      setEmail(""); // Clear email field after successful submission
    } catch (error) {
      console.error("Subscription error:", error);

      // Show error dialog
      setDialogConfig({
        title: "Subscription Failed",
        message:
          "We couldn't process your subscription at this time. Please try again later.",
        isSuccess: false,
      });
      setOpenDialog(true);
    } finally {
      setSubscribeLoading(false);
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      {/* Newsletter Signup Form with Animation */}
      <Box
        className={`subscribe-form ${buttonClassName}`}
        sx={{
          position: "relative",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
          },
          borderRadius: 2,
          overflow: "hidden",
        }}
        component={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TextField
          fullWidth
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError}
          helperText={emailError}
          margin="dense"
          size="small"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              transition: "all 0.3s ease",
              "& fieldset": {
                borderColor: "#e1bee7",
                borderWidth: "1.5px",
              },
              "&:hover fieldset": {
                borderColor: "#ce93d8",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#9c27b0",
              },
            },
            "& .MuiInputBase-input": {
              padding: "12px 14px",
              "&::placeholder": {
                color: "#9e9e9e",
                opacity: 0.8,
              },
            },
            "& .MuiFormHelperText-root": {
              background: "rgba(255, 255, 255, 0.8)",
              margin: 0,
              padding: "4px 8px",
              borderRadius: "0 0 8px 8px",
            },
          }}
          InputProps={{
            endAdornment: (
              <MailOutlineIcon
                sx={{
                  color: "#9c27b0",
                  opacity: 0.7,
                  mr: 1,
                }}
              />
            ),
          }}
        />
        <Button
          fullWidth
          variant="contained"
          disabled={subscribeLoading}
          onClick={handleSubscribe}
          sx={{
            py: 1.2,
            background: "linear-gradient(45deg, #9c27b0 30%, #ce93d8 90%)",
            boxShadow: "0 4px 10px rgba(156, 39, 176, 0.3)",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.5px",
            transition: "all 0.3s ease",
            position: "relative",
            "&:hover": {
              background: "linear-gradient(45deg, #7b1fa2 30%, #ba68c8 90%)",
              boxShadow: "0 6px 15px rgba(156, 39, 176, 0.4)",
              transform: "translateY(-2px)",
            },
          }}
          component={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {subscribeLoading ? "Subscribing..." : buttonLabel}
          {subscribeLoading && (
            <CircularProgress
              size={24}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
                color: "white",
              }}
            />
          )}
        </Button>
      </Box>

      {/* Subscription Dialog with Animation */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        TransitionComponent={Grow}
        PaperProps={{
          sx: {
            borderTop: "4px solid",
            borderColor: dialogConfig.isSuccess ? "#4caf50" : "#f44336",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            overflow: "hidden",
            background: "linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)",
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            pt: 3,
            pb: 2,
            background: dialogConfig.isSuccess
              ? "linear-gradient(120deg, rgba(76, 175, 80, 0.1) 0%, rgba(165, 214, 167, 0.1) 100%)"
              : "linear-gradient(120deg, rgba(244, 67, 54, 0.1) 0%, rgba(239, 154, 154, 0.1) 100%)",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            component={motion.div}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Zoom in={true} style={{ transitionDelay: "150ms" }}>
              <Box>
                {dialogConfig.isSuccess ? (
                  <CheckCircleIcon
                    sx={{
                      color: "#4caf50",
                      fontSize: 32,
                      filter: "drop-shadow(0 2px 4px rgba(76, 175, 80, 0.4))",
                    }}
                  />
                ) : (
                  <ErrorIcon
                    sx={{
                      color: "#f44336",
                      fontSize: 32,
                      filter: "drop-shadow(0 2px 4px rgba(244, 67, 54, 0.4))",
                    }}
                  />
                )}
              </Box>
            </Zoom>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: dialogConfig.isSuccess ? "#2e7d32" : "#c62828",
              }}
            >
              {dialogConfig.title}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 4 }}>
          <DialogContentText
            id="alert-dialog-description"
            sx={{
              color: "#424242",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
            component={motion.p}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {dialogConfig.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 3, pr: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              px: 3,
              py: 1,
              borderRadius: "8px",
              background: dialogConfig.isSuccess
                ? "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)"
                : "linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)",
              boxShadow: dialogConfig.isSuccess
                ? "0 4px 10px rgba(76, 175, 80, 0.3)"
                : "0 4px 10px rgba(156, 39, 176, 0.3)",
              textTransform: "none",
              fontWeight: 600,
              transition: "all 0.3s ease",
              "&:hover": {
                background: dialogConfig.isSuccess
                  ? "linear-gradient(45deg, #1b5e20 30%, #388e3c 90%)"
                  : "linear-gradient(45deg, #7b1fa2 30%, #ab47bc 90%)",
                boxShadow: dialogConfig.isSuccess
                  ? "0 6px 14px rgba(76, 175, 80, 0.4)"
                  : "0 6px 14px rgba(156, 39, 176, 0.4)",
                transform: "translateY(-2px)",
              },
            }}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {dialogConfig.isSuccess ? "Great!" : "OK"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SubscribePopup;
