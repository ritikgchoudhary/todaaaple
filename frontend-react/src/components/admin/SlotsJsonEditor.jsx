import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Save as SaveIcon, Refresh as RefreshIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@material-ui/icons";
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
  addForm: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  addTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0F172A",
    marginBottom: theme.spacing(2),
  },
  addRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    alignItems: "flex-start",
  },
  addField: {
    minWidth: 180,
    flex: 1,
  },
  addBtn: {
    backgroundColor: "#0F766E",
    color: "#fff",
    textTransform: "none",
    "&:hover": { backgroundColor: "#0D9488" },
  },
  tableWrap: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    overflowX: "auto",
  },
  table: {
    minWidth: 560,
  },
  thumb: {
    width: 48,
    height: 48,
    objectFit: "cover",
    borderRadius: 8,
  },
  actionsCell: { whiteSpace: "nowrap" },
  editDialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minWidth: 360,
  },
  dangerBtn: {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    textTransform: "none",
  },
}));

const initialAddForm = { name: "", provider: "JDB", softapiGameUid: "", charImageUrl: "" };

const baseUrl = () => (api.url || "").replace(/\/+$/, "");
const slotsApi = (path = "") => (baseUrl() ? `${baseUrl()}/admin-api/slots${path}` : `/admin-api/slots${path}`);

