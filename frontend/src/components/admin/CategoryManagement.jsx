import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import {
    Paper,
    Typography,
    Box,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    InputAdornment,
    Tabs,
    Tab
} from "@material-ui/core";
import {
    SportsEsports as SportsIcon,
    Casino as CasinoIcon,
    Timeline as CrashIcon,
    LocalActivity as LotteryIcon,
    ViewModule as SlotIcon,
    Style as CardIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Business as ProviderIcon,
    Edit as EditIcon
} from "@material-ui/icons";
import axios from "axios";
import { url } from "../../api/auth";

const CATEGORIES = [
    { id: 'sports', label: 'Sports', icon: <SportsIcon /> },
    { id: 'casino', label: 'Live Casino', icon: <CasinoIcon /> },
    { id: 'crash', label: 'Crash Game', icon: <CrashIcon /> },
    { id: 'slot', label: 'Slot Game', icon: <SlotIcon /> },
    { id: 'lottery', label: 'Lottery', icon: <LotteryIcon /> },
    { id: 'cards', label: 'Card Game', icon: <CardIcon /> },
];

const CategoryManagement = () => {
    const [selectedCat, setSelectedCat] = useState('sports');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAddDialog, setOpenAddDialog] = useState(false);

    // Stats
    const [totalGames, setTotalGames] = useState(0);

    // Search for Main Table
    const [mainSearch, setMainSearch] = useState("");

    // Removal State
    const [selectedRemoveGames, setSelectedRemoveGames] = useState([]);

    // Dialog State
    const [dialogGames, setDialogGames] = useState([]);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [providerFilter, setProviderFilter] = useState("");
    const [providers, setProviders] = useState([]);
    const [selectedGames, setSelectedGames] = useState([]);
    const [tab, setTab] = useState(0);

    // Provider Assignment State
    const [openProviderDialog, setOpenProviderDialog] = useState(false);
    const [selectedProviderToAssign, setSelectedProviderToAssign] = useState("");
    const [assigningProvider, setAssigningProvider] = useState(false);

    // Edit Game State
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [editName, setEditName] = useState("");
    const [editImage, setEditImage] = useState("");

    // Fetch games assigned to current category
    const fetchCategoryGames = async () => {
        setLoading(true);
        try {
            // Use server-side filtering and limiting to improve performance
            // Limit to 100 to prevent UI lag with large datasets (e.g. 3000 games)
            const params = new URLSearchParams();
            params.append('category', selectedCat);
            params.append('limit', '1000'); // Increased limit to track providers better
            if (mainSearch) {
                params.append('search', mainSearch);
            }

            const { data } = await axios.get(`${url}/admin/games?${params.toString()}`);
            setGames(data.games);
            setTotalGames(data.totalGames || 0);

            // Clear selection when category changes or refreshes to avoid stale selections
            setSelectedRemoveGames([]);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching games", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCategoryGames();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [selectedCat, mainSearch]);

    // Fetch Providers for filter
    useEffect(() => {
        axios.get(`${url}/admin/providers`).then(res => {
            // Deduplicate providers based on brand_title
            const uniqueProviders = [];
            const seen = new Set();
            (res.data || []).forEach(p => {
                if (p.brand_title && !seen.has(p.brand_title)) {
                    seen.add(p.brand_title);
                    uniqueProviders.push(p);
                }
            });
            setProviders(uniqueProviders);
        }).catch(console.error);
    }, []);

    // Fetch games for dialog with server-side filtering
    useEffect(() => {
        if (!openAddDialog) return;

        const fetchDialogGames = async () => {
            setDialogLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', '500'); // Fetch enough for bulk selection
                if (search) params.append('search', search);
                if (providerFilter) params.append('provider_id', providerFilter);

                const { data } = await axios.get(`${url}/admin/games?${params.toString()}`);

                // Remove games that are already in the target category (Client-side filter needed as backend supports equality only)
                const available = data.games.filter(g => g.category !== selectedCat);

                // Deduplicate games with same name
                const uniqueGames = [];
                const seenNames = new Set();
                available.forEach(game => {
                    const normalizedName = game.game_name.trim();
                    if (!seenNames.has(normalizedName)) {
                        seenNames.add(normalizedName);
                        uniqueGames.push(game);
                    }
                });

                setDialogGames(uniqueGames);
            } catch (error) {
                console.error(error);
            } finally {
                setDialogLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchDialogGames();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [openAddDialog, search, providerFilter, selectedCat]);


    const handleOpenAddDialog = () => {
        setOpenAddDialog(true);
        setSearch("");
        setProviderFilter("");
        setSelectedGames([]);
    };

    const handleUnassign = async (gameId) => {
        if (window.confirm("Are you sure you want to remove this game from this category?")) {
            try {
                await axios.put(`${url}/admin/games/${gameId}/info`, { category: "" }); // Clear category
                fetchCategoryGames();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleBulkUnassign = async () => {
        if (selectedRemoveGames.length === 0) return;
        if (window.confirm(`Are you sure you want to remove ${selectedRemoveGames.length} games from ${CATEGORIES.find(c => c.id === selectedCat)?.label}?`)) {
            try {
                await axios.put(`${url}/admin/games/category/bulk`, {
                    gameIds: selectedRemoveGames,
                    category: ""
                });
                fetchCategoryGames();
            } catch (e) {
                console.error(e);
                alert("Failed to unassign games");
            }
        }
    };

    const handleAssignGames = async () => {
        if (selectedGames.length === 0) return;
        try {
            await axios.put(`${url}/admin/games/category/bulk`, {
                gameIds: selectedGames,
                category: selectedCat
            });
            setOpenAddDialog(false);
            setSelectedGames([]);
            fetchCategoryGames();
        } catch (e) {
            console.error(e);
            alert("Failed to assign games");
        }
    }

    // --- Bulk Assign Provider Logic ---
    const handleAssignProvider = async () => {
        if (!selectedProviderToAssign) return;
        setAssigningProvider(true);
        try {
            // 1. Fetch ALL games for this provider
            const params = new URLSearchParams();
            params.append('provider_id', selectedProviderToAssign);
            params.append('limit', '10000'); // Fetch all

            const { data } = await axios.get(`${url}/admin/games?${params.toString()}`);
            const providerGames = data.games || [];

            if (providerGames.length === 0) {
                alert("No games found for this provider.");
                setAssigningProvider(false);
                return;
            }

            const gameIds = providerGames.map(g => g.id);

            // 2. Bulk Assign
            await axios.put(`${url}/admin/games/category/bulk`, {
                gameIds: gameIds,
                category: selectedCat
            });

            alert(`Successfully assigned ${gameIds.length} games to ${CATEGORIES.find(c => c.id === selectedCat)?.label}`);
            setOpenProviderDialog(false);
            fetchCategoryGames();
        } catch (e) {
            console.error(e);
            alert("Failed to assign provider games.");
        } finally {
            setAssigningProvider(false);
        }
    };

    // --- Bulk Unassign Provider Logic ---
    const handleUnassignProvider = async (providerId, providerName) => {
        if (!window.confirm(`Remove ALL ${providerName} games from ${CATEGORIES.find(c => c.id === selectedCat)?.label}?`)) return;
        setAssigningProvider(true);
        try {
            // 1. Fetch only games for this provider that are in the current category
            const params = new URLSearchParams();
            params.append('provider_id', providerId);
            params.append('category', selectedCat);
            params.append('limit', '10000');

            const { data } = await axios.get(`${url}/admin/games?${params.toString()}`);
            const gameIds = (data.games || []).map(g => g.id);

            if (gameIds.length === 0) {
                alert("No games found to remove.");
                setAssigningProvider(false);
                return;
            }

            // 2. Bulk Unassign
            await axios.put(`${url}/admin/games/category/bulk`, {
                gameIds: gameIds,
                category: ""
            });

            alert(`Successfully removed ${gameIds.length} games.`);
            fetchCategoryGames();
        } catch (e) {
            console.error(e);
            alert("Failed to remove provider.");
        } finally {
            setAssigningProvider(false);
        }
    };

    // --- Edit Game Logic ---
    const handleEditGame = (game) => {
        setEditingGame(game);
        setEditName(game.game_name);
        setEditImage(game.game_img);
        setEditDialogOpen(true);
    };

    const handleSaveGame = async () => {
        if (!editingGame) return;
        try {
            await axios.put(`${url}/admin/games/${editingGame.id}/info`, {
                game_name: editName,
                game_img: editImage
            });
            alert("Game updated successfully");
            setEditDialogOpen(false);
            fetchCategoryGames();
        } catch (e) {
            console.error(e);
            alert("Failed to update game");
        }
    };

    // --- Dialog Selection Logic ---
    const toggleGameSelection = (id) => {
        if (selectedGames.includes(id)) {
            setSelectedGames(previous => previous.filter(gId => gId !== id));
        } else {
            setSelectedGames(previous => [...previous, id]);
        }
    };

    const selectSingleGame = (id) => {
        // Exclusive selection when clicking the row
        setSelectedGames([id]);
    };

    const handleSelectAllDialog = (e) => {
        if (e.target.checked) {
            const allIds = dialogGames.map(g => g.id);
            const newSet = new Set([...selectedGames, ...allIds]);
            setSelectedGames(Array.from(newSet));
        } else {
            const visibleIds = dialogGames.map(g => g.id);
            setSelectedGames(previous => previous.filter(id => !visibleIds.includes(id)));
        }
    };

    const allDialogVisibleSelected = dialogGames.length > 0 && dialogGames.every(g => selectedGames.includes(g.id));

    // --- Main Table Removal Selection Logic ---
    const toggleRemoveSelection = (id) => {
        if (selectedRemoveGames.includes(id)) {
            setSelectedRemoveGames(previous => previous.filter(gId => gId !== id));
        } else {
            setSelectedRemoveGames(previous => [...previous, id]);
        }
    };

    const handleSelectAllRemove = (e) => {
        if (e.target.checked) {
            const allIds = games.map(g => g.id);
            setSelectedRemoveGames(allIds);
        } else {
            setSelectedRemoveGames([]);
        }
    };

    const allRemoveVisibleSelected = games.length > 0 && games.every(g => selectedRemoveGames.includes(g.id));


    return (
        <AdminLayout>
            <Box display="flex" height="calc(100vh - 100px)">
                {/* Left Sidebar: Categories */}
                <Paper style={{ width: 250, borderRight: '1px solid #eee', overflowY: 'auto' }}>
                    <List component="nav">
                        {CATEGORIES.map((cat) => (
                            <ListItem
                                button
                                key={cat.id}
                                selected={selectedCat === cat.id}
                                onClick={() => setSelectedCat(cat.id)}
                                style={{ borderLeft: selectedCat === cat.id ? '4px solid #10B9B0' : '4px solid transparent' }}
                            >
                                <ListItemIcon style={{ color: selectedCat === cat.id ? '#10B9B0' : 'inherit' }}>{cat.icon}</ListItemIcon>
                                <ListItemText primary={cat.label} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Right Content: Games List */}
                <Box flex={1} p={3} overflow="auto">
                    {/* Header with Title and Tabs */}
                    <Box mb={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box>
                                <Typography variant="h5" style={{ fontWeight: 600 }}>
                                    {CATEGORIES.find(c => c.id === selectedCat)?.label} Games
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Showing {games.length} of {totalGames} Result(s)
                                </Typography>
                            </Box>
                        </Box>

                        <Tabs
                            value={tab}
                            onChange={(e, v) => setTab(v)}
                            indicatorColor="primary"
                            textColor="primary"
                            style={{ borderBottom: '1px solid #ddd' }}
                        >
                            <Tab label="Manage Providers" />
                            <Tab label="Manage Games" />
                        </Tabs>
                    </Box>

                    {/* TAB 0: PROVIDERS MANAGEMENT */}
                    {tab === 0 && (
                        <Grid container spacing={2}>
                            {providers.map(p => {
                                // Check if this provider has any games in the current fetched list
                                const isActive = games.some(g => g.brand_id == p.brand_id);
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={p.brand_id}>
                                        <Paper style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: isActive ? '1px solid #10B9B0' : '1px solid #eee' }}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar src={p.brand_img} variant="square" />
                                                <Box>
                                                    <Typography variant="subtitle2">{p.brand_title}</Typography>
                                                    <Typography variant="caption" color={isActive ? "primary" : "textSecondary"}>
                                                        {isActive ? "Active in Category" : "Not Assigned"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box>
                                                {isActive ? (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="secondary"
                                                        onClick={() => handleUnassignProvider(p.brand_id, p.brand_title)}
                                                    >
                                                        Remove
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        style={{ backgroundColor: '#10B9B0' }}
                                                        onClick={() => { setSelectedProviderToAssign(p.brand_id); handleAssignProvider(); }}
                                                    >
                                                        Add
                                                    </Button>
                                                )}
                                            </Box>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}

                    {/* TAB 1: GAMES MANAGEMENT (Original View) */}
                    {tab === 1 && (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Box display="flex" gap={2} alignItems="center">
                                    <TextField
                                        placeholder="Search Assigned..."
                                        variant="outlined"
                                        size="small"
                                        value={mainSearch}
                                        onChange={(e) => setMainSearch(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        style={{ width: 200 }}
                                    />

                                    {selectedRemoveGames.length > 0 && (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            startIcon={<DeleteIcon />}
                                            onClick={handleBulkUnassign}
                                        >
                                            Remove ({selectedRemoveGames.length})
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenAddDialog}
                                        style={{ backgroundColor: "#10B9B0" }}
                                    >
                                        Assign Games
                                    </Button>
                                </Box>
                            </Box>

                            {loading ? (
                                <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                            ) : (
                                <TableContainer component={Paper} elevation={0} style={{ border: '1px solid #eee' }}>
                                    <Table>
                                        <TableHead style={{ backgroundColor: '#f8fafc' }}>
                                            <TableRow>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={allRemoveVisibleSelected}
                                                        onChange={handleSelectAllRemove}
                                                        color="primary"
                                                        disabled={games.length === 0}
                                                    />
                                                </TableCell>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Image</TableCell>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Provider</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {games.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">No games found for this category</TableCell>
                                                </TableRow>
                                            ) : (
                                                games.map((game) => (
                                                    <TableRow key={game.id} hover onClick={() => toggleRemoveSelection(game.id)} style={{ cursor: 'pointer' }}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={selectedRemoveGames.includes(game.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onChange={() => toggleRemoveSelection(game.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{game.id}</TableCell>
                                                        <TableCell>
                                                            <Avatar variant="square" src={game.game_img} alt={game.game_name} />
                                                        </TableCell>
                                                        <TableCell>{game.game_name}</TableCell>
                                                        <TableCell>
                                                            {providers.find(p => p.brand_id == game.brand_id)?.brand_title || game.brand_id}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                                startIcon={<EditIcon />}
                                                                style={{ marginRight: '5px' }}
                                                                onClick={(e) => { e.stopPropagation(); handleEditGame(game); }}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                color="secondary"
                                                                variant="outlined"
                                                                onClick={(e) => { e.stopPropagation(); handleUnassign(game.id); }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </Box>
            </Box>

            {/* Edit Game Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Game Details</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Game Name"
                            variant="outlined"
                            fullWidth
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                        <TextField
                            label="Image URL"
                            variant="outlined"
                            fullWidth
                            value={editImage}
                            onChange={(e) => setEditImage(e.target.value)}
                            helperText="Paste the new image URL here"
                        />
                        {editImage && (
                            <Box display="flex" justifyContent="center" mt={2} p={2} border="1px dashed #ccc">
                                <img src={editImage} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%' }} />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveGame} color="primary" variant="contained">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Games Dialog */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Assign Games to {CATEGORIES.find(c => c.id === selectedCat)?.label}</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" gap={2} mb={2}>
                        <TextField
                            label="Search Games"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <TextField
                            select
                            label="Provider"
                            variant="outlined"
                            size="small"
                            style={{ minWidth: 200 }}
                            value={providerFilter}
                            onChange={(e) => setProviderFilter(e.target.value)}
                        >
                            <MenuItem value="">All Providers</MenuItem>
                            {Array.from(new Map(providers.map(p => [p.brand_title, p])).values()).map(p => (
                                <MenuItem key={p.brand_id} value={p.brand_id}>{p.brand_title}</MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {dialogLoading ? (
                        <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                    ) : (
                        <Box height="400px" overflow="auto">
                            <TableContainer>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={allDialogVisibleSelected}
                                                    onChange={handleSelectAllDialog}
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Provider</TableCell>
                                            <TableCell>Current Category</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dialogGames.map(game => (
                                            <TableRow key={game.id} hover onClick={() => selectSingleGame(game.id)} style={{ cursor: 'pointer' }}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedGames.includes(game.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={() => toggleGameSelection(game.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar src={game.game_img} style={{ width: 24, height: 24 }} />
                                                        {game.game_name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {providers.find(p => p.brand_id == game.brand_id)?.brand_title || game.brand_id}
                                                </TableCell>
                                                <TableCell>{game.category || "-"}</TableCell>
                                            </TableRow>
                                        ))}
                                        {dialogGames.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No games found. Try adjusting filters.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                    <Box mt={2}>
                        <Typography variant="body2">
                            {selectedGames.length} games selected
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleAssignGames}
                        variant="contained"
                        color="primary"
                        style={{ backgroundColor: "#10B9B0" }}
                        disabled={selectedGames.length === 0}
                    >
                        Assign Selected
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Provider Dialog */}
            <Dialog open={openProviderDialog} onClose={() => setOpenProviderDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bulk Assign Provider to {CATEGORIES.find(c => c.id === selectedCat)?.label}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Select a provider to assign ALL its games to this category. This is useful for quickly setting up categories like "Slots" or "Live Casino" based on providers.
                    </Typography>
                    <TextField
                        select
                        label="Select Provider"
                        variant="outlined"
                        fullWidth
                        value={selectedProviderToAssign}
                        onChange={(e) => setSelectedProviderToAssign(e.target.value)}
                    >
                        {Array.from(new Map(providers.map(p => [p.brand_title, p])).values()).map(p => (
                            <MenuItem key={p.brand_id} value={p.brand_id}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    {p.brand_title}
                                    <Typography variant="caption" color="textSecondary">({p.game_count || 'Unknown'} games)</Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenProviderDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleAssignProvider}
                        color="primary"
                        variant="contained"
                        disabled={!selectedProviderToAssign || assigningProvider}
                        style={{ backgroundColor: "#10B9B0" }}
                    >
                        {assigningProvider ? <CircularProgress size={24} /> : "Assign All Games"}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

export default CategoryManagement;
