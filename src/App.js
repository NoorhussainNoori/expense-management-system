import React from "react";
import { Outlet  } from "react-router-dom"; // Import useLocation to get current route
import { Box, createTheme, ThemeProvider } from "@mui/material";
import "@fontsource/poppins";
import { AuthProvider } from "./Components/Contexts/authContext/authContext";

const App = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#007bff", // A shade of blue
      },
      secondary: {
        main: "#ff9800", // A shade of orange
      },
      background: {
        default: "#f4f6f8",
        paper: "#ffffff",
      },
    },
    typography: {
      fontFamily: "Arial, sans-serif",
      h6: {
        fontSize: "1rem",
        fontWeight: 600,
      },
    },
  });

  // Conditionally hide the Navbar and Footer if on the Dashboard

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {/* Only show the Navbar if not on Dashboard */}
        <Box>
          <Outlet />
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
