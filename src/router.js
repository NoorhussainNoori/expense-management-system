import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import { useAuth } from "./Components/Contexts/authContext/authContext";
import Dashboard from "./Components/Dashboard/Dashboard";
import SignIn from "./Components/SignIn/SignIn";
import Expenses from "./Components/Dashboard/Expenses/Expenses"; // Expenses component
import Budget from "./Components/Dashboard/Budget/Budget";
import Employee from "./Components/Dashboard/Employee/Employee";
import BillsComing  from "./Components/Dashboard/BillsComing/BillsComing";

const PrivateRoute = ({ children }) => {
  const { userLoggedIn } = useAuth();
  return userLoggedIn ? children : <Navigate to="/" />;
};

const RouterList = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<SignIn />} />

        {/* Dashboard Route with Nested Routes for Sub-Components */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          {/* Sub-Routes for Dashboard */}
          <Route path="expenses" element={<Expenses />} />
          <Route path="budget" element={<Budget />} />
          <Route path="employee" element={<Employee />} />
          <Route path="upcoming" element={<BillsComing />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default RouterList;
