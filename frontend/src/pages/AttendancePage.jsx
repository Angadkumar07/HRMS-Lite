import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  LinearProgress,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TodayIcon from "@mui/icons-material/Today";
import GroupIcon from "@mui/icons-material/Group";

import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import PageContainer from "../components/PageContainer";

function extractMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    "Something went wrong. Please try again."
  );
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// Deterministic avatar color
function avatarColor(str = "") {
  const colors = [
    ["#ede9fe", "#7c3aed"],
    ["#dbeafe", "#1d4ed8"],
    ["#dcfce7", "#15803d"],
    ["#fce7f3", "#be185d"],
    ["#ffedd5", "#c2410c"],
    ["#cffafe", "#0e7490"],
    ["#fef9c3", "#854d0e"],
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function EmployeeAvatar({ name }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const [bg, fg] = avatarColor(name);
  return (
    <Avatar sx={{ width: 34, height: 34, fontSize: "0.75rem", fontWeight: 700, background: bg, color: fg, border: `2px solid ${bg}` }}>
      {initials}
    </Avatar>
  );
}

function StatCard({ icon: Icon, label, value, total, gradient, chipColor }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Card
      className="stat-card"
      sx={{
        borderRadius: 3,
        border: "none",
        background: gradient,
        overflow: "hidden",
        position: "relative",
        cursor: "default",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -18,
          right: -18,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.75)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontSize: "0.67rem",
              }}
            >
              {label}
            </Typography>
            <Box display="flex" alignItems="baseline" gap={0.75}>
              <Typography variant="h4" sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.1, mt: 0.25 }}>
                {value}
              </Typography>
              {total > 0 && (
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
                  / {total}
                </Typography>
              )}
            </Box>
          </Box>
          <Avatar sx={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)" }}>
            <Icon sx={{ fontSize: 20, color: "#fff" }} />
          </Avatar>
        </Box>
        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 4,
            borderRadius: 99,
            background: "rgba(255,255,255,0.2)",
            "& .MuiLinearProgress-bar": {
              background: "rgba(255,255,255,0.8)",
              borderRadius: 99,
            },
          }}
        />
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.68rem", mt: 0.5, display: "block" }}>
          {pct}% of team
        </Typography>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }) {
  if (status === "Present")
    return (
      <Chip
        icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
        label="Present"
        size="small"
        sx={{
          background: "#dcfce7",
          color: "#15803d",
          border: "1px solid #bbf7d0",
          fontWeight: 700,
          fontSize: "0.72rem",
          "& .MuiChip-icon": { color: "#15803d" },
        }}
      />
    );
  if (status === "Absent")
    return (
      <Chip
        icon={<CancelIcon sx={{ fontSize: "14px !important" }} />}
        label="Absent"
        size="small"
        sx={{
          background: "#fee2e2",
          color: "#dc2626",
          border: "1px solid #fecaca",
          fontWeight: 700,
          fontSize: "0.72rem",
          "& .MuiChip-icon": { color: "#dc2626" },
        }}
      />
    );
  return (
    <Chip
      icon={<HelpOutlineIcon sx={{ fontSize: "14px !important" }} />}
      label="Not Marked"
      size="small"
      sx={{
        background: "#f8fafc",
        color: "#94a3b8",
        border: "1px solid #e2e8f0",
        fontWeight: 600,
        fontSize: "0.72rem",
        "& .MuiChip-icon": { color: "#94a3b8" },
      }}
    />
  );
}

