import React, { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Tabs,
    Tab,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Check as CheckIcon,
    Close as CloseIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
} from "@material-ui/icons";
import AdminLayout from "./AdminLayout";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(3),
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid #E2E8F0",
    },
    tableHead: {
        backgroundColor: "#F8FAFC",
        "& th": {
            fontWeight: 700,
            color: "#475569",
        },
    },
    approveBtn: {
        backgroundColor: "#DCFCE7",
        color: "#15803D",
        marginRight: theme.spacing(1),
        "&:hover": { backgroundColor: "#BBF7D0" },
    },
    rejectBtn: {
        backgroundColor: "#FEE2E2",
        color: "#B91C1C",
        "&:hover": { backgroundColor: "#FECACA" },
    },
}));

const WithdrawalManagement = () => {
    const classes = useStyles();
    const [withdrawals, setWithdrawals] = useState([]);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        // Mock data for withdrawals
        setWithdrawals([
            { _id: "w1", id: 5001, userId: 1001, amount: 1500, status: "Pending", date: "2023-11-20 14:30", method: "UPI" },
            { _id: "w2", id: 5002, userId: 1003, amount: 250, status: "Success", date: "2023-11-20 12:15", method: "Bank" },
            { _id: "w3", id: 5003, userId: 1002, amount: 5000, status: "Rejected", date: "2023-11-19 18:00", method: "UPI" },
        ]);
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const filteredWithdrawals = withdrawals.filter(w => {
        if (tabValue === 0) return w.status === "Pending";
        if (tabValue === 1) return w.status === "Success";
        if (tabValue === 2) return w.status === "Rejected";
        return true;
    });

    return (
        <AdminLayout>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <div>
                    <Typography variant="h5" style={{ fontWeight: 800, color: "#0F172A" }}>
                        Withdrawal Management
                    </Typography>
                    <Typography variant="body2" style={{ color: "#64748B" }}>
                        Approve or reject player withdrawal requests.
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    style={{ backgroundColor: "#10B9B1", borderRadius: "10px", textTransform: "none" }}
                >
                    Refresh Requests
                </Button>
            </Box>

            <Box mb={3}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    style={{ marginBottom: 20 }}
                >
                    <Tab label="Pending Requests" style={{ textTransform: "none", fontWeight: 600 }} />
                    <Tab label="Success History" style={{ textTransform: "none", fontWeight: 600 }} />
                    <Tab label="Rejected" style={{ textTransform: "none", fontWeight: 600 }} />
                </Tabs>
            </Box>

            <Paper className={classes.paper}>
                <TableContainer>
                    <Table>
                        <TableHead className={classes.tableHead}>
                            <TableRow>
                                <TableCell>Req ID</TableCell>
                                <TableCell>User ID</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Method</TableCell>
                                <TableCell>Date & Time</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredWithdrawals.map((withdraw) => (
                                <TableRow key={withdraw._id} hover>
                                    <TableCell style={{ fontWeight: 600 }}>{withdraw.id}</TableCell>
                                    <TableCell>{withdraw.userId}</TableCell>
                                    <TableCell style={{ fontWeight: 700, color: "#EF4444" }}>₹{withdraw.amount.toLocaleString()}</TableCell>
                                    <TableCell>{withdraw.method}</TableCell>
                                    <TableCell style={{ fontSize: "0.85rem", color: "#64748B" }}>{withdraw.date}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={withdraw.status}
                                            size="small"
                                            style={{
                                                backgroundColor: withdraw.status === "Pending" ? "#FEF3C7" : (withdraw.status === "Success" ? "#DCFCE7" : "#FEE2E2"),
                                                color: withdraw.status === "Pending" ? "#92400E" : (withdraw.status === "Success" ? "#15803D" : "#B91C1C"),
                                                fontWeight: "bold"
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {withdraw.status === "Pending" ? (
                                            <>
                                                <IconButton size="small" className={classes.approveBtn}>
                                                    <CheckIcon />
                                                </IconButton>
                                                <IconButton size="small" className={classes.rejectBtn}>
                                                    <CloseIcon />
                                                </IconButton>
                                            </>
                                        ) : (
                                            <IconButton size="small">
                                                <ViewIcon style={{ color: "#94A3B8" }} />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredWithdrawals.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" style={{ padding: "40px" }}>
                                        <Typography color="textSecondary">No withdrawal requests found for this status.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </AdminLayout>
    );
};

export default WithdrawalManagement;
