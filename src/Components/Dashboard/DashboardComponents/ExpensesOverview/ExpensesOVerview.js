import React from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpensesOverview = ({ todayExpenses, totalExpenses }) => (
  <Box sx={{ padding: { xs: 2, sm: 4 } }}>
    <Typography
      variant="h5"
      sx={{
        mb: 3,
        textAlign: "center",
        fontWeight: "bold",
        color: "#333",
        fontSize: { xs: "1.5rem", sm: "2rem" },
      }}
    >
      Expenses Overview
    </Typography>
    <Grid container spacing={4}>
      {/* Today's Expenses Card */}
      <Grid item xs={12} sm={6}>
        <Card
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f5f5f5",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <AttachMoneyIcon
              sx={{
                fontSize: 50,
                color: "#4caf50",
                marginBottom: 1,
              }}
            />
            <Typography
              variant="h6"
              sx={{ color: "#4caf50", fontWeight: "bold" }}
            >
              Today's Expenses
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                color: "#333",
                mt: 1,
                fontSize: { xs: "2rem", sm: "2.5rem" },
              }}
            >
              ${todayExpenses}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Expenses Card */}
      <Grid item xs={12} sm={6}>
        <Card
          sx={{
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#e3f2fd",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TrendingUpIcon
              sx={{
                fontSize: 50,
                color: "#1976d2",
                marginBottom: 1,
              }}
            />
            <Typography
              variant="h6"
              sx={{ color: "#1976d2", fontWeight: "bold" }}
            >
              Total Expenses
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                color: "#333",
                mt: 1,
                fontSize: { xs: "2rem", sm: "2.5rem" },
              }}
            >
              ${totalExpenses}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default ExpensesOverview;
