import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loader({ message = "" }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      py={8}
      gap={2}
    >
      <Box sx={{ position: "relative", width: 48, height: 48 }}>
        <CircularProgress
          size={48}
          thickness={3}
          sx={{
            color: "#6366f1",
            "& circle": { strokeLinecap: "round" },
          }}
        />
      </Box>
      {message && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {message}
        </Typography>
      )}
    </Box>
  );
}
