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

const AddPosition = ({ open, onClose, onPositionAdded }) => {
  const [position, setPosition] = useState("");

  const handleSubmit = async () => {
    if (position.trim() === "") {
      alert("Position name cannot be empty.");
      return;
    }
    try {
      await onPositionAdded({ name: position });
      setPosition("");
      onClose();
    } catch (error) {
      console.error("Error adding position:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Position</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Position Name"
            fullWidth
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Add Position
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPosition;
