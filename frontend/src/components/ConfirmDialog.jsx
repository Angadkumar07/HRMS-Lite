import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pt: 3, px: 3.5, pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberRoundedIcon sx={{ color: "#d97706", fontSize: 22 }} />
          </Box>
          <Box
            component="span"
            sx={{ fontSize: "1rem", fontWeight: 700, color: "text.primary", lineHeight: 1.3 }}
          >
            {title}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, pt: 1 }}>
        <DialogContentText sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3.5, pb: 3, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{ flex: 1, color: "text.secondary", borderColor: "divider" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            flex: 1,
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
            "&:hover": { boxShadow: "0 6px 18px rgba(239,68,68,0.5)" },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
