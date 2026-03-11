import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

export default function EmptyState({ message = "No data found.", icon: Icon = InboxIcon }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={10}
      gap={2}
      sx={{ opacity: 0.7 }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ede9fe, #e0e7ff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 36, color: "#6366f1" }} />
      </Box>
      <Box textAlign="center">
        <Typography variant="body1" fontWeight={600} color="text.primary" mb={0.25}>
          Nothing here yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Box>
  );
}
