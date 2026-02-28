import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

const NAV_LINKS = [
  { label: "Employees", path: "/employees" },
  { label: "Attendance", path: "/attendance" },
];

export default function MainLayout({ children }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navButtons = NAV_LINKS.map((link) => (
    <Button
      key={link.path}
      component={Link}
      to={link.path}
      sx={{
        color: "white",
        fontWeight: isActive(link.path) ? 700 : 400,
        borderBottom: isActive(link.path) ? "2px solid white" : "2px solid transparent",
        borderRadius: 0,
        px: 2,
        py: "18px",
        "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
      }}
    >
      {link.label}
    </Button>
  ));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "#1e2a3a" }}>
        <Toolbar>
          <PeopleAltIcon sx={{ mr: 1.5, fontSize: 26 }} />
          <Typography
            variant="h6"
            fontWeight={700}
            letterSpacing={0.5}
            sx={{ flexGrow: isMobile ? 1 : 0, mr: isMobile ? 0 : 4 }}
          >
            HRMS Lite
          </Typography>

          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
              >
                <List sx={{ width: 220, pt: 2 }}>
                  {NAV_LINKS.map((link) => (
                    <ListItem key={link.path} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={link.path}
                        selected={isActive(link.path)}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <ListItemText primary={link.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            </>
          ) : (
            <Box display="flex" gap={0}>
              {navButtons}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, backgroundColor: "#f4f6f8" }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          textAlign: "center",
          py: 2,
          backgroundColor: "#1e2a3a",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        <Typography variant="caption">HRMS Lite © {new Date().getFullYear()}</Typography>
      </Box>
    </Box>
  );
}
