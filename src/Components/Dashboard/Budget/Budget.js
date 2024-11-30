import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  TextField,
  Button,
  Modal,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const Budget = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "",
    allocatedAmount: "",
    month: "",
    startDate: "",
    endDate: "",
  });
  const [editingBudget, setEditingBudget] = useState(null);
  const [savingBudget, setSavingBudget] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Fetch budgets and expenses from Firestore
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch budgets
      const budgetSnapshot = await getDocs(collection(db, "budget"));
      const budgetsData = [];
      let totalAlloc = 0;

      budgetSnapshot.forEach((doc) => {
        const data = doc.data();
        budgetsData.push({ id: doc.id, ...data });
        totalAlloc += parseFloat(data.allocatedAmount || 0);
      });

      // Fetch expenses
      const expenseSnapshot = await getDocs(collection(db, "expenses"));
      const expensesData = [];
      let totalSpentAmount = 0;

      expenseSnapshot.forEach((doc) => {
        const data = doc.data();
        expensesData.push(data);
        totalSpentAmount += parseFloat(data.amount || 0);
      });

      setBudgets(budgetsData);
      setExpenses(expensesData);
      setTotalAllocated(totalAlloc);
      setTotalSpent(totalSpentAmount);
      setRemainingBudget(totalAlloc - totalSpentAmount);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered budgets based on the search query
  const filteredBudgets = budgets.filter((budget) =>
    budget.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding or editing a budget
  const handleAddOrEditBudget = async () => {
    if (
      !newBudget.category ||
      isNaN(newBudget.allocatedAmount) ||
      !newBudget.month ||
      !newBudget.startDate ||
      !newBudget.endDate
    ) {
      setError("Please fill in all fields correctly.");
      return;
    }

    if (new Date(newBudget.startDate) > new Date(newBudget.endDate)) {
      setError("Start date must be before the end date.");
      return;
    }

    setSavingBudget(true);
    try {
      if (editingBudget) {
        // Update existing budget
        const budgetRef = doc(db, "budget", editingBudget.id);
        await updateDoc(budgetRef, {
          ...newBudget,
          allocatedAmount: parseFloat(newBudget.allocatedAmount),
        });
      } else {
        // Add new budget
        await addDoc(collection(db, "budget"), {
          ...newBudget,
          allocatedAmount: parseFloat(newBudget.allocatedAmount),
        });
      }

      setOpenModal(false);
      setNewBudget({
        category: "",
        allocatedAmount: "",
        month: "",
        startDate: "",
        endDate: "",
      });
      fetchData();
    } catch (err) {
      setError("Failed to save the budget. Please try again.");
      console.error(err);
    } finally {
      setSavingBudget(false);
    }
  };

  // Handle opening the modal
  const handleOpenModal = (budget) => {
    if (budget) {
      setNewBudget({
        category: budget.category,
        allocatedAmount: budget.allocatedAmount.toString(),
        month: budget.month,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });
      setEditingBudget(budget);
    } else {
      setNewBudget({
        category: "",
        allocatedAmount: "",
        month: "",
        startDate: "",
        endDate: "",
      });
      setEditingBudget(null);
    }

    setOpenModal(true);
  };

  // Handle deleting a budget
  const handleDeleteBudget = async (id) => {
    setDeleting(true); // Start the delete action
    try {
      await deleteDoc(doc(db, "budget", id));
      await fetchData(); // Refresh the data after successful deletion
    } catch (err) {
      setError("Failed to delete the budget. Please try again.");
      console.error(err);
    } finally {
      setDeleting(false); // Stop the delete action
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          textAlign: "center",
          fontWeight: "bold",
          color: "#007bff",
        }}
      >
        Budget Overview
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              padding: 2,
              textAlign: "center",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              "&:hover": { transform: "scale(1.05)" },
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Typography variant="h6">Total Allocated Budget</Typography>
            <Typography variant="h5" color="primary">
              ؋{totalAllocated.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              padding: 2,
              textAlign: "center",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              "&:hover": { transform: "scale(1.05)" },
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Typography variant="h6">Total Spent Amount</Typography>
            <Typography variant="h5" color="primary">
              ؋{totalSpent.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              padding: 2,
              textAlign: "center",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              "&:hover": { transform: "scale(1.05)" },
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Typography variant="h6">Remaining Budget</Typography>
            <Typography variant="h5" color="primary">
              ؋{remainingBudget.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            fontWeight: "bold",
            backgroundColor: "#ffe5e5",
            color: "#d32f2f",
          }}
        >
          {error}
        </Alert>
      )}

      {/* Search Section */}
      <TextField
        variant="outlined"
        fullWidth
        placeholder="Search by category"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{
          mt: 4,
          mb: 4,
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: "#007bff" },
          },
        }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenModal(null)}
        sx={{
          mb: 4,
          textTransform: "capitalize",
          fontWeight: "bold",
        }}
      >
        Add Budget
      </Button>

      <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Category
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Allocated Amount
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Month
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Start Date
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                End Date
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBudgets.map((budget) => (
              <TableRow
                key={budget.id}
                sx={{
                  "&:hover": { backgroundColor: "#f9f9f9" },
                }}
              >
                <TableCell>{budget.category}</TableCell>
                <TableCell>
                  ؋{parseFloat(budget.allocatedAmount).toLocaleString()}
                </TableCell>
                <TableCell>{budget.month}</TableCell>
                <TableCell>{budget.startDate}</TableCell>
                <TableCell>{budget.endDate}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenModal(budget)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteBudget(budget.id)}
                    disabled={deleting}
                  >
                    {deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Budget Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 500,
            bgcolor: "white",
            p: 4,
            borderRadius: 2,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
            mx: "auto",
            mt: "10%",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: "bold",
              textAlign: "center",
              color: "#007bff",
            }}
          >
            {editingBudget ? "Edit Budget" : "Add New Budget"}
          </Typography>
          <TextField
            fullWidth
            label="Category"
            value={newBudget.category}
            onChange={(e) =>
              setNewBudget({ ...newBudget, category: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Allocated Amount"
            value={newBudget.allocatedAmount}
            onChange={(e) =>
              setNewBudget({ ...newBudget, allocatedAmount: e.target.value })
            }
            type="number"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Month"
            value={newBudget.month}
            onChange={(e) =>
              setNewBudget({ ...newBudget, month: e.target.value })
            }
            type="month"
            InputLabelProps={{
              shrink: true, // Ensures label stays above the input
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Start Date"
            value={newBudget.startDate}
            onChange={(e) =>
              setNewBudget({ ...newBudget, startDate: e.target.value })
            }
            type="date"
            InputLabelProps={{
              shrink: true, // Ensures label stays above the input
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="End Date"
            value={newBudget.endDate}
            onChange={(e) =>
              setNewBudget({ ...newBudget, endDate: e.target.value })
            }
            type="date"
            InputLabelProps={{
              shrink: true, // Ensures label stays above the input
            }}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddOrEditBudget}
            disabled={savingBudget}
            fullWidth
            sx={{
              mt: 2,
              fontWeight: "bold",
              textTransform: "capitalize",
            }}
          >
            {savingBudget ? (
              <CircularProgress size={20} />
            ) : editingBudget ? (
              "Save Changes"
            ) : (
              "Add Budget"
            )}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Budget;
