import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import RefreshIcon from "@material-ui/icons/Refresh";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@material-ui/icons/Add";

import {
  createGameCatalogAdmin,
  deleteGameCatalogAdmin,
  fetchGameCatalogAdmin,
  updateGameCatalogAdmin,
} from "../../api/gameCatalog";

const CATEGORY_OPTIONS = [
  { id: "sports", label: "Sports" },
  { id: "casino", label: "Live Casino" },
  { id: "crash", label: "Crash" },
  { id: "slot", label: "Slot" },
  { id: "cards", label: "Cards" },
  { id: "lottery", label: "Lottery" },
  { id: "cockfight", label: "Cockfight" },
  { id: "other", label: "Other" },
];

const TYPE_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "grid", label: "Grid" },
];

function buildBzvmLogo(icon) {
  if (!icon) return "";
  return `https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/${icon}`;
}

function buildBzvmChar(char) {
  if (!char) return "";
  return `https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/${char}`;
}

// Minimal seed data so the admin panel isn't empty on first use.
// You can edit/replace these any time from the panel.
const DEFAULT_SEED_GAMES = [
  // Sports
  {
    key: "9wickets",
    name: "9WICKETS",
    category: "sports",
    type: "featured",
    enabled: true,
    sortOrder: 0,
    logoUrl: buildBzvmLogo("4-GP9W.png"),
    charImageUrl: buildBzvmChar("4-GP9W.png"),
    backgroundUrl:
      "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-4.png",
    onClickPath: "/cricket",
  },
  {
    key: "lucky-sports",
    name: "Lucky Sports",
    category: "sports",
    type: "grid",
    enabled: true,
    sortOrder: 1,
    logoUrl: buildBzvmLogo("4-GPLS.png"),
    charImageUrl: buildBzvmChar("4-GPLS.png"),
    backgroundUrl:
      "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-4.png",
    onClickPath: "/cricket",
  },
  {
    key: "saba-sports",
    name: "SABA",
    category: "sports",
    type: "grid",
    enabled: true,
    sortOrder: 2,
    logoUrl: buildBzvmLogo("4-GPOW-en_US.png"),
    charImageUrl: buildBzvmChar("4-GPOW.png"),
    backgroundUrl:
      "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-4.png",
    onClickPath: "/cricket",
  },

  // Live Casino
  {
    key: "evo",
    name: "EVO",
    category: "casino",
    type: "grid",
    enabled: true,
    sortOrder: 0,
    logoUrl: buildBzvmLogo("3-GPEV.png"),
    charImageUrl: buildBzvmChar("3-1.png"),
    backgroundUrl:
      "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-3.png",
    onClickPath: "/casino",
  },
  {
    key: "pt",
    name: "PT",
    category: "casino",
    type: "grid",
    enabled: true,
    sortOrder: 1,
    logoUrl: buildBzvmLogo("3-GPPT3.png"),
    charImageUrl: buildBzvmChar("3-2.png"),
    backgroundUrl:
      "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-3.png",
    onClickPath: "/casino",
  },

  // Crash
  {
    key: "aviator",
    name: "Aviator",
    category: "crash",
    type: "grid",
    enabled: true,
    sortOrder: 0,
    charImageUrl:
      "https://img.bzvm68.com/GoWin11/crash_game_icon/crash.png",
    onClickPath: "/aviator",
  },

  // Slot
  {
    key: "slots-hot",
    name: "HOT Slots",
    category: "slot",
    type: "grid",
    enabled: true,
    sortOrder: 0,
    charImageUrl:
      "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/2.png",
    onClickPath: "/casino",
  },

  // Cards
  {
    key: "cards-jili",
    name: "JILI Cards",
    category: "cards",
    type: "grid",
    enabled: true,
    sortOrder: 0,
    charImageUrl:
      "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/6.png",
    onClickPath: "/casino",
    badge: "JL",
  },

  // Lottery
  {
    key: "india-lotto",
    name: "INDIA LOTTO",
    category: "lottery",
    type: "grid",
    enabled: true,
    sortOrder: 0,
    badge: "National Jackpot",
    onClickPath: "/wingo",
  },

  // Cockfight
  {
    key: "sv388",
    name: "SV388",
    category: "cockfight",
    type: "grid",
    enabled: true,
    sortOrder: 0,
    badge: "SV",
    onClickPath: "/casino",
  },
];

