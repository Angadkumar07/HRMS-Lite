import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import GroupIcon from "@mui/icons-material/Group";
import BadgeIcon from "@mui/icons-material/Badge";
import SearchIcon from "@mui/icons-material/Search";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";

import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ErrorAlert from "../components/ErrorAlert";
import PageContainer from "../components/PageContainer";
import ConfirmDialog from "../components/ConfirmDialog";

const EMPTY_FORM = {
  employee_id: "",
  full_name: "",
  email: "",
  department: "",
};

function extractMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    "Something went wrong. Please try again."
  );
}

// Deterministic avatar color from a string
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
    <Avatar
      sx={{
        width: 36,
        height: 36,
        fontSize: "0.8rem",
        fontWeight: 700,
        background: bg,
        color: fg,
        border: `2px solid ${bg}`,
      }}
    >
      {initials}
    </Avatar>
  );
}

function StatCard({ icon: Icon, label, value, gradient, iconBg }) {
  return (
    <Card
      className="stat-card"
      sx={{
        background: gradient,
        border: "none",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        cursor: "default",
      }}
    >
      {/* decorative blob */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
        }}
      />
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.75)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontSize: "0.68rem",
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{ color: "#fff", fontWeight: 800, lineHeight: 1.1, mt: 0.25 }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 46,
              height: 46,
              background: iconBg,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Icon sx={{ fontSize: 22, color: "#fff" }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function EmployeesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, employeeId: null });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const { data } = await api.get("/api/employees");
      const list = data.data ?? [];
      setEmployees(list);
      setFiltered(list);
    } catch (err) {
      setListError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? employees.filter(
            (e) =>
              e.full_name.toLowerCase().includes(q) ||
              e.employee_id.toLowerCase().includes(q) ||
              e.email.toLowerCase().includes(q) ||
              e.department.toLowerCase().includes(q)
          )
        : employees
    );
  }, [search, employees]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { employee_id, full_name, email, department } = form;
    if (!employee_id || !full_name || !email || !department) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/employees", form);
      setForm(EMPTY_FORM);
      setSnackbar({ open: true, message: "Employee added successfully!", severity: "success" });
      fetchEmployees();
    } catch (err) {
      setFormError(extractMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirm = (employeeId) => {
    setConfirmDialog({ open: true, employeeId });
  };

  const handleDelete = async () => {
    const { employeeId } = confirmDialog;
    setConfirmDialog({ open: false, employeeId: null });
    try {
      await api.delete(`/api/employees/${employeeId}`);
      setSnackbar({ open: true, message: "Employee removed.", severity: "info" });
      fetchEmployees();
    } catch (err) {
      setSnackbar({ open: true, message: extractMessage(err), severity: "error" });
    }
  };

  const depts = [...new Set(employees.map((e) => e.department))].length;

  return (
    <PageContainer>
      {/* ─── Page Header ─── */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={0.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #6366f1, #818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              flexShrink: 0,
            }}
          >
            <GroupIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary" lineHeight={1.2}>
              Employees
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your team members and organizational structure
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ─── Stat Cards ─── */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={GroupIcon}
            label="Total Employees"
            value={employees.length}
            gradient="linear-gradient(135deg, #6366f1 0%, #818cf8 100%)"
            iconBg="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={BusinessIcon}
            label="Departments"
            value={depts}
            gradient="linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)"
            iconBg="rgba(255,255,255,0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={BadgeIcon}
            label="Active Members"
            value={employees.length}
            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
            iconBg="rgba(255,255,255,0.2)"
          />
        </Grid>
      </Grid>

      {/* ─── Main Content ─── */}
      <Grid container spacing={3}>
        {/* ─── Add Employee Form ─── */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonAddAltIcon sx={{ fontSize: 18, color: "#6366f1" }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
                    Add Employee
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Fill in the details below
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

                <TextField
                  label="Employee ID"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  required
                  placeholder="e.g. EMP001"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  required
                  placeholder="e.g. Angad Kumar"
                />
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  required
                  placeholder="e.g. angad@company.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  required
                  placeholder="e.g. Engineering"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  sx={{
                    mt: 0.5,
                    py: 1.25,
                    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                      boxShadow: "0 6px 20px rgba(99,102,241,0.5)",
                    },
                    "&:disabled": { opacity: 0.7 },
                  }}
                >
                  {submitting ? "Adding…" : "Add Employee"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── Employees Table ─── */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {/* Table Header */}
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
                  All Employees
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filtered.length} of {employees.length} members
                </Typography>
              </Box>

              {/* Search */}
              <TextField
                placeholder="Search…"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: { xs: "100%", sm: 200 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 17, color: "text.disabled" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <ErrorAlert message={listError} />

            {loading ? (
              <Loader message="Loading employees…" />
            ) : employees.length === 0 ? (
              <EmptyState
                message="No employees yet. Add your first team member using the form."
                icon={GroupIcon}
              />
            ) : filtered.length === 0 ? (
              <EmptyState message={`No results for "${search}"`} icon={SearchIcon} />
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ overflow: "auto" }}>
                <Table size={isMobile ? "small" : "medium"} sx={{ minWidth: 480 }}>
                  <TableHead>
                    <TableRow sx={{ background: "#f8fafc" }}>
                      <TableCell>Employee</TableCell>
                      <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Email</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((emp, idx) => (
                      <TableRow
                        key={emp.employee_id}
                        hover
                        className="table-row-enter"
                        sx={{
                          animationDelay: `${idx * 0.04}s`,
                          "&:last-child td": { border: 0 },
                          "&:hover": { background: "#f8faff" },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <EmployeeAvatar name={emp.full_name} />
                            <Box>
                              <Typography variant="body2" fontWeight={600} color="text.primary" lineHeight={1.2}>
                                {emp.full_name}
                              </Typography>
                              <Chip
                                label={emp.employee_id}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.65rem",
                                  height: 18,
                                  borderColor: "#e0e7ff",
                                  color: "#6366f1",
                                  fontWeight: 700,
                                  mt: 0.25,
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, color: "text.secondary", fontSize: "0.82rem" }}>
                          {emp.email}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={emp.department}
                            size="small"
                            sx={{
                              fontSize: "0.72rem",
                              background: "#ede9fe",
                              color: "#6d28d9",
                              fontWeight: 600,
                              border: "none",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Delete employee" placement="left">
                            <IconButton
                              size="small"
                              onClick={() => openConfirm(emp.employee_id)}
                              sx={{
                                color: "#ef4444",
                                background: "#fff1f2",
                                border: "1px solid #fecdd3",
                                width: 32,
                                height: 32,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  background: "#ef4444",
                                  color: "#fff",
                                  borderColor: "#ef4444",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* ─── Confirm Dialog ─── */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete Employee"
        message={`Are you sure you want to permanently remove employee "${confirmDialog.employeeId}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ open: false, employeeId: null })}
      />

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
