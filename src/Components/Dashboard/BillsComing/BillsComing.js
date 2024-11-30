import React, { useState, useEffect } from "react";
import { db } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { format, isThisMonth } from "date-fns";
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import PaidIcon from "@mui/icons-material/Paid";

import { jsPDF } from "jspdf";
import "jspdf-autotable";

const BillsComing = () => {
  const [bills, setBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]); // Categories from the 'budget' collection
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    dueDate: "",
    description: "",
    category: "", // New category field
    status: "pending",
  });

  // Fetch bills, expenses, and categories from Firestore
  useEffect(() => {
    const billsQuery = query(collection(db, "bills"));
    const expensesQuery = query(collection(db, "expenses"));
    const categoriesQuery = query(collection(db, "budget")); // Fetching budget categories

    const unsubscribeBills = onSnapshot(billsQuery, (snapshot) => {
      const billsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate(),
      }));
      setBills(billsData);
    });

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(expensesData);
    });

    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const categoriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        category: doc.data().category, // Use `category` field from Firestore
      }));
      console.log("Categories Fetched:", categoriesData); // Debugging statement
      setCategories(categoriesData);
    });

    setLoading(false);

    return () => {
      unsubscribeBills();
      unsubscribeExpenses();
      unsubscribeCategories();
    };
  }, []);

  // Open/close add bill dialog
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewBill({
      name: "",
      amount: "",
      dueDate: "",
      description: "",
      category: "",
      status: "pending",
    });
  };

  // Add a new bill
  const handleAddBill = async () => {
    if (
      newBill.name &&
      newBill.amount &&
      newBill.dueDate &&
      newBill.description &&
      newBill.category
    ) {
      await addDoc(collection(db, "bills"), {
        ...newBill,
        amount: parseFloat(newBill.amount),
        dueDate: new Date(newBill.dueDate),
      });
      handleCloseAddDialog();
    }
  };

  // Mark a bill as paid and add it to expenses
  const markAsPaid = async (bill) => {
    // Ensure the bill has a category
    if (!bill.category) {
      alert("The bill must have a valid category.");
      return;
    }

    const billRef = doc(db, "bills", bill.id);
    await updateDoc(billRef, { status: "paid" });

    // Add to expenses collection
    await addDoc(collection(db, "expenses"), {
      name: bill.name,
      category: bill.category,
      amount: bill.amount,
      date: new Date(),
      description: bill.description || "No description provided",
      paymentMethod: "cash", // Default or customizable
    });
  };

  // Download all paid bills as a PDF
  const downloadPaidBills = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Paid Bills", 20, 20);

    const paidTableData = paidBills.map((bill) => [
      bill.name,
      `$${bill.amount.toFixed(2)}`,
      format(bill.dueDate, "PP"),
      bill.category,
    ]);

    doc.autoTable({
      startY: 30,
      head: [["Name", "Amount", "Due Date", "Category"]],
      body: paidTableData,
    });

    doc.save("paid-bills.pdf");
  };

  // Categorize bills
  const thisMonthBills = bills.filter(
    (bill) => isThisMonth(bill.dueDate) && bill.status !== "paid"
  );
  const upcomingBills = bills.filter(
    (bill) => !isThisMonth(bill.dueDate) && bill.status !== "paid"
  );
  const paidBills = bills.filter((bill) => bill.status === "paid");

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
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: "1200px", margin: "auto" }}>
      <Grid container spacing={2}>
        {/* Paid Bills Sidebar */}
        <Grid item xs={3}>
          <Typography variant="h5">Paid Bills</Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FileDownloadIcon />}
            onClick={downloadPaidBills}
            sx={{ mb: 2 }}
          >
            Download Paid Bills
          </Button>
          {paidBills.map((bill) => (
            <Card key={bill.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{bill.name}</Typography>
                <Typography>Amount: ${bill.amount.toFixed(2)}</Typography>
                <Typography>Paid On: {format(bill.dueDate, "PP")}</Typography>
                <Typography>Category: {bill.category}</Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid item xs={6}>
          <Typography variant="h5">This Month's Bills</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={{ mb: 2 }}
          >
            Add New Bill
          </Button>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {thisMonthBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.name}</TableCell>
                    <TableCell>{bill.category || "No category"}</TableCell>
                    <TableCell>${bill.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(bill.dueDate, "PP")}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => markAsPaid(bill)}
                      >
                        <PaidIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Upcoming Bills */}
        <Grid item xs={3}>
          <Typography variant="h5">Upcoming Bills</Typography>
          {upcomingBills.map((bill) => (
            <Card key={bill.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{bill.name}</Typography>
                <Typography>Amount: ${bill.amount.toFixed(2)}</Typography>
                <Typography>Due: {format(bill.dueDate, "PP")}</Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>

      {/* Add New Bill Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add a New Bill</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Bill Name"
            type="text"
            fullWidth
            value={newBill.name}
            onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={newBill.amount}
            onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newBill.dueDate}
            onChange={(e) =>
              setNewBill({ ...newBill, dueDate: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={newBill.description}
            onChange={(e) =>
              setNewBill({ ...newBill, description: e.target.value })
            }
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newBill.category}
              onChange={(e) =>
                setNewBill({ ...newBill, category: e.target.value })
              }
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <MenuItem disabled>Loading categories...</MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.category}>
                    {category.category}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddBill} variant="contained" color="primary">
            Add Bill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillsComing;
