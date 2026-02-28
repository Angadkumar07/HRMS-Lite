import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import GroupIcon from "@mui/icons-material/Group";

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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
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
      setEmployees(data.data ?? []);
    } catch (err) {
      setListError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
      setSnackbar({ open: true, message: "Employee added successfully.", severity: "success" });
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
      setSnackbar({ open: true, message: "Employee deleted.", severity: "info" });
      fetchEmployees();
    } catch (err) {
      setSnackbar({ open: true, message: extractMessage(err), severity: "error" });
    }
  };

  return (
    <PageContainer>
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <GroupIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Employees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your team members
          </Typography>
        </Box>
        <Chip
          label={`${employees.length} Total`}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ ml: "auto" }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                <PersonAddAltIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Add Employee
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
                {formError && <Alert severity="error">{formError}</Alert>}
                <TextField
                  label="Employee ID"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  required
                />
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  required
                />
                <TextField
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  sx={{ mt: 0.5 }}
                >
                  {submitting ? "Adding…" : "Add Employee"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box px={3} pt={2.5} pb={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>
                  All Employees
                </Typography>
              </Box>

              <ErrorAlert message={listError} />

              {loading ? (
                <Loader />
              ) : employees.length === 0 ? (
                <EmptyState message="No employees yet. Add your first team member." />
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f4f6f8" }}>
                        <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employees.map((emp) => (
                        <TableRow
                          key={emp.employee_id}
                          hover
                          sx={{ "&:last-child td": { border: 0 } }}
                        >
                          <TableCell>
                            <Chip label={emp.employee_id} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{emp.full_name}</TableCell>
                          <TableCell sx={{ color: "text.secondary" }}>{emp.email}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Delete employee">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openConfirm(emp.employee_id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete Employee"
        message={`Are you sure you want to delete employee "${confirmDialog.employeeId}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ open: false, employeeId: null })}
      />

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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
