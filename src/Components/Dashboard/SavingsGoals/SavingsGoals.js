// components/SavingsGoals.js
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Box,
} from "@mui/material";

const SavingsGoals = ({ goals }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Savings Goals</Typography>
        {goals.map((goal, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="body1">
              {goal.name}: ${goal.saved} of ${goal.target}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(goal.saved / goal.target) * 100}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default SavingsGoals;
