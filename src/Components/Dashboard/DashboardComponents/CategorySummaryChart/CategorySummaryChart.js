import React from "react";
import { Bar } from "react-chartjs-2";
import { Box, Typography } from "@mui/material";

const CategorySummaryChart = ({ categories }) => {
  // Dynamically generate gradient colors between blue and orange
  const generateGradientColors = (count) => {
    const colors = [];
    const startHue = 220; // Blue
    const endHue = 40; // Orange
    for (let i = 0; i < count; i++) {
      const hue = startHue + ((endHue - startHue) * i) / count; // Gradual transition
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  };

  const gradientColors = generateGradientColors(categories.length);

  const chartData = {
    labels: categories.map((cat) => cat.name), // Category names
    datasets: [
      {
        label: "Expenses by Category",
        data: categories.map((cat) => cat.amount), // Amounts per category
        backgroundColor: gradientColors,
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1.5, // Subtle border for bars
        hoverBackgroundColor: gradientColors.map(
          (color) => color.replace("50%", "60%") // Slightly brighter on hover
        ),
        hoverBorderColor: "rgba(0, 0, 0, 0.3)", // Slightly darker border on hover
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Adjusts the chart size to fit the container
    indexAxis: "y", // Horizontal bar chart
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount (ف)",
          font: {
            size: 14,
            weight: "bold",
            family: "'Roboto', sans-serif",
          },
          color: "#555",
        },
        grid: {
          drawBorder: false,
          color: "#e0e0e0", // Light gridlines
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
        title: {
          display: true,
          text: "Categories",
          font: {
            size: 14,
            weight: "bold",
            family: "'Roboto', sans-serif",
          },
          color: "#555",
        },
        grid: {
          drawBorder: false, // No border for the grid
        },
        ticks: {
          font: {
            size: 12,
            family: "'Roboto', sans-serif",
          },
          color: "#666",
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `Amount: ${context.raw.toLocaleString()} ف`,
        },
        backgroundColor: "rgba(0,0,0,0.9)", // Darker tooltip background
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        padding: 10, // Add padding for better visibility
      },
      legend: {
        display: false, // Hide legend for simplicity
      },
    },
    animation: {
      duration: 800, // Smooth animation for bar appearance
      easing: "easeOutQuart",
    },
  };

  return (
    <Box
      sx={{
        padding: 3,
        border: "1px solid #ddd",
        borderRadius: 4,
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          textAlign: "center",
          fontWeight: "bold",
          fontFamily: "'Roboto', sans-serif",
          color: "#333",
        }}
      >
        Expenses by Category
      </Typography>
      <Box
        sx={{
          height: "400px", // Set height for better visualization
        }}
      >
        <Bar data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default CategorySummaryChart;
