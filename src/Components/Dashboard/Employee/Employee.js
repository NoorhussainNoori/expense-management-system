import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import jsPDF from "jspdf";
import "jspdf-autotable";
import AddEmployeeForm from "./AddEmployee/AddEmployee";
import AddDepartmentForm from "./AddDepartment/AddDepartment";
import AddPositionForm from "./AddPosition/AddPosition";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig"; // Update with your Firebase config path

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch employees from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "employees"), (snapshot) => {
      const employeeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeeData);
    });
    return () => unsubscribe();
  }, []);

  // Fetch departments from Firestore
  useEffect(() => {
    const fetchDepartments = async () => {
      const snapshot = await getDocs(collection(db, "departments"));
      const departmentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDepartments(departmentData);
    };
    fetchDepartments();
  }, []);

  // Fetch positions from Firestore
  useEffect(() => {
    const fetchPositions = async () => {
      const snapshot = await getDocs(collection(db, "positions"));
      const positionData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPositions(positionData);
    };
    fetchPositions();
  }, []);

  // Add or edit employee
  const handleAddEmployee = async (employee) => {
    setLoading(true);
    try {
      if (employee.id) {
        // Editing existing employee
        const employeeDoc = doc(db, "employees", employee.id);
        await updateDoc(employeeDoc, employee);
      } else {
        // Adding new employee
        await addDoc(collection(db, "employees"), employee);
      }
    } catch (error) {
      console.error("Error adding/updating employee:", error);
    } finally {
      setLoading(false);
      setEditEmployee(null);
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }
    setLoading(true);
    try {
      const employeeDoc = doc(db, "employees", id);
      await deleteDoc(employeeDoc);
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add department to Firestore
  const handleAddDepartment = async (newDepartment) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "departments"), newDepartment);
      setDepartments((prev) => [...prev, { id: docRef.id, ...newDepartment }]);
    } catch (error) {
      console.error("Error adding department:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add position to Firestore
  const handleAddPosition = async (newPosition) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "positions"), newPosition);
      setPositions((prev) => [...prev, { id: docRef.id, ...newPosition }]);
    } catch (error) {
      console.error("Error adding position:", error);
    } finally {
      setLoading(false);
    }
  };

  // Download employee details as PDF
  const handleDownloadEmployeeDetails = (employee) => {
    const doc = new jsPDF();
    doc.text(`Employee Details - ${employee.name}`, 14, 10);
    doc.autoTable({
      startY: 20,
      body: [
        ["Name", employee.name],
        ["Position", employee.position],
        ["Department", employee.department],
        ["Salary", `؋${employee.salary}`],
        ["Joining Date", employee.joiningDate],
        ["Email", employee.email],
        ["Phone", employee.phone],
        ["Address", employee.address],
      ],
    });
    doc.save(`${employee.name}-details.pdf`);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employee Dashboard
      </Typography>

      {/* Overview Section */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Employees</Typography>
              <Typography variant="h4">{employees.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Employees</Typography>
              <Typography variant="h4">
                {employees.filter((emp) => emp.status === "Active").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsAddEmployeeOpen(true)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Add Employee"}
        </Button>
        <Button
          variant="contained"
          color="info"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDepartmentOpen(true)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Add Department"}
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => setIsAddPositionOpen(true)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Add Position"}
        </Button>
      </Box>

      {/* Employee List Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => {
                      setEditEmployee(employee); // Pass selected employee for editing
                      setIsAddEmployeeOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Employee Details Modal */}
      <Dialog
        open={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <Box>
              <Typography>
                <strong>Name:</strong> {selectedEmployee.name}
              </Typography>
              <Typography>
                <strong>Position:</strong> {selectedEmployee.position}
              </Typography>
              <Typography>
                <strong>Department:</strong> {selectedEmployee.department}
              </Typography>
              <Typography>
                <strong>Salary:</strong> ؋{selectedEmployee.salary}
              </Typography>
              <Typography>
                <strong>Joining Date:</strong> {selectedEmployee.joiningDate}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedEmployee.email}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selectedEmployee.phone}
              </Typography>
              <Typography>
                <strong>Address:</strong> {selectedEmployee.address}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              selectedEmployee &&
              handleDownloadEmployeeDetails(selectedEmployee)
            }
          >
            Download
          </Button>
          <Button onClick={() => setSelectedEmployee(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Employee Modal */}
      <AddEmployeeForm
        open={isAddEmployeeOpen}
        onClose={() => {
          setIsAddEmployeeOpen(false);
          setEditEmployee(null); // Clear editEmployee state
        }}
        onEmployeeAdded={handleAddEmployee}
        departments={departments}
        positions={positions}
        employeeToEdit={editEmployee} // Pass data to edit if available
      />

      {/* Add Department Modal */}
      <AddDepartmentForm
        open={isAddDepartmentOpen}
        onClose={() => setIsAddDepartmentOpen(false)}
        onDepartmentAdded={handleAddDepartment}
      />

      {/* Add Position Modal */}
      <AddPositionForm
        open={isAddPositionOpen}
        onClose={() => setIsAddPositionOpen(false)}
        onPositionAdded={handleAddPosition}
      />
    </Box>
  );
};

export default Employee;
