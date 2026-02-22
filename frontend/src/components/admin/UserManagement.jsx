import React, { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Block as BlockIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
} from "@material-ui/icons";
import AdminLayout from "./AdminLayout";
import { fetchAllUsers, updateUser } from "../../api/admin";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(3),
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid #E2E8F0",
    },
    searchField: {
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "#F1F5F9",
        },
    },
    tableHead: {
        backgroundColor: "#F8FAFC",
        "& th": {
            fontWeight: 700,
            color: "#475569",
        },
    },
    actionBtn: {
        marginRight: theme.spacing(1),
        borderRadius: "8px",
        textTransform: "none",
    },
}));

const UserManagement = () => {
    const classes = useStyles();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(true);

    const getUsers = async () => {
        setLoading(true);
        try {
            const response = await fetchAllUsers();
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const handleSync = () => {
        getUsers();
    };


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleOpenUser = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const filteredUsers = users.filter(u =>
        u.phone.includes(searchTerm) || u.id.toString().includes(searchTerm)
    );

    return (
        <AdminLayout>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <div>
                    <Typography variant="h5" style={{ fontWeight: 800, color: "#0F172A" }}>
                        User Management
                    </Typography>
                    <Typography variant="body2" style={{ color: "#64748B" }}>
                        View and manage all registered players on your platform.
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={handleSync}
                    style={{ backgroundColor: "#10B9B1", borderRadius: "10px", textTransform: "none" }}
                >
                    Sync Users
                </Button>
            </Box>

            <Paper className={classes.paper}>
                <Box mb={3}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by ID or Phone number..."
                        className={classes.searchField}
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "#94A3B8" }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead className={classes.tableHead}>
                            <TableRow>
                                <TableCell>User ID</TableCell>
                                <TableCell>Phone No.</TableCell>
                                <TableCell>Balance</TableCell>
                                <TableCell>Joined Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell style={{ fontWeight: 600 }}>{user.id}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell style={{ fontWeight: 700, color: "#10B9B1" }}>₹{user.balance.toFixed(2)}</TableCell>
                                    <TableCell>{user.date}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status}
                                            size="small"
                                            style={{
                                                backgroundColor: user.status === "Active" ? "#DCFCE7" : "#FEE2E2",
                                                color: user.status === "Active" ? "#15803D" : "#B91C1C",
                                                fontWeight: "bold"
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" className={classes.actionBtn} onClick={() => handleOpenUser(user)}>
                                            <ViewIcon style={{ color: "#3B82F6" }} />
                                        </IconButton>
                                        <IconButton size="small" className={classes.actionBtn}>
                                            <EditIcon style={{ color: "#10B9B1" }} />
                                        </IconButton>
                                        <IconButton size="small" className={classes.actionBtn}>
                                            <BlockIcon style={{ color: "#EF4444" }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* User Details Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle style={{ fontWeight: 800 }}>User Details: {selectedUser?.id}</DialogTitle>
                <DialogContent dividers>
                    {selectedUser && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Phone Number</Typography>
                                <Typography variant="body1" style={{ fontWeight: 600 }}>{selectedUser.phone}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Current Balance</Typography>
                                <Typography variant="body1" style={{ fontWeight: 600, color: "#10B9B1" }}>₹{selectedUser.balance.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider style={{ margin: "10px 0" }} />
                                <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 10 }}>Quick Actions</Typography>
                                <Box display="flex" gap={1}>
                                    <Button variant="outlined" size="small" style={{ borderRadius: 8 }}>Add Funds</Button>
                                    <Button variant="outlined" size="small" style={{ borderRadius: 8 }}>Reset Password</Button>
                                    <Button variant="contained" size="small" color="secondary" style={{ borderRadius: 8 }}>Block Account</Button>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

export default UserManagement;
