import { useCallback, useEffect, useState } from "react";
import {
  Alert,
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
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

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

export default function AttendancePage() {
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
      setSnackbar({ open: true, message: "Attendance marked successfully.", severity: "success" });
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

  const statusChip = (empId) => {
    const s = markedMap[empId];
    if (s === "Present")
      return <Chip icon={<CheckCircleOutlineIcon />} label="Present" size="small" color="success" variant="outlined" />;
    if (s === "Absent")
      return <Chip icon={<CancelOutlinedIcon />} label="Absent" size="small" color="error" variant="outlined" />;
    return <Chip icon={<RemoveCircleOutlineIcon />} label="Not Marked" size="small" color="default" variant="outlined" />;
  };

  return (
    <PageContainer>
      <Box display="flex" alignItems="center" gap={1.5} mb={4}>
        <EventAvailableIcon sx={{ fontSize: 32, color: "primary.main" }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mark and review daily attendance
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2.5}>
                Mark Attendance
              </Typography>

              <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
                {formError && <Alert severity="error">{formError}</Alert>}
                <ErrorAlert message={empError} />

                <FormControl size="small" fullWidth required disabled={empLoading}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={selectedEmployeeId}
                    label="Employee"
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp.employee_id} value={emp.employee_id}>
                        {emp.full_name} ({emp.employee_id})
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
                  required
                />

                <FormControl size="small" fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submitting || empLoading}
                  sx={{ mt: 0.5 }}
                >
                  {submitting ? "Saving…" : "Mark Attendance"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                px={3}
                pt={2.5}
                pb={1.5}
                display="flex"
                alignItems="center"
                flexWrap="wrap"
                gap={1.5}
              >
                <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
                  All Employees — Daily Summary
                </Typography>

                <TextField
                  type="date"
                  size="small"
                  label="View Date"
                  value={viewDate}
                  onChange={(e) => setViewDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 170 }}
                />
              </Box>

              <Box px={3} pb={1.5} display="flex" gap={1} flexWrap="wrap">
                <Chip
                  icon={<CheckCircleOutlineIcon />}
                  label={`Present: ${presentCount}`}
                  color="success"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<CancelOutlinedIcon />}
                  label={`Absent: ${absentCount}`}
                  color="error"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<RemoveCircleOutlineIcon />}
                  label={`Not Marked: ${notMarkedCount}`}
                  color="default"
                  size="small"
                  variant="outlined"
                />
              </Box>

              <ErrorAlert message={recordsError} />

              {recordsLoading || empLoading ? (
                <Loader />
              ) : employees.length === 0 ? (
                <EmptyState message="No employees found. Add employees first." />
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f4f6f8" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
                          <TableCell sx={{ color: "text.secondary" }}>
                            {emp.department}
                          </TableCell>
                          <TableCell>{statusChip(emp.employee_id)}</TableCell>
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