const SlotsJsonEditor = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [games, setGames] = useState([]);
  const [message, setMessage] = useState(null);
  const [adminApiKey, setAdminApiKey] = useState(localStorage.getItem("MASTER_ADMIN_API") || "");
  const [addForm, setAddForm] = useState(initialAddForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", provider: "", softapiGameUid: "", charImageUrl: "", logoUrl: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchSlots = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.get(slotsApi("/"));
      const data = res.data;
      const list = Array.isArray(data.games) ? data.games : [];
      setGames(list);
      setJsonText(JSON.stringify(data, null, 2));
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to load slots.";
      setMessage({ type: "error", text: msg });
      setJsonText("");
      setGames([]);
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
      const payload = { games: parsed.games };
      const key = adminApiKey.trim();
      if (key) payload.api = key;
      const headers = { "Content-Type": "application/json" };
      if (key) headers["X-Admin-Api"] = key;
      await axios.post(slotsApi("/"), payload, { headers });
      setMessage({ type: "success", text: "Slots saved successfully." });
      await fetchSlots();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to save.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleAddGame = async () => {
    if (!addForm.name.trim()) {
      setMessage({ type: "error", text: "Enter game name." });
      return;
    }
    setMessage(null);
    setAdding(true);
    try {
      await axios.post(slotsApi("/add"), {
        name: addForm.name.trim(),
        provider: addForm.provider.trim() || "JDB",
        softapiGameUid: addForm.softapiGameUid.trim() || addForm.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        charImageUrl: addForm.charImageUrl.trim(),
      });
      setMessage({ type: "success", text: "Game added." });
      setAddForm(initialAddForm);
      await fetchSlots();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || err.message || "Failed to add game." });
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (g) => {
    setEditingId(g.id || g.key);
    setEditForm({
      name: g.name || "",
      provider: g.provider || "JDB",
      softapiGameUid: g.softapiGameUid || g.key || "",
      charImageUrl: g.charImageUrl || "",
      logoUrl: g.logoUrl || "",
    });
  };

  const handleUpdateGame = async () => {
    if (!editingId) return;
    setMessage(null);
    setUpdating(true);
    try {
      await axios.put(slotsApi(`/${encodeURIComponent(editingId)}`), {
        name: editForm.name.trim(),
        provider: editForm.provider.trim() || "JDB",
        softapiGameUid: editForm.softapiGameUid.trim(),
        charImageUrl: editForm.charImageUrl.trim(),
        logoUrl: editForm.logoUrl.trim(),
      });
      setMessage({ type: "success", text: "Game updated." });
      setEditingId(null);
      await fetchSlots();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || err.message || "Failed to update." });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!deleteConfirmId) return;
    setMessage(null);
    setDeleting(true);
    try {
      await axios.delete(slotsApi(`/${encodeURIComponent(deleteConfirmId)}`));
      setMessage({ type: "success", text: "Game deleted." });
      setDeleteConfirmId(null);
      await fetchSlots();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || err.message || "Failed to delete." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Slots JSON Editor">
      <Paper className={classes.paper}>
        <Box className={classes.addForm}>
          <Typography className={classes.addTitle}>Add Slot Game (home page Slots)</Typography>
          <Box className={classes.addRow}>
            <TextField
              className={classes.addField}
              size="small"
              label="Game Name"
              value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Aviator"
              variant="outlined"
            />
            <TextField
              className={classes.addField}
              size="small"
              label="Provider"
              value={addForm.provider}
              onChange={(e) => setAddForm((f) => ({ ...f, provider: e.target.value }))}
              placeholder="JDB, JILI, R88..."
              variant="outlined"
            />
            <TextField
              className={classes.addField}
              size="small"
              label="Game UID"
              value={addForm.softapiGameUid}
              onChange={(e) => setAddForm((f) => ({ ...f, softapiGameUid: e.target.value }))}
              placeholder="e.g. 737"
              variant="outlined"
            />
          </Box>
          <Box className={classes.addRow}>
            <TextField
              className={classes.addField}
              size="small"
              label="Image URL"
              value={addForm.charImageUrl}
              onChange={(e) => setAddForm((f) => ({ ...f, charImageUrl: e.target.value }))}
              placeholder="https://..."
              variant="outlined"
              fullWidth
            />
            <Button
              className={classes.addBtn}
              variant="contained"
              startIcon={adding ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
              onClick={handleAddGame}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add Game"}
            </Button>
          </Box>
        </Box>

        <Typography className={classes.sectionTitle}>Slots list – Edit / Delete</Typography>
        {loading ? (
          <Box display="flex" alignItems="center" gap={2} py={2}>
            <CircularProgress size={24} />
            <Typography color="textSecondary">Loading...</Typography>
          </Box>
        ) : games.length === 0 ? (
          <Typography color="textSecondary">No games yet. Add one above or paste JSON below and Save.</Typography>
        ) : (
          <TableContainer className={classes.tableWrap}>
            <Table className={classes.table} size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Game UID</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell align="right" className={classes.actionsCell}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {games.map((g, i) => (
                  <TableRow key={g.id || g.key || i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{g.name || "—"}</TableCell>
                    <TableCell>{g.provider || "—"}</TableCell>
                    <TableCell>{g.softapiGameUid || "—"}</TableCell>
                    <TableCell>
                      {g.charImageUrl ? (
                        <img src={g.charImageUrl} alt="" className={classes.thumb} onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell align="right" className={classes.actionsCell}>
                      <IconButton size="small" onClick={() => openEdit(g)} title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirmId(g.id || g.key)} title="Delete" style={{ color: "#B91C1C" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Typography className={classes.sectionTitle}>
          Raw JSON (frontend/public/data/slot.json)
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>
          You can paste the API format with game_code, game_name, game_img — the app will normalize it for display.
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
          GET: <a href={slotsApi("/")} target="_blank" rel="noopener noreferrer">{slotsApi("/")}</a>
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
          placeholder="Not needed — Save works without key"
          fullWidth
          variant="outlined"
          helperText="Save works without a key. If you see 'Permission denied', restart the backend server (e.g. pm2 restart) so the latest code runs."
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

        <Dialog open={Boolean(editingId)} onClose={() => setEditingId(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Slot Game</DialogTitle>
          <DialogContent>
            <Box className={classes.editDialogContent}>
              <TextField size="small" label="Game Name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} variant="outlined" fullWidth />
              <TextField size="small" label="Provider" value={editForm.provider} onChange={(e) => setEditForm((f) => ({ ...f, provider: e.target.value }))} variant="outlined" fullWidth />
              <TextField size="small" label="Game UID" value={editForm.softapiGameUid} onChange={(e) => setEditForm((f) => ({ ...f, softapiGameUid: e.target.value }))} variant="outlined" fullWidth />
              <TextField size="small" label="Image URL" value={editForm.charImageUrl} onChange={(e) => setEditForm((f) => ({ ...f, charImageUrl: e.target.value }))} variant="outlined" fullWidth />
              <TextField size="small" label="Logo URL" value={editForm.logoUrl} onChange={(e) => setEditForm((f) => ({ ...f, logoUrl: e.target.value }))} variant="outlined" fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingId(null)}>Cancel</Button>
            <Button variant="contained" className={classes.saveBtn} onClick={handleUpdateGame} disabled={updating} startIcon={updating ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}>
              {updating ? "Saving..." : "Update"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)}>
          <DialogTitle>Delete game?</DialogTitle>
          <DialogContent>
            <Typography>This will remove the game from the slots list. Continue?</Typography>
            {deleteConfirmId && <Typography color="textSecondary" style={{ marginTop: 8 }}>ID: {deleteConfirmId}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="outlined" className={classes.dangerBtn} onClick={handleDeleteGame} disabled={deleting} startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </AdminLayout>
  );
};

export default SlotsJsonEditor;
