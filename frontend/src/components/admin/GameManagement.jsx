import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Switch,
    Box,
    CircularProgress,
    TextField,
    MenuItem,
    Avatar,
    TablePagination
} from "@material-ui/core";
import axios from "axios";

import { url } from "../../api/auth";

const GameManagement = () => {
    const [games, setGames] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterProvider, setFilterProvider] = useState("");
    const [search, setSearch] = useState("");
    const [totalGames, setTotalGames] = useState(0);

    const fetchProviders = async () => {
        try {
            const { data } = await axios.get(`${url}/admin/providers`);
            setProviders(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchGames = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${url}/admin/games?page=${page}&limit=20&search=${search}&provider_id=${filterProvider}`);
            setGames(data.games);
            setTotalPages(data.totalPages);
            setTotalGames(data.totalGames);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching games", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchGames();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [page, filterProvider, search]);

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await axios.put(`${url}/admin/games/${id}/status`, { status: newStatus });
            fetchGames();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const updateCategory = async (id, newCategory) => {
        try {
            await axios.put(`${url}/admin/games/${id}/info`, { category: newCategory });
            fetchGames();
        } catch (error) {
            console.error("Error updating category", error);
        }
    };

    return (
        <AdminLayout>
            <Box mb={3}>
                <Typography variant="h5" style={{ fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>
                    Game Management
                </Typography>

                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                    <TextField
                        label="Search Game"
                        variant="outlined"
                        size="small"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ backgroundColor: "#fff", minWidth: 250 }}
                    />
                    <TextField
                        select
                        label="Filter by Provider"
                        variant="outlined"
                        size="small"
                        value={filterProvider}
                        onChange={(e) => { setFilterProvider(e.target.value); setPage(1); }}
                        style={{ backgroundColor: "#fff", minWidth: 200 }}
                    >
                        <MenuItem value="">All Providers</MenuItem>
                        {providers.map((p) => (
                            <MenuItem key={p.brand_id} value={p.brand_id}>{p.brand_title}</MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Typography variant="body2" color="textSecondary">
                    Found {totalGames} games
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                        <Table size="small">
                            <TableHead style={{ backgroundColor: "#f8fafc" }}>
                                <TableRow>
                                    <TableCell style={{ fontWeight: 600 }}>ID</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Image</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Name</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Category</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Provider ID</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell style={{ fontWeight: 600 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {games.map((row) => (
                                    <TableRow key={row._id} hover>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>
                                            <Avatar variant="rounded" src={row.game_img} alt={row.game_name}>{row.game_name?.charAt(0)}</Avatar>
                                        </TableCell>
                                        <TableCell style={{ fontWeight: 500 }}>{row.game_name}</TableCell>
                                        <TableCell>
                                            <TextField
                                                select
                                                value={row.category || ""}
                                                onChange={(e) => updateCategory(row.id, e.target.value)}
                                                variant="standard"
                                                size="small"
                                                style={{ minWidth: 120 }}
                                            >
                                                <MenuItem value="sports">Sports</MenuItem>
                                                <MenuItem value="casino">Live Casino</MenuItem>
                                                <MenuItem value="crash">Crash Game</MenuItem>
                                                <MenuItem value="slot">Slot Game</MenuItem>
                                                <MenuItem value="lottery">Lottery</MenuItem>
                                                <MenuItem value="cards">Card Game</MenuItem>
                                                <MenuItem value="chess">Chess</MenuItem>
                                                <MenuItem value="table">Table</MenuItem>
                                                <MenuItem value="XGames">XGames</MenuItem>
                                            </TextField>
                                        </TableCell>
                                        <TableCell>{row.brand_id}</TableCell>
                                        <TableCell>
                                            <span
                                                style={{
                                                    padding: "2px 6px",
                                                    borderRadius: "8px",
                                                    fontSize: "0.7rem",
                                                    backgroundColor: row.status === 1 ? "#dcfce7" : "#fee2e2",
                                                    color: row.status === 1 ? "#166534" : "#991b1b",
                                                    fontWeight: 600
                                                }}
                                            >
                                                {row.status === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={row.status === 1}
                                                onChange={() => toggleStatus(row.id, row.status)}
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[20]}
                            component="div"
                            count={totalGames}
                            rowsPerPage={20}
                            page={page - 1} // zero-based
                            onPageChange={(e, newPage) => setPage(newPage + 1)}
                        />
                    </TableContainer>
                </>
            )}
        </AdminLayout>
    );
};

export default GameManagement;
