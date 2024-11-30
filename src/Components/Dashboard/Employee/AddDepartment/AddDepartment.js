import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
  Box,
} from "@mui/material";

const AddDepartment = ({ open, onClose, onDepartmentAdded }) => {
  const [department, setDepartment] = useState("");

  const handleSubmit = async () => {
    if (department.trim() === "") {
      alert("Department name cannot be empty.");
      return;
    }
    try {
      await onDepartmentAdded({ name: department });
      setDepartment("");
      onClose();
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Department</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Department Name"
            fullWidth
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Add Department
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDepartment;
