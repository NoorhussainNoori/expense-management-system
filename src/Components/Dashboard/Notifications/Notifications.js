import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
} from "@mui/material";

const Notifications = ({ open, onClose, notifications }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Notifications</DialogTitle>
      <List>
        {notifications.map((notification, index) => (
          <ListItem button key={index}>
            <ListItemText primary={notification.message} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
};

export default Notifications;
