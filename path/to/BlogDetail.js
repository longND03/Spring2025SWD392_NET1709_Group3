import SubscribePopup from "../components/SubscribePopup";
import { Box, Typography } from "@mui/material";

<Box mt={4} p={3} bgcolor="#f8f0ff" borderRadius={2}>
  <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
    Subscribe to Our News
  </Typography>
  <Typography variant="body2" paragraph>
    Get the latest skincare tips and product recommendations.
  </Typography>
  <SubscribePopup buttonLabel="Subscribe" />
</Box>;
