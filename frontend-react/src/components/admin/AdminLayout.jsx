import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    padding: theme.spacing(3),
  },
  title: {
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: theme.spacing(2),
  },
}));

export default function AdminLayout({ children, title }) {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      {title && <Typography variant="h5" className={classes.title}>{title}</Typography>}
      {children}
    </Box>
  );
}
