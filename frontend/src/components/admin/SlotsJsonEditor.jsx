import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Save as SaveIcon, Refresh as RefreshIcon } from "@material-ui/icons";
import axios from "axios";
import * as api from "../../api/auth";
import AdminLayout from "./AdminLayout";

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #E2E8F0",
    maxWidth: 900,
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0F172A",
    marginBottom: theme.spacing(2),
  },
  textArea: {
    width: "100%",
    minHeight: 400,
    fontFamily: "monospace",
    fontSize: "13px",
    "& .MuiInputBase-input": {
      fontFamily: "monospace",
    },
  },
  buttonBox: {
    marginTop: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  saveBtn: {
    backgroundColor: "#10B9B1",
    color: "#fff",
    textTransform: "none",
    "&:hover": { backgroundColor: "#0D9488" },
  },
  loadBtn: {
    textTransform: "none",
    border: "1px solid #E2E8F0",
  },
  message: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: 8,
    fontSize: "0.875rem",
  },
  error: {
    backgroundColor: "#FEF2F2",
    color: "#B91C1C",
  },
  success: {
    backgroundColor: "#F0FDF4",
    color: "#15803D",
  },
  keyField: {
    marginBottom: theme.spacing(2),
    maxWidth: 400,
  },
}));

const SLOTS_URL = () => `${api.url || ""}/admin-api/slots/`;

const SlotsJsonEditor = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [message, setMessage] = useState(null);
  const [adminApiKey, setAdminApiKey] = useState(localStorage.getItem("MASTER_ADMIN_API") || "");

  const fetchSlots = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const base = (api.url || "").replace(/\/+$/, "");
      const url = base ? `${base}/admin-api/slots/` : "/admin-api/slots/";
      const res = await axios.get(url);
      const data = res.data;
      setJsonText(JSON.stringify(data, null, 2));
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to load slots.";
      setMessage({ type: "error", text: msg });
      setJsonText("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSave = async () => {
    setMessage(null);
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      setMessage({ type: "error", text: "Invalid JSON: " + e.message });
      return;
    }
    if (!Array.isArray(parsed.games)) {
      setMessage({ type: "error", text: "JSON must have a 'games' array." });
      return;
    }
    setSaving(true);
    try {
      const base = (api.url || "").replace(/\/+$/, "");
      const url = base ? `${base}/admin-api/slots/` : "/admin-api/slots/";
      const payload = { games: parsed.games };
      if (adminApiKey.trim()) payload.api = adminApiKey.trim();
      await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
      setMessage({ type: "success", text: "Slots saved successfully." });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to save.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Slots JSON Editor">
      <Paper className={classes.paper}>
        <Typography className={classes.sectionTitle}>
          Edit slots (frontend/public/data/slot.json)
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
          GET: <a href={SLOTS_URL()} target="_blank" rel="noopener noreferrer">{SLOTS_URL()}</a>
        </Typography>
        <TextField
          className={classes.keyField}
          size="small"
          label="Admin API Key (optional)"
          value={adminApiKey}
          onChange={(e) => {
            setAdminApiKey(e.target.value);
            localStorage.setItem("MASTER_ADMIN_API", e.target.value);
          }}
          placeholder="Leave empty if not set on server"
          fullWidth
          variant="outlined"
        />
        {loading ? (
          <Box display="flex" alignItems="center" gap={2} py={4}>
            <CircularProgress size={24} />
            <Typography color="textSecondary">Loading slots...</Typography>
          </Box>
        ) : (
          <TextField
            className={classes.textArea}
            multiline
            rows={20}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            variant="outlined"
            placeholder='{ "games": [ ... ] }'
          />
        )}
        <Box className={classes.buttonBox}>
          <Button
            className={classes.loadBtn}
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSlots}
            disabled={loading}
          >
            Reload
          </Button>
          <Button
            className={classes.saveBtn}
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </Box>
        {message && (
          <Box className={`${classes.message} ${message.type === "error" ? classes.error : classes.success}`}>
            {message.text}
          </Box>
        )}
      </Paper>
    </AdminLayout>
  );
};

export default SlotsJsonEditor;
