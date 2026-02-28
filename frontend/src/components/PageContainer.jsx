import { Box } from "@mui/material";

export default function PageContainer({ children }) {
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
      {children}
    </Box>
  );
}
