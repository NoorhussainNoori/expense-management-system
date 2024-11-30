import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Modal,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  TableSortLabel,
  Alert,
} from "@mui/material";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Expenses = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [sortOrder, setSortOrder] = useState({
    field: "date",
    direction: "desc",
  });
  const [openModal, setOpenModal] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(null);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "Salaries",
    employee: "",
    description: "",
    date: "",
    paymentMethod: "",
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [employees, setEmployees] = useState([]);
  const [showEmployeePopup, setShowEmployeePopup] = useState(false);

  const handleCloseInfoDialog = () => {
    setSelectedExpense(null);
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    const table = document.getElementById("expenses-table");
    doc.autoTable({ html: table, startY: 10 });
    doc.save("expenses.pdf");
  };

  // Fetch expenses from Firestore
  useEffect(() => {
    const startDate = new Date(`${filterMonth}-01`);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );

    const expensesQuery = query(
      collection(db, "expenses"),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate))
    );

    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      let total = 0;
      const categoryTotals = {};
      const expenseList = [];

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        total += data.amount;

        // Aggregate by category
        if (data.category) {
          categoryTotals[data.category] =
            (categoryTotals[data.category] || 0) + data.amount;
        }

        expenseList.push(data);
      });

      setExpenses(expenseList);
      setFilteredExpenses(expenseList);
      setTotalExpenses(total);
      setCategories(Object.entries(categoryTotals));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [filterMonth]);

  // Fetch budgets from Firestore
  useEffect(() => {
    const fetchBudgets = async () => {
      const snapshot = await getDocs(collection(db, "budget"));
      const budgetData = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        budgetData[data.category] = {
          allocatedAmount: parseFloat(data.allocatedAmount),
          spentAmount: parseFloat(data.spentAmount),
        };
      });
      setBudgets(budgetData);
    };

    fetchBudgets();
  }, []);

  // Fetch employees from Firestore
  useEffect(() => {
    const fetchEmployees = async () => {
      const snapshot = await getDocs(collection(db, "employees"));
      const employeeList = snapshot.docs.map((doc) => doc.data());
      setEmployees(employeeList);
    };

    fetchEmployees();
  }, []);

  const handleAddExpense = async () => {
    if (
      !newExpense.amount ||
      isNaN(newExpense.amount) ||
      !newExpense.category ||
      !newExpense.description ||
      !newExpense.date ||
      !newExpense.paymentMethod ||
      (newExpense.category === "Salaries" && !newExpense.employee)
    ) {
      alert("Please fill in all fields and ensure the amount is a number.");
      return;
    }

    setSavingExpense(true);
    try {
      await addDoc(collection(db, "expenses"), {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: Timestamp.fromDate(new Date(newExpense.date)),
      });
      setOpenModal(false);
      setNewExpense({
        amount: "",
        category: "Salaries",
        employee: "",
        description: "",
        date: "",
        paymentMethod: "",
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense. Please try again.");
    } finally {
      setSavingExpense(false);
    }
  };

  const handleSort = (field) => {
    const isAsc = sortOrder.field === field && sortOrder.direction === "asc";
    const direction = isAsc ? "desc" : "asc";

    const sorted = [...filteredExpenses].sort((a, b) => {
      if (field === "amount")
        return isAsc ? b.amount - a.amount : a.amount - b.amount;
      if (field === "date")
        return isAsc
          ? new Date(b.date.toDate()) - new Date(a.date.toDate())
          : new Date(a.date.toDate()) - new Date(b.date.toDate());
      return isAsc
        ? b[field]?.localeCompare(a[field])
        : a[field]?.localeCompare(b[field]);
    });

    setSortOrder({ field, direction });
    setFilteredExpenses(sorted);
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    const table = document.getElementById("expenses-table");
    doc.autoTable({ html: table, startY: 10 });
    doc.save("expenses.pdf");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f6f8",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      {/* Heading */}
      <Typography
        variant="h4"
        color="primary"
        sx={{
          mb: 4,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Expense Tracker
      </Typography>

      {/* Total Expenses */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Typography variant="h5" color="textSecondary">
          Total Expenses: ؋{totalExpenses.toLocaleString()}
        </Typography>
      </Box>

      {/* Budget Warning */}
      {budgetWarning && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            backgroundColor: "#fff4e5",
            borderLeft: "5px solid #ff9800",
            fontWeight: "bold",
          }}
        >
          {budgetWarning}
        </Alert>
      )}

      {/* Categories Section */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {categories.map(([category, amount], index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderLeft: `5px solid ${
                  budgets[category] &&
                  amount > budgets[category].allocatedAmount
                    ? "#ff5722"
                    : "#007bff"
                }`,
                boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#333", mb: 1 }}
                >
                  {category}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "500", color: "#555" }}
                >
                  Spent: ؋{amount.toLocaleString()}
                </Typography>
                {budgets[category] && (
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        amount > budgets[category].allocatedAmount
                          ? "#d32f2f"
                          : "#4caf50",
                      fontWeight: "500",
                      mt: 1,
                    }}
                  >
                    Allocated Budget: ؋
                    {budgets[category].allocatedAmount.toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          sx={{
            textTransform: "capitalize",
            fontWeight: "bold",
            px: 3,
            py: 1.5,
            "&:hover": { backgroundColor: "#0056b3" },
          }}
          onClick={() => setOpenModal(true)}
        >
          Add Expense
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          color="secondary"
          sx={{
            textTransform: "capitalize",
            fontWeight: "bold",
            px: 3,
            py: 1.5,
            "&:hover": { backgroundColor: "#f57c00" },
          }}
          onClick={handleExportToPDF}
        >
          Export to PDF
        </Button>
      </Box>

      {/* Filter Month */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: "#333",
        }}
      >
        Filter by Month
      </Typography>
      <Select
        variant="outlined"
        fullWidth
        value={filterMonth}
        onChange={(e) => setFilterMonth(e.target.value)}
        sx={{
          mb: 3,
          "& .MuiSelect-outlined": { fontWeight: "500" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#007bff" },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0056b3",
          },
        }}
      >
        {[...Array(12)].map((_, index) => {
          const month = String(index + 1).padStart(2, "0");
          const year = new Date().getFullYear();
          return (
            <MenuItem key={month} value={`${year}-${month}`}>
              {`${month}/${year}`}
            </MenuItem>
          );
        })}
      </Select>

      {/* Expenses Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Table id="expenses-table">
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                ID
              </TableCell>
              <TableCell
                onClick={() => handleSort("amount")}
                sx={{ cursor: "pointer" }}
              >
                <TableSortLabel
                  active={sortOrder.field === "amount"}
                  direction={sortOrder.direction}
                  sx={{ fontWeight: "bold", color: "#333" }}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Description
              </TableCell>
              <TableCell
                onClick={() => handleSort("date")}
                sx={{ cursor: "pointer" }}
              >
                <TableSortLabel
                  active={sortOrder.field === "date"}
                  direction={sortOrder.direction}
                  sx={{ fontWeight: "bold", color: "#333" }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell
                onClick={() => handleSort("paymentMethod")}
                sx={{ cursor: "pointer" }}
              >
                <TableSortLabel
                  active={sortOrder.field === "paymentMethod"}
                  direction={sortOrder.direction}
                  sx={{ fontWeight: "bold", color: "#333" }}
                >
                  Payment Method
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.map((expense, index) => (
              <TableRow
                key={expense.id}
                sx={{
                  "&:hover": { backgroundColor: "#f9f9f9" },
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>؋{expense.amount.toLocaleString()}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>
                  {expense.date?.toDate
                    ? expense.date.toDate().toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>{expense.paymentMethod}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    sx={{ "&:hover": { backgroundColor: "#e3f2fd" } }}
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <InfoIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Expense Info Dialog */}
      <Dialog
        open={Boolean(selectedExpense)}
        onClose={handleCloseInfoDialog}
        PaperProps={{
          sx: {
            width: 500,
            borderRadius: 2,
            padding: 2,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.5rem",
            color: "#007bff",
            textAlign: "center",
            mb: 2,
          }}
        >
          Expense Details
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 2,
          }}
        >
          {selectedExpense && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "150px 1fr",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                ID:
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#555", overflowWrap: "break-word" }}
              >
                {selectedExpense.id}
              </Typography>

              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Amount:
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                ؋{selectedExpense.amount.toLocaleString()}
              </Typography>

              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Category:
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                {selectedExpense.category}
              </Typography>

              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Description:
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                {selectedExpense.description || "No description provided"}
              </Typography>

              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Date:
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                {selectedExpense.date?.toDate
                  ? selectedExpense.date.toDate().toLocaleDateString()
                  : "N/A"}
              </Typography>

              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                Payment Method:
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                {selectedExpense.paymentMethod || "N/A"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            padding: 2,
          }}
        >
          <Button
            onClick={handleCloseInfoDialog}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              color: "#007bff",
              "&:hover": {
                backgroundColor: "#e3f2fd",
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
