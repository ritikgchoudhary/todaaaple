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
    Button,
    Typography,
    Switch,
    Avatar,
    Box,
    CircularProgress
} from "@material-ui/core";
import axios from "axios";

import { url } from "../../api/auth";

const ProviderManagement = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProviders = async () => {
        try {
            const { data } = await axios.get(`${url}/admin/providers`);
            setProviders(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching providers", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await axios.put(`${url}/admin/providers/${id}/status`, { status: newStatus });
            fetchProviders();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    return (
        <AdminLayout>
            <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" style={{ fontWeight: 600, color: "#1e293b" }}>
                    Provider Management
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Total Providers: {providers.length}
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                    <Table>
                        <TableHead style={{ backgroundColor: "#f8fafc" }}>
                            <TableRow>
                                <TableCell style={{ fontWeight: 600 }}>ID</TableCell>
                                <TableCell style={{ fontWeight: 600 }}>Logo</TableCell>
                                <TableCell style={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell style={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell style={{ fontWeight: 600 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {providers.map((row) => (
                                <TableRow key={row._id} hover>
                                    <TableCell>{row.brand_id}</TableCell>
                                    <TableCell>
                                        <Avatar variant="rounded" src={row.brand_img} alt={row.brand_title}>
                                            {row.brand_title?.charAt(0)}
                                        </Avatar>
                                    </TableCell>
                                    <TableCell style={{ fontWeight: 500 }}>{row.brand_title}</TableCell>
                                    <TableCell>
                                        <span
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                fontSize: "0.75rem",
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
                                            onChange={() => toggleStatus(row.brand_id, row.status)}
                                            color="primary"
                                            inputProps={{ 'aria-label': 'toggle status' }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </AdminLayout>
    );
};

export default ProviderManagement;
