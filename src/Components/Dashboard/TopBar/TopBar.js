import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

const TopBar = ({ notifications }) => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "linear-gradient(to right, #007bff, #ff9800)", // Gradient from blue to orange, your brand colors
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
        {/* Left: Navigation Links */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button
            color="inherit"
            component={Link}
            to="/dashboard"
            sx={{ color: "white" }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/dashboard/expenses"
            sx={{ color: "white" }}
          >
            Expenses
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/dashboard/budget"
            sx={{ color: "white" }}
          >
            Budget
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/dashboard/employee"
            sx={{ color: "white" }}
          >
            Employee
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/dashboard/upcoming"
            sx={{ color: "white" }}
          >
            Up Coming Bills
          </Button>
        </Box>

        {/* Center: App Name */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, textAlign: "center", color: "white" }}
        >
          WOCD Expense Management
        </Typography>

        {/* Right: Notifications and Logout */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            onClick={handleNotificationsClick}
            sx={{ color: "white" }}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleNotificationsClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <List sx={{ minWidth: 280 }}>
              {notifications.map((notification, index) => (
                <ListItem key={index} button>
                  <ListItemText
                    primary={notification.message}
                    secondary={`Date: ${notification.date}`}
                  />
                </ListItem>
              ))}
            </List>
          </Popover>
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{
              backgroundColor: "transparent",
              color: "white",
              "&:hover": {
                backgroundColor: "#ffcccb", // Light red for hover, better visibility
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
