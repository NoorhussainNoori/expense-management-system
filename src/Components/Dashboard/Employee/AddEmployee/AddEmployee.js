import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

const AddEmployee = ({
  open,
  onClose,
  onEmployeeAdded,
  departments,
  positions,
  employeeToEdit, // Employee data for editing
}) => {
  const [employee, setEmployee] = useState({
    name: "",
    position: "",
    department: "",
    salary: "",
    joiningDate: "",
    email: "",
    phone: "",
    address: "",
  });

  // Reset form or pre-fill fields based on employeeToEdit
  useEffect(() => {
    if (open) {
      if (employeeToEdit) {
        setEmployee(employeeToEdit); // Pre-fill form with employeeToEdit data
      } else {
        setEmployee({
          name: "",
          position: "",
          department: "",
          salary: "",
          joiningDate: "",
          email: "",
          phone: "",
          address: "",
        }); // Reset form for new employee
      }
    }
  }, [open, employeeToEdit]);

  const handleSubmit = () => {
    if (!employee.name || !employee.position || !employee.department) {
      alert("Please fill in all required fields.");
      return;
    }
    onEmployeeAdded(employee);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {employeeToEdit ? "Edit Employee" : "Add New Employee"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            fullWidth
            value={employee.name}
            onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
          />
          <Select
            label="Department"
            fullWidth
            value={employee.department}
            onChange={(e) =>
              setEmployee({ ...employee, department: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Department
            </MenuItem>
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.name}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            label="Position"
            fullWidth
            value={employee.position}
            onChange={(e) =>
              setEmployee({ ...employee, position: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Position
            </MenuItem>
            {positions.map((position) => (
              <MenuItem key={position.id} value={position.name}>
                {position.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Salary"
            fullWidth
            type="number"
            value={employee.salary}
            onChange={(e) =>
              setEmployee({ ...employee, salary: e.target.value })
            }
          />
          <TextField
            label="Joining Date"
            fullWidth
            type="date"
            value={employee.joiningDate}
            onChange={(e) =>
              setEmployee({ ...employee, joiningDate: e.target.value })
            }
          />
          <TextField
            label="Email"
            fullWidth
            value={employee.email}
            onChange={(e) =>
              setEmployee({ ...employee, email: e.target.value })
            }
          />
          <TextField
            label="Phone"
            fullWidth
            value={employee.phone}
            onChange={(e) =>
              setEmployee({ ...employee, phone: e.target.value })
            }
          />
          <TextField
            label="Address"
            fullWidth
            multiline
            rows={2}
            value={employee.address}
            onChange={(e) =>
              setEmployee({ ...employee, address: e.target.value })
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {employeeToEdit ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEmployee;