const useStyles = makeStyles(() => ({
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    padding: "16px",
  },
  frame: {
    maxWidth: 980,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
    flexWrap: "wrap",
  },
  titleWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  card: {
    padding: 14,
    border: "1px solid #E5E7EB",
    background: "#fff",
    borderRadius: "0px",
  },
  keyRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  muted: { color: "#64748B" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 12,
  },
  miniLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
    marginBottom: 6,
  },
  filters: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  },
}));

const EMPTY_FORM = {
  _id: "",
  key: "",
  name: "",
  category: "sports",
  type: "grid",
  enabled: true,
  sortOrder: 0,
  badge: "",
  logoUrl: "",
  charImageUrl: "",
  backgroundUrl: "",
  onClickPath: "",
  externalUrl: "",
  softapiGameUid: "",
};

export default function GamesCatalogAdmin() {
  const classes = useStyles();
  const [adminApiKey, setAdminApiKey] = useState(
    localStorage.getItem("MASTER_ADMIN_API") || ""
  );
  const [savingKey, setSavingKey] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [games, setGames] = useState([]);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDisabled, setShowDisabled] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = !!form?._id;

  const canUseAdmin = useMemo(() => adminApiKey.trim().length > 0, [adminApiKey]);

  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (games || [])
      .filter((g) => (showDisabled ? true : !!g.enabled))
      .filter((g) => (categoryFilter === "all" ? true : g.category === categoryFilter))
      .filter((g) => {
        if (!q) return true;
        return (
          String(g.name || "").toLowerCase().includes(q) ||
          String(g.key || "").toLowerCase().includes(q)
        );
      });
  }, [games, query, categoryFilter, showDisabled]);

  const counts = useMemo(() => {
    const total = (games || []).length;
    const enabled = (games || []).filter((g) => !!g.enabled).length;
    const disabled = total - enabled;
    return { total, enabled, disabled };
  }, [games]);

  async function load() {
    if (!canUseAdmin) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchGameCatalogAdmin(adminApiKey.trim());
      setGames(res.data?.games || []);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load games"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseAdmin]);

  function saveKey() {
    setSavingKey(true);
    try {
      localStorage.setItem("MASTER_ADMIN_API", adminApiKey.trim());
    } finally {
      setSavingKey(false);
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(game) {
    setForm({
      ...EMPTY_FORM,
      ...game,
      _id: game._id,
      sortOrder: Number(game.sortOrder ?? 0),
      enabled: !!game.enabled,
    });
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
    setForm(EMPTY_FORM);
  }

  async function submit() {
    setError("");
    try {
      const payload = {
        key: form.key,
        name: form.name,
        category: form.category,
        type: form.type,
        enabled: !!form.enabled,
        sortOrder: Number(form.sortOrder || 0),
        badge: form.badge,
        logoUrl: form.logoUrl,
        charImageUrl: form.charImageUrl,
        backgroundUrl: form.backgroundUrl,
        onClickPath: form.onClickPath,
        externalUrl: form.externalUrl,
        softapiGameUid: form.softapiGameUid,
      };

      if (isEdit) {
        await updateGameCatalogAdmin(adminApiKey.trim(), form._id, payload);
      } else {
        await createGameCatalogAdmin(adminApiKey.trim(), payload);
      }
      await load();
      closeDialog();
    } catch (e) {
      setError(
        e?.response?.data?.error || e?.response?.data?.message || e?.message || "Save failed"
      );
    }
  }

  async function remove(game) {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Delete "${game.name}"?`);
    if (!ok) return;
    setError("");
    try {
      await deleteGameCatalogAdmin(adminApiKey.trim(), game._id);
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.error || e?.response?.data?.message || e?.message || "Delete failed"
      );
    }
  }

  async function quickToggle(game) {
    setError("");
    try {
      await updateGameCatalogAdmin(adminApiKey.trim(), game._id, {
        enabled: !game.enabled,
      });
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.error || e?.response?.data?.message || e?.message || "Update failed"
      );
    }
  }

  async function seedDefaults() {
    if (!canUseAdmin) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      "Seed default games into MongoDB?\n\nIf keys already exist, those items will fail and you can ignore them."
    );
    if (!ok) return;

    setLoading(true);
    setError("");
    try {
      for (const g of DEFAULT_SEED_GAMES) {
        // eslint-disable-next-line no-await-in-loop
        await createGameCatalogAdmin(adminApiKey.trim(), g);
      }
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Seeding failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <div className={classes.titleWrap}>
            <Typography style={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>
              Master Admin · Games Manager
            </Typography>
            <Typography className={classes.muted} style={{ fontSize: 12 }}>
              Manage your Home page games from MongoDB (AdminAPI protected).
            </Typography>
          </div>

          <Box display="flex" alignItems="center" gridGap={8} flexWrap="wrap">
            <IconButton onClick={load} disabled={!canUseAdmin || loading} title="Refresh">
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              onClick={openCreate}
              disabled={!canUseAdmin}
              startIcon={<AddIcon />}
            >
              Add Game
            </Button>
          </Box>
        </div>

        <Paper className={classes.card} elevation={0}>
          <Typography style={{ fontWeight: 800, color: "#111827" }}>
            Admin API Key
          </Typography>
          <Typography className={classes.muted} style={{ fontSize: 12, marginTop: 4 }}>
            Enter your `AdminAPI` (from backend `config.env`) once. It’s stored in
            localStorage as `MASTER_ADMIN_API`.
          </Typography>

          <Box mt={1} display="flex" gridGap={10} flexWrap="wrap" alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              label="AdminAPI"
              value={adminApiKey}
              onChange={(e) => setAdminApiKey(e.target.value)}
              style={{ minWidth: 320 }}
            />
            <Button
              variant="contained"
              onClick={saveKey}
              disabled={!adminApiKey.trim() || savingKey}
              startIcon={<SaveIcon />}
            >
              Save Key
            </Button>
          </Box>

          {error ? (
            <Box mt={1}>
              <Typography style={{ color: "#B91C1C", fontSize: 13 }}>{error}</Typography>
            </Box>
          ) : null}

          <div className={classes.filters}>
            <Box display="flex" alignItems="center" gridGap={10} flexWrap="wrap">
              <TextField
                variant="outlined"
                size="small"
                label="Search (name/key)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ minWidth: 260 }}
              />

              <TextField
                variant="outlined"
                size="small"
                label="Category"
                select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ minWidth: 180 }}
              >
                <MenuItem value="all">All</MenuItem>
                {CATEGORY_OPTIONS.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="flex" alignItems="center" gridGap={12} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Switch
                    checked={showDisabled}
                    onChange={(e) => setShowDisabled(e.target.checked)}
                    color="primary"
                  />
                }
                label={showDisabled ? "Show disabled" : "Hide disabled"}
              />
              <Typography className={classes.muted} style={{ fontSize: 12 }}>
                Total: {counts.total} · Enabled: {counts.enabled} · Disabled: {counts.disabled}
              </Typography>
            </Box>
          </div>
        </Paper>

        <Box mt={2}>
          {!canUseAdmin ? (
            <Paper className={classes.card} elevation={0}>
              <Typography style={{ fontWeight: 700, color: "#0F172A" }}>
                Enter AdminAPI to manage games.
              </Typography>
            </Paper>
          ) : loading ? (
            <Paper className={classes.card} elevation={0}>
              <Typography>Loading…</Typography>
            </Paper>
          ) : (
            <div className={classes.grid}>
              {filteredGames.length === 0 ? (
                <Paper className={classes.card} elevation={0}>
                  <Typography style={{ fontWeight: 800, color: "#0F172A" }}>
                    No games found.
                  </Typography>
                  <Typography className={classes.muted} style={{ fontSize: 12, marginTop: 6 }}>
                    If this is your first time, seed a default set and then edit/toggle as needed.
                  </Typography>
                  <Box mt={1} display="flex" gridGap={10} flexWrap="wrap">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={seedDefaults}
                      disabled={!canUseAdmin || loading}
                    >
                      Seed default games
                    </Button>
                    <Button onClick={openCreate} disabled={!canUseAdmin}>
                      Add one manually
                    </Button>
                  </Box>
                </Paper>
              ) : (
                filteredGames.map((g) => (
                  <Paper key={g._id} className={classes.card} elevation={0}>
                    <div className={classes.keyRow}>
                      <Typography style={{ fontWeight: 800, color: "#0F172A" }}>
                        {g.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gridGap={6}>
                        <IconButton size="small" onClick={() => openEdit(g)} title="Edit">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => remove(g)}
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </div>

                    <Typography className={classes.muted} style={{ fontSize: 12, marginTop: 6 }}>
                      key: {g.key} · category: {g.category} · type: {g.type} · sort:{" "}
                      {g.sortOrder ?? 0}
                    </Typography>

                    <Box mt={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!g.enabled}
                            onChange={() => quickToggle(g)}
                            color="primary"
                          />
                        }
                        label={g.enabled ? "Enabled" : "Disabled"}
                      />
                    </Box>

                    <Typography className={classes.miniLabel}>Logo</Typography>
                    <Box display="flex" alignItems="center" gridGap={10}>
                      <Box
                        style={{
                          width: 72,
                          height: 40,
                          background: "#F1F5F9",
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {g.logoUrl ? (
                          <img
                            src={g.logoUrl}
                            alt="logo"
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                          />
                        ) : (
                          <Typography className={classes.muted} style={{ fontSize: 11 }}>
                            —
                          </Typography>
                        )}
                      </Box>
                      <Typography className={classes.muted} style={{ fontSize: 11 }}>
                        {g.logoUrl ? "Custom URL" : "Not set"}
                      </Typography>
                    </Box>

                    <Typography className={classes.miniLabel}>Character</Typography>
                    <Box display="flex" alignItems="center" gridGap={10}>
                      <Box
                        style={{
                          width: 72,
                          height: 40,
                          background: "#F1F5F9",
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {g.charImageUrl ? (
                          <img
                            src={g.charImageUrl}
                            alt="character"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Typography className={classes.muted} style={{ fontSize: 11 }}>
                            —
                          </Typography>
                        )}
                      </Box>
                      <Typography className={classes.muted} style={{ fontSize: 11 }}>
                        {g.charImageUrl ? "Custom URL" : "Not set"}
                      </Typography>
                    </Box>

                    <Typography className={classes.miniLabel}>Background</Typography>
                    <Box display="flex" alignItems="center" gridGap={10}>
                      <Box
                        style={{
                          width: 72,
                          height: 40,
                          background: "#F1F5F9",
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          backgroundImage: g.backgroundUrl ? `url(${g.backgroundUrl})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {!g.backgroundUrl ? (
                          <Typography className={classes.muted} style={{ fontSize: 11 }}>
                            —
                          </Typography>
                        ) : null}
                      </Box>
                      <Typography className={classes.muted} style={{ fontSize: 11 }}>
                        {g.backgroundUrl ? "Custom URL" : "Not set"}
                      </Typography>
                    </Box>
                  </Paper>
                )))}
            </div>
          )}
        </Box>
      </div>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{isEdit ? "Edit Game" : "Add Game"}</DialogTitle>
        <DialogContent dividers>
          {error ? (
            <Box mb={1}>
              <Typography style={{ color: "#B91C1C", fontSize: 13 }}>{error}</Typography>
            </Box>
          ) : null}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Key (unique)"
                value={form.key}
                onChange={(e) => setForm((p) => ({ ...p, key: e.target.value }))}
                helperText="If empty, backend auto-generates from name."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Category"
                select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                helperText="This must match Home tab ids"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Type"
                select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                helperText="Featured uses bigger styling (sports)"
              >
                {TYPE_OPTIONS.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Sort order"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Logo URL"
                value={form.logoUrl}
                onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Character Image URL"
                value={form.charImageUrl}
                onChange={(e) => setForm((p) => ({ ...p, charImageUrl: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Background URL"
                value={form.backgroundUrl}
                onChange={(e) => setForm((p) => ({ ...p, backgroundUrl: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Badge (optional)"
                value={form.badge}
                onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="On click path (internal)"
                value={form.onClickPath}
                onChange={(e) => setForm((p) => ({ ...p, onClickPath: e.target.value }))}
                helperText="Example: /cricket"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="External URL (optional)"
                value={form.externalUrl}
                onChange={(e) => setForm((p) => ({ ...p, externalUrl: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="iGaming Game ID (for launch)"
                placeholder="e.g. 4-GP9W or numeric id"
                value={form.softapiGameUid}
                onChange={(e) => setForm((p) => ({ ...p, softapiGameUid: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form.enabled}
                    onChange={(e) => setForm((p) => ({ ...p, enabled: e.target.checked }))}
                    color="primary"
                  />
                }
                label={form.enabled ? "Enabled" : "Disabled"}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={submit}
            variant="contained"
            color="primary"
            disabled={!form.name || !form.category}
          >
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

