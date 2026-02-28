import { Box, CircularProgress } from "@mui/material";

export default function Loader() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={6}>
      <CircularProgress size={36} />
    </Box>
  );
}
