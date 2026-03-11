import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import GroupIcon from "@mui/icons-material/Group";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DashboardIcon from "@mui/icons-material/Dashboard";

const NAV_LINKS = [
  { label: "Employees", path: "/employees", icon: <GroupIcon fontSize="small" /> },
  { label: "Attendance", path: "/attendance", icon: <EventAvailableIcon fontSize="small" /> },
];

export default function MainLayout({ children }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ─── Navbar ─── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: { xs: 60, md: 68 } }}>
          {/* Brand */}
          <Box display="flex" alignItems="center" gap={1.5} sx={{ flexGrow: isMobile ? 1 : 0 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
                boxShadow: "0 0 0 2px rgba(255,255,255,0.2)",
              }}
            >
              <DashboardIcon sx={{ fontSize: 18, color: "#fff" }} />
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                }}
              >
                HRMS Lite
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem", letterSpacing: "0.08em" }}
              >
                HR MANAGEMENT
              </Typography>
            </Box>
          </Box>

          {/* Desktop Nav */}
          {!isMobile && (
            <Box display="flex" gap={0.5} ml={5} flexGrow={1}>
              {NAV_LINKS.map((link) => (
                <Box
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    color: isActive(link.path) ? "#fff" : "rgba(255,255,255,0.65)",
                    fontWeight: isActive(link.path) ? 700 : 500,
                    fontSize: "0.875rem",
                    background: isActive(link.path)
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                    border: isActive(link.path)
                      ? "1px solid rgba(255,255,255,0.2)"
                      : "1px solid transparent",
                    backdropFilter: isActive(link.path) ? "blur(8px)" : "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#fff",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    },
                    textDecoration: "none",
                  }}
                >
                  {link.icon}
                  {link.label}
                </Box>
              ))}
            </Box>
          )}

          {/* Right badge */}
          {!isMobile && (
            <Chip
              label="v1.0"
              size="small"
              sx={{
                background: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            />
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                color: "#fff",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                width: 38,
                height: 38,
                "&:hover": { background: "rgba(255,255,255,0.18)" },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* ─── Mobile Drawer ─── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 260,
            background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)",
            border: "none",
            pt: 1,
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={2.5}
          py={1.5}
          mb={1}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
              }}
            >
              <DashboardIcon sx={{ fontSize: 16, color: "#fff" }} />
            </Avatar>
            <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "0.95rem" }}>
              HRMS Lite
            </Typography>
          </Box>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: "rgba(255,255,255,0.6)", p: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Divider */}
        <Box sx={{ height: 1, background: "rgba(255,255,255,0.1)", mx: 2, mb: 1.5 }} />

        {/* Nav Items */}
        <List sx={{ px: 1.5 }}>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={link.path}
                selected={isActive(link.path)}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  color: isActive(link.path) ? "#fff" : "rgba(255,255,255,0.65)",
                  background: isActive(link.path)
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                  border: isActive(link.path)
                    ? "1px solid rgba(255,255,255,0.2)"
                    : "1px solid transparent",
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                  },
                  "&.Mui-selected": {
                    background: "rgba(255,255,255,0.15)",
                    "&:hover": { background: "rgba(255,255,255,0.18)" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: "inherit", minWidth: 34 }}
                >
                  {link.icon}
                </ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontWeight: isActive(link.path) ? 700 : 500, fontSize: "0.9rem" }}
                />
                {isActive(link.path) && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#818cf8",
                      boxShadow: "0 0 6px #818cf8",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Footer in drawer */}
        <Box
          sx={{
            mt: "auto",
            mx: 2,
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>
            HRMS Lite © {new Date().getFullYear()}
          </Typography>
          <br />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem" }}>
            HR Management System
          </Typography>
        </Box>
      </Drawer>

      {/* ─── Page Body ─── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: "#f1f5f9",
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.08), transparent)",
        }}
      >
        {children}
      </Box>

      {/* ─── Footer ─── */}
      <Box
        component="footer"
        sx={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          py: { xs: 2, md: 2.5 },
          px: { xs: 2, md: 4 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
          © {new Date().getFullYear()} HRMS Lite — HR Management System
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.68rem" }}>
          Built with React & FastAPI
        </Typography>
      </Box>
    </Box>
  );
}
