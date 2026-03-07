import React from "react";
import { Typography, Box } from "@material-ui/core";

export default function SiteSettings() {
  return (
    <Box p={3}>
      <Typography variant="h6">Site Settings</Typography>
      <Typography color="textSecondary">Configure site settings here.</Typography>
    </Box>
  );
}
