import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyTrendChart = ({ data }) => {
  // Dynamic gradient-based blue color scheme for bars
  const gradientColors = [
    "rgba(0, 123, 255, 0.8)", // Blue
    "rgba(0, 153, 255, 0.8)", // Slightly lighter
    "rgba(0, 174, 255, 0.8)", // Slightly lighter
    "rgba(0, 196, 255, 0.8)", // Lighter blue
    "rgba(51, 204, 255, 0.8)", // Cyan
    "rgba(102, 224, 255, 0.8)", // Lighter cyan
    "rgba(153, 235, 255, 0.8)", // Very light blue
  ];

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Spending",
        data,
        backgroundColor: gradientColors,
        hoverBackgroundColor: gradientColors.map(
          (color) => color.replace("0.8", "1.0") // Brighten on hover
        ),
        borderColor: "rgba(0, 123, 255, 0.2)", // Subtle border
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `Spending: $${context.raw.toLocaleString()}`,
        },
        backgroundColor: "rgba(0,0,0,0.8)", // Dark tooltip background
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
      },
      legend: {
        display: false, // Hide legend for simplicity
      },
    },
    scales: {
      x: {
        grid: {
          drawBorder: false,
          color: "#f0f0f0", // Light gridlines
        },
        ticks: {
          font: {
            size: 12,
            family: "'Roboto', sans-serif",
          },
          color: "#666",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: "#f0f0f0",
        },
        ticks: {
          font: {
            size: 12,
            family: "'Roboto', sans-serif",
          },
          color: "#666",
        },
        title: {
          display: true,
          text: "Amount ($)",
          font: {
            size: 14,
            weight: "bold",
            family: "'Roboto', sans-serif",
          },
          color: "#555",
        },
      },
    },
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
  };

  return (
    <Card
      sx={{
        border: "1px solid #ddd",
        borderRadius: 4,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontFamily: "'Roboto', sans-serif",
            color: "#007bff",
            mb: 3,
          }}
        >
          Weekly Spending Trend
        </Typography>
        <Box
          sx={{
            height: "400px", // Chart container height
          }}
        >
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default WeeklyTrendChart;
