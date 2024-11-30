import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Box, Typography, CircularProgress, Grid, Paper } from "@mui/material";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import Chart from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register plugins
Chart.register(annotationPlugin, ChartDataLabels);

const MonthlyTrendChart = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [summaryData, setSummaryData] = useState({});

  useEffect(() => {
    const fetchExpenses = async () => {
      const expensesQuery = query(collection(db, "expenses"));
      const monthlyCategoryTotals = Array(12)
        .fill(null)
        .map(() => ({})); // Array of 12 objects for each month

      const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
        const categoryTotals = {};
        let grandTotal = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const expenseDate = data.date?.toDate();

          if (!expenseDate) return;

          const month = expenseDate.getMonth();
          const amount = data.amount || 0;

          grandTotal += amount;

          if (data.category) {
            monthlyCategoryTotals[month][data.category] =
              (monthlyCategoryTotals[month][data.category] || 0) + amount;
            categoryTotals[data.category] =
              (categoryTotals[data.category] || 0) + amount;
          }
        });

        const categories = Array.from(
          new Set(
            monthlyCategoryTotals.flatMap((monthData) =>
              Object.keys(monthData || {})
            )
          )
        );

        const totalCategories = categories.length;

        const datasets = categories.map((category, index) => {
          const hue = 40 + (180 * index) / totalCategories; // Gradient from orange (40°) to blue (220°)
          return {
            label: category,
            data: monthlyCategoryTotals.map(
              (monthData) => monthData[category] || 0
            ),
            borderColor: `hsl(${hue}, 70%, 50%)`,
            backgroundColor: `hsla(${hue}, 70%, 50%, 0.2)`,
            pointBackgroundColor: `hsl(${hue}, 70%, 50%)`,
            pointHoverRadius: 8,
            tension: 0.4,
            fill: true,
          };
        });

        const totalDataset = {
          label: "Total",
          data: monthlyCategoryTotals.map((monthData) =>
            Object.values(monthData || {}).reduce(
              (sum, value) => sum + value,
              0
            )
          ),
          borderColor: "#333",
          borderWidth: 3,
          backgroundColor: "rgba(51, 51, 51, 0.1)",
          pointBackgroundColor: "#333",
          pointHoverRadius: 12,
          tension: 0.4,
          fill: true,
        };

        setChartData({
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [...datasets, totalDataset],
        });

        setSummaryData({
          grandTotal,
          categoryTotals,
        });

        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchExpenses();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        mode: "index", // Display all datasets for the hovered x-axis point
        intersect: false, // Show tooltip even when not directly hovering over points
        backgroundColor: "rgba(0,0,0,0.8)",
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        callbacks: {
          title: (tooltipItems) => {
            // Title shows the month name
            const index = tooltipItems[0].dataIndex;
            return `Month: ${tooltipItems[0].chart.data.labels[index]}`;
          },
          label: (tooltipItem) => {
            // Show individual dataset amounts
            const datasetLabel = tooltipItem.dataset.label || "";
            const value = tooltipItem.raw || 0;
            return `${datasetLabel}: $${value.toLocaleString()}`;
          },
          footer: (tooltipItems) => {
            // Calculate and display the total for the month
            const total = tooltipItems.reduce((sum, item) => sum + item.raw, 0);
            return `Total: $${total.toLocaleString()}`;
          },
        },
        footerFont: { size: 14, weight: "bold" },
        footerMarginTop: 10,
      },
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            family: "Roboto, sans-serif",
          },
          color: "#333",
          usePointStyle: true,
        },
      },
      datalabels: {
        color: "#000",
        font: { weight: "bold", size: 10 },
        backgroundColor: (context) =>
          context.dataset.label === "Total"
            ? "rgba(51, 51, 51, 0.8)"
            : context.dataset.borderColor,
        borderRadius: 4,
        padding: 6,
        display: (context) => context.raw > 0,
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },
    interaction: {
      mode: "index",
      intersect: false, // Allows tooltips to appear even when hovering over empty spaces
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
          font: { size: 14, weight: "bold" },
          color: "#666",
        },
        ticks: { color: "#666", font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Expenses ($)",
          font: { size: 14, weight: "bold" },
          color: "#666",
        },
        ticks: { color: "#666", font: { size: 12 } },
      },
    },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 3,
        border: "1px solid #ddd",
        borderRadius: 4,
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
        height: "auto",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
        },
      }}
    >
      {/* Summary Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              fontFamily: "Roboto, sans-serif",
              color: "#007BFF",
            }}
          >
            Summary
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              textAlign: "center",
              backgroundColor: "rgba(0,123,255,0.1)",
              borderRadius: "10px",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              Total Expenses
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#007BFF", fontWeight: "bold" }}
            >
              ${summaryData.grandTotal.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        {Object.entries(summaryData.categoryTotals).map(
          ([category, total], index) => (
            <Grid item xs={6} sm={4} key={category}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  textAlign: "center",
                  backgroundColor: `hsla(${
                    40 +
                    (180 * index) /
                      Object.keys(summaryData.categoryTotals).length
                  }, 70%, 50%, 0.1)`,
                  borderRadius: "10px",
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {category}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: `hsl(${
                      40 +
                      (180 * index) /
                        Object.keys(summaryData.categoryTotals).length
                    }, 70%, 50%)`,
                    fontWeight: "bold",
                  }}
                >
                  ${total.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          )
        )}
      </Grid>

      {/* Chart Section */}
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 2,
          fontFamily: "Roboto, sans-serif",
        }}
      >
        📊 Monthly Expense Trends by Category
      </Typography>
      <Box
        sx={{
          height: "450px",
          borderRadius: "10px",
          padding: "10px",
        }}
      >
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default MonthlyTrendChart;
