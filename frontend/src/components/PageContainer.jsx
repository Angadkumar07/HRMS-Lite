import { Box } from "@mui/material";

export default function PageContainer({ children }) {
  return (
    <Box
      className="page-enter"
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 5 },
        py: { xs: 3, md: 5 },
      }}
    >
      {children}
    </Box>
  );
}
