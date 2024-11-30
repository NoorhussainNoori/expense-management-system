import React from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
} from "@mui/material";

const BudgetTracking = ({ budget, spent }) => {
  const percentageSpent = Math.min((spent / budget) * 100, 100); // Capping at 100%

  // Dynamic color based on percentage spent (Blue for low, Orange for high)
  const getProgressColor = (percentage) => {
    if (percentage <= 50) return "#007bff"; // Blue
    if (percentage <= 75) return "#ff9800"; // Light Orange
    return "#ff5722"; // Dark Orange
  };

  const progressColor = getProgressColor(percentageSpent);

  return (
    <Card
      sx={{
        border: "1px solid #ddd",
        borderRadius: 4,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
        },
        p: 2,
      }}
    >
      <CardContent>
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontFamily: "'Roboto', sans-serif",
            mb: 2,
            color: "#333",
          }}
        >
          Budget Tracking
        </Typography>

        {/* Budget and Spent Display */}
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontFamily: "'Roboto', sans-serif",
            mb: 1,
            color: "#007bff",
          }}
        >
          ${spent.toLocaleString()} of ${budget.toLocaleString()}
        </Typography>

        {/* Percentage Spent Display */}
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "#666",
            mb: 2,
          }}
        >
          {percentageSpent.toFixed(1)}% spent
        </Typography>

        {/* Progress Bar */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            my: 2,
            backgroundColor: "#f0f0f0",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <LinearProgress
            variant="determinate"
            value={percentageSpent}
            sx={{
              height: 16,
              borderRadius: "10px",
              backgroundColor: "#f0f0f0",
              "& .MuiLinearProgress-bar": {
                background: progressColor,
              },
            }}
          />
          {/* Label inside the progress bar */}
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: "bold",
              fontFamily: "'Roboto', sans-serif",
              color: percentageSpent > 50 ? "#fff" : "#000",
              width: "100%",
              textAlign: "center",
              lineHeight: "16px",
            }}
          >
            {percentageSpent.toFixed(1)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetTracking;