export default function AttendancePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState("");

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [formDate, setFormDate] = useState(todayString());
  const [status, setStatus] = useState("Present");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [viewDate, setViewDate] = useState(todayString());
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    (async () => {
      setEmpLoading(true);
      try {
        const { data } = await api.get("/api/employees");
        setEmployees(data.data ?? []);
      } catch (err) {
        setEmpError(extractMessage(err));
      } finally {
        setEmpLoading(false);
      }
    })();
  }, []);

  const fetchRecordsByDate = useCallback(async (date) => {
    setRecordsLoading(true);
    setRecordsError("");
    setRecords([]);
    try {
      const { data } = await api.get("/api/attendance/daily", { params: { date } });
      setRecords(data.data ?? []);
    } catch (err) {
      setRecordsError(extractMessage(err));
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordsByDate(viewDate);
  }, [viewDate, fetchRecordsByDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setFormError("Please select an employee.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/attendance", {
        employee_id: selectedEmployeeId,
        date: formDate,
        status,
      });
      setSnackbar({ open: true, message: "Attendance marked successfully!", severity: "success" });
      if (formDate === viewDate) fetchRecordsByDate(viewDate);
    } catch (err) {
      setFormError(extractMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const markedMap = Object.fromEntries(records.map((r) => [r.employee_id, r.status]));
  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const notMarkedCount = employees.length - records.length;
  const total = employees.length;

  return (
    <PageContainer>
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={0.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(14,165,233,0.4)",
              flexShrink: 0,
            }}
          >
            <EventAvailableIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary" lineHeight={1.2}>
              Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mark and review daily attendance — {formatDate(viewDate)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── Stat Cards ─── */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={CheckCircleIcon}
            label="Present Today"
            value={presentCount}
            total={total}
            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={CancelIcon}
            label="Absent Today"
            value={absentCount}
            total={total}
            gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={HelpOutlineIcon}
            label="Not Marked"
            value={notMarkedCount}
            total={total}
            gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
          />
        </Grid>
      </Grid>

      {/* ─── Main Content ─── */}
      <Grid container spacing={3}>
        {/* ─── Mark Attendance Form ─── */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EventAvailableIcon sx={{ fontSize: 18, color: "#0284c7" }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
                    Mark Attendance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Select employee and date
                  </Typography>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
                {formError && (
                  <Alert
                    severity="error"
                    sx={{ borderRadius: 2, fontSize: "0.8rem", py: 0.5 }}
                    onClose={() => setFormError("")}
                  >
                    {formError}
                  </Alert>
                )}
                <ErrorAlert message={empError} />

                <FormControl size="small" fullWidth required disabled={empLoading}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={selectedEmployeeId}
                    label="Employee"
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    MenuProps={{ PaperProps: { sx: { borderRadius: 2, mt: 0.5 } } }}
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp.employee_id} value={emp.employee_id}>
                        <Box display="flex" alignItems="center" gap={1.25}>
                          <EmployeeAvatar name={emp.full_name} />
                          <Box>
                            <Typography variant="body2" fontWeight={600} lineHeight={1.1}>
                              {emp.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {emp.employee_id} · {emp.department}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Date"
                  type="date"
                  size="small"
                  fullWidth
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <TodayIcon sx={{ fontSize: 16, color: "text.disabled", mr: 0.5 }} />
                    ),
                  }}
                  required
                />

                <FormControl size="small" fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="Present">
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "#10b981" }} />
                        <Typography variant="body2" fontWeight={600}>Present</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="Absent">
                      <Box display="flex" alignItems="center" gap={1}>
                        <CancelIcon sx={{ fontSize: 16, color: "#ef4444" }} />
                        <Typography variant="body2" fontWeight={600}>Absent</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting || empLoading}
                  sx={{
                    mt: 0.5,
                    py: 1.25,
                    background:
                      status === "Present"
                        ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                        : "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
                    boxShadow:
                      status === "Present"
                        ? "0 4px 12px rgba(16,185,129,0.4)"
                        : "0 4px 12px rgba(239,68,68,0.35)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow:
                        status === "Present"
                          ? "0 6px 20px rgba(16,185,129,0.5)"
                          : "0 6px 20px rgba(239,68,68,0.5)",
                    },
                    "&:disabled": { opacity: 0.7 },
                  }}
                >
                  {submitting ? "Saving…" : `Mark as ${status}`}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Daily Summary Table ─── */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {/* Header */}
            <Box
              sx={{
                px: { xs: 2.5, sm: 3 },
                pt: 2.5,
                pb: 2,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <Box flexGrow={1}>
                <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
                  Daily Summary
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All employees · {formatDate(viewDate)}
                </Typography>
              </Box>

              <TextField
                type="date"
                size="small"
                label="View Date"
                value={viewDate}
                onChange={(e) => setViewDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: { xs: "100%", sm: 185 } }}
                InputProps={{
                  startAdornment: (
                    <TodayIcon sx={{ fontSize: 16, color: "text.disabled", mr: 0.5 }} />
                  ),
                }}
              />
            </Box>

            <ErrorAlert message={recordsError} />

            {recordsLoading || empLoading ? (
              <Loader message="Loading attendance…" />
            ) : employees.length === 0 ? (
              <EmptyState
                message="No employees found. Add employees first to track attendance."
                icon={GroupIcon}
              />
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ overflow: "auto" }}>
                <Table size={isMobile ? "small" : "medium"} sx={{ minWidth: 420 }}>
                  <TableHead>
                    <TableRow sx={{ background: "#f8fafc" }}>
                      <TableCell>Employee</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Department</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((emp, idx) => {
                      const s = markedMap[emp.employee_id];
                      return (
                        <TableRow
                          key={emp.employee_id}
                          className="table-row-enter"
                          sx={{
                            animationDelay: `${idx * 0.04}s`,
                            "&:last-child td": { border: 0 },
                            "&:hover": { background: "#f8faff" },
                            background: s === "Present"
                              ? "rgba(16,185,129,0.02)"
                              : s === "Absent"
                              ? "rgba(239,68,68,0.02)"
                              : "transparent",
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <EmployeeAvatar name={emp.full_name} />
                              <Box>
                                <Typography variant="body2" fontWeight={600} color="text.primary" lineHeight={1.2}>
                                  {emp.full_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                                  {emp.employee_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                            <Chip
                              label={emp.department}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                background: "#ede9fe",
                                color: "#6d28d9",
                                fontWeight: 600,
                                border: "none",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <StatusChip status={s} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* ─── Snackbar ─── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          sx={{ width: "100%", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
