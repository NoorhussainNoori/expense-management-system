import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Typography,
  ThemeProvider,
  createTheme,
  Divider,
} from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";

import TopBar from "./TopBar/TopBar";
import ExpensesOverview from "./DashboardComponents/ExpensesOverview/ExpensesOVerview";
import MonthlyTrendChart from "./DashboardComponents/MonthlyTrendChart/MonthlyTrendChart";
import CategorySummaryChart from "./DashboardComponents/CategorySummaryChart/CategorySummaryChart";
import WeeklyTrendChart from "./DashboardComponents/WeeklyTrendChart/WeeklyTrendChart";
import BudgetTracking from "./BudgetTracking/BudgetTracking";
import SavingsGoals from "./SavingsGoals/SavingsGoals";
import UpcomingBills from "./UpcomingBills/UpcomingBills";

// Theme setup
const theme = createTheme({
  palette: {
    primary: { main: "#007bff" },
    secondary: { main: "#ff9800" },
    background: { default: "#f4f6f8", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h6: { fontSize: "1rem", fontWeight: 600 },
  },
});

const Dashboard = () => {
  const location = useLocation();
  const isMainDashboard = location.pathname === "/dashboard";

  const [loading, setLoading] = useState(true);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);

  // Fetch Expenses and Bills
  useEffect(() => {
    // Real-time listener for Expenses
    const expensesQuery = query(collection(db, "expenses"));
    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      let todayTotal = 0;
      let allExpensesTotal = 0;
      const categoryTotals = {};
      const monthlyTotals = Array(12).fill(0);
      const weeklyTotals = Array(7).fill(0);

      const today = new Date();
      snapshot.forEach((doc) => {
        const data = doc.data();
        const expenseDate =
          data.date instanceof Date ? data.date : data.date?.toDate();

        if (!expenseDate) {
          console.error(`Invalid date for expense:`, data);
          return;
        }

        const month = expenseDate.getMonth();
        const dayDifference = Math.floor(
          (today - expenseDate) / (1000 * 60 * 60 * 24)
        );

        allExpensesTotal += data.amount || 0;

        if (
          expenseDate.getDate() === today.getDate() &&
          expenseDate.getMonth() === today.getMonth() &&
          expenseDate.getFullYear() === today.getFullYear()
        ) {
          todayTotal += data.amount || 0;
        }

        if (data.category) {
          categoryTotals[data.category] =
            (categoryTotals[data.category] || 0) + (data.amount || 0);
        }

        monthlyTotals[month] += data.amount || 0;

        if (dayDifference >= 0 && dayDifference < 7) {
          weeklyTotals[6 - dayDifference] += data.amount || 0;
        }
      });

      console.log("Fetched Expenses:", {
        todayTotal,
        allExpensesTotal,
        categoryTotals,
        monthlyTotals,
        weeklyTotals,
      });

      setTodayExpenses(todayTotal);
      setTotalExpenses(allExpensesTotal);
      setCategories(
        Object.entries(categoryTotals).map(([name, amount]) => ({
          name,
          amount,
        }))
      );
      setMonthlyTrend(monthlyTotals);
      setWeeklyTrend(weeklyTotals);
    });

    // Real-time listener for Bills
    const billsQuery = query(collection(db, "bills"));
    const unsubscribeBills = onSnapshot(billsQuery, (snapshot) => {
      const billsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (bill) => ["unpaid", "pending"].includes(bill.status?.toLowerCase()) // Filter unpaid/pending bills
        );

      console.log("Filtered Bills (Unpaid or Pending):", billsData); // Debugging output
      setUpcomingBills(billsData);
    });

    // Stop listening to changes when the component unmounts
    return () => {
      unsubscribeExpenses();
      unsubscribeBills();
    };
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <TopBar notifications={[]} />

        {isMainDashboard && (
          <Box sx={{ padding: 4 }}>
            <Typography
              variant="h4"
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                mb: 4,
              }}
            >
              Dashboard Overview
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <MonthlyTrendChart data={monthlyTrend} />
                  </Grid>
                  <Grid item xs={12}>
                    <CategorySummaryChart categories={categories} />
                  </Grid>
                  <Grid item xs={12}>
                    <WeeklyTrendChart data={weeklyTrend} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <ExpensesOverview
                      todayExpenses={todayExpenses}
                      totalExpenses={totalExpenses}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <BudgetTracking budget={1000} spent={totalExpenses} />
                  </Grid>
                  <Grid item xs={12}>
                    <UpcomingBills bills={upcomingBills} />
                  </Grid>
                  <Grid item xs={12}>
                    <SavingsGoals goals={savingsGoals} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ paddingTop: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
