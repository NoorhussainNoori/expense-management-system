import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./../../firebaseConfig"; // Import Firebase Auth
import { useNavigate } from "react-router-dom"; // For navigation

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // React Router navigation

  // Handle Login Submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Please fill out all fields!");
      return;
    }

    setLoading(true); // Set loading state to true when submitting

    try {
      // Firebase Authentication login
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Sign-In Successful!");
      navigate("/dashboard"); // Redirect to dashboard after successful login
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false); // Reset loading state after login attempt (success or failure)
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent! Check your email.");
    } catch (error) {
      toast.error("Error sending password reset email. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 255, 0.9))`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 5,
            maxWidth: 400,
            backgroundColor: "transparent",
            borderRadius: "10px",
            boxShadow: "0px 4px 30px rgba(0, 0, 0, 0.9)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontFamily: "'Roboto Slab', serif",
              fontWeight: "bold",
              color: "#eee",
              mb: 3,
            }}
          >
            Sign In
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                marginBottom: 3,
                "& label.Mui-focused": { color: "#eee" },
                "& .MuiInput-underline:after": { borderBottomColor: "#eee" },
              }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                marginBottom: 3,
                "& label.Mui-focused": { color: "#eee" },
                "& .MuiInput-underline:after": { borderBottomColor: "#eee" },
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "dodgerblue",
                "&:hover": { backgroundColor: "#darkblue" },
                padding: 1.5,
                fontSize: "16px",
                color: "#fff",
              }}
              disabled={loading} // Disable the button when loading
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ color: "white", mr: 2 }} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <Button
            onClick={handleForgotPassword}
            sx={{
              color: "darkblue",
              marginTop: 2,
              textDecoration: "underline",
              display: "block",
              textAlign: "center",
            }}
          >
            Forgot password?
          </Button>
        </Paper>
      </Container>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Box>
  );
};

export default SignIn;
