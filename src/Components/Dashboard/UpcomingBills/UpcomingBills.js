import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const UpcomingBills = ({ bills }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const handlePayBill = async (bill) => {
    setLoading(true); // Start loading
    try {
      // Update bill status to "paid"
      const billDocRef = doc(db, "bills", bill.id);
      await updateDoc(billDocRef, { status: "paid" });

      // Add bill to "expenses" collection
      await addDoc(collection(db, "expenses"), {
        amount: bill.amount,
        category: bill.name,
        date: bill.dueDate?.seconds
          ? new Date(bill.dueDate.seconds * 1000)
          : new Date(), // Use due date or fallback to current date
      });

      // Show success message
      setSnackbar({
        open: true,
        message: `${bill.name} has been successfully added to expenses!`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating bill:", error);
      setSnackbar({
        open: true,
        message: "Failed to process the bill. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!bills || bills.length === 0) {
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
            Upcoming Bills
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              textAlign: "center",
            }}
          >
            No upcoming bills.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              fontFamily: "'Roboto', sans-serif",
              mb: 3,
              color: "#007bff",
            }}
          >
            Upcoming Bills
          </Typography>
          <List>
            {bills.map((bill, index) => (
              <ListItem
                key={bill.id || index}
                secondaryAction={
                  loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "#0056b3",
                        },
                      }}
                      onClick={() => handlePayBill(bill)}
                      disabled={loading}
                    >
                      Mark as Paid
                    </Button>
                  )
                }
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: "#f9f9f9",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#f0f8ff",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: "bold",
                        fontFamily: "'Roboto', sans-serif",
                        color: "#333",
                      }}
                    >
                      {`${bill.name || "Unnamed Bill"} - $${
                        bill.amount?.toLocaleString() || 0
                      }`}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontFamily: "'Roboto', sans-serif",
                      }}
                    >
                      {`Due: ${
                        bill.dueDate?.seconds
                          ? new Date(
                              bill.dueDate.seconds * 1000
                            ).toLocaleDateString()
                          : "No due date available"
                      }`}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.type}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpcomingBills;
