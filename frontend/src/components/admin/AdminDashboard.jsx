import React, { useState, useEffect } from "react";
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    AccountBalance as BankIcon,
    Payment as PaymentIcon,
} from "@material-ui/icons";
import axios from "axios";
import AdminLayout from "./AdminLayout";
import { fetchAdminStats } from "../../api/admin";

const useStyles = makeStyles((theme) => ({
    statCard: {
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid #E2E8F0",
        height: "100%",
    },
    statTitle: {
        color: "#64748B",
        fontSize: "0.875rem",
        fontWeight: 600,
        marginBottom: theme.spacing(1),
    },
    statValue: {
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "#0F172A",
    },
    iconBox: {
        padding: "10px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    tablePaper: {
        padding: theme.spacing(3),
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid #E2E8F0",
    },
}));

const AdminDashboard = () => {
    const classes = useStyles();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRecharge: 0,
        totalWithdrawal: 0,
        pendingWithdrawals: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStats = async () => {
            try {
                const response = await fetchAdminStats();
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        getStats();
    }, []);

    const StatCard = ({ title, value, icon, color, bgColor }) => (
        <Card className={classes.statCard}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <div>
                        <Typography className={classes.statTitle}>{title}</Typography>
                        <Typography className={classes.statValue}>{value}</Typography>
                    </div>
                    <Box className={classes.iconBox} style={{ backgroundColor: bgColor, color: color }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <AdminLayout>
            <Box mb={4}>
                <Typography variant="h5" style={{ fontWeight: 800, color: "#0F172A" }}>
                    Dashboard Overview
                </Typography>
                <Typography variant="body2" style={{ color: "#64748B" }}>
                    Welcome back, here's what's happening with your platform today.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL USERS"
                        value={stats.totalUsers}
                        icon={<PeopleIcon />}
                        color="#10B9B1"
                        bgColor="rgba(16, 185, 177, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL RECHARGE"
                        value={`₹${stats.totalRecharge.toLocaleString()} `}
                        icon={<TrendingUpIcon />}
                        color="#3B82F6"
                        bgColor="rgba(59, 130, 246, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="TOTAL WITHDRAWAL"
                        value={`₹${stats.totalWithdrawal.toLocaleString()} `}
                        icon={<BankIcon />}
                        color="#F59E0B"
                        bgColor="rgba(245, 158, 11, 0.1)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="PENDING WITHDRAWAL"
                        value={stats.pendingWithdrawals}
                        icon={<PaymentIcon />}
                        color="#EF4444"
                        bgColor="rgba(239, 68, 68, 0.1)"
                    />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper className={classes.tablePaper}>
                        <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 20 }}>
                            Recent Activity
                        </Typography>
                        <Divider style={{ marginBottom: 20 }} />
                        <Box py={5} textAlign="center">
                            <Typography color="textSecondary">Activity chart and logs will appear here.</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className={classes.tablePaper}>
                        <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 20 }}>
                            System Health
                        </Typography>
                        <Divider style={{ marginBottom: 20 }} />
                        <Box py={2}>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="body2">Server Status</Typography>
                                <Typography variant="body2" style={{ color: "#10B9B1", fontWeight: "bold" }}>Online</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="body2">Database</Typography>
                                <Typography variant="body2" style={{ color: "#10B9B1", fontWeight: "bold" }}>Connected</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="body2">Gateways</Typography>
                                <Typography variant="body2" style={{ color: "#10B9B1", fontWeight: "bold" }}>3 Active</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </AdminLayout>
    );
};

export default AdminDashboard;
