import React, { useState, useEffect } from "react";
import {
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    TextField,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
} from "@material-ui/core";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import * as api from "../../api/auth";

const CommissionManagement = () => {
    const [configs, setConfigs] = useState([]);
    const [agentConfigs, setAgentConfigs] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [newConfig, setNewConfig] = useState({
        type: 'direct',
        packagePrice: 0,
        amount: 0,
        percentage: 0,
        isPercentage: false,
        isActive: true
    });

    const URL = api.url;

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const adminApi = localStorage.getItem("MASTER_ADMIN_API") || "test";
            const res = await axios.get(`${URL}/admin/commission/configs/${adminApi}`);
            setConfigs(res.data.data);
            const agentRes = await axios.get(`${URL}/admin/commission/agents/${adminApi}`);
            setAgentConfigs(agentRes.data.data);
        } catch (error) {
            console.error("Error fetching configs:", error);
        }
    };

    const handleSaveConfig = async () => {
        try {
            const adminApi = localStorage.getItem("MASTER_ADMIN_API") || "test";
            if (editingConfig) {
                await axios.put(`${URL}/admin/commission/configs/${editingConfig._id}/${adminApi}`, editingConfig);
            } else {
                await axios.post(`${URL}/admin/commission/configs/${adminApi}`, newConfig);
            }
            setOpenDialog(false);
            setEditingConfig(null);
            fetchConfigs();
        } catch (error) {
            console.error("Error saving config:", error);
        }
    };

    const toggleConfigStatus = async (id, currentStatus) => {
        try {
            const adminApi = localStorage.getItem("MASTER_ADMIN_API") || "test";
            await axios.put(`${URL}/admin/commission/configs/${id}/${adminApi}`, { isActive: !currentStatus });
            fetchConfigs();
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    return (
        <AdminLayout title="Commission Management">
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <Typography variant="h6">Commission Rules</Typography>
                            <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
                                Add Rule
                            </Button>
                        </div>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Package Price</TableCell>
                                    <TableCell>Comm. Amount/ %</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {configs.map((config) => (
                                    <TableRow key={config._id}>
                                        <TableCell style={{ textTransform: 'capitalize' }}>
                                            {config.type.replace('_', ' ')} (Level {config.level || 1})
                                        </TableCell>
                                        <TableCell>₹{config.packagePrice || 0}</TableCell>
                                        <TableCell>
                                            {config.isPercentage ? `${config.percentage}%` : `₹${config.amount}`}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={config.isActive}
                                                onChange={() => toggleConfigStatus(config._id, config.isActive)}
                                                color="primary"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" onClick={() => { setEditingConfig(config); setOpenDialog(true); }}>Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper style={{ padding: '20px' }}>
                        <Typography variant="h6" style={{ marginBottom: '20px' }}>Agent-Specific Configs</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Agent ID</TableCell>
                                    <TableCell>KYC % (L1)</TableCell>
                                    <TableCell>Withdrawal % (L1)</TableCell>
                                    <TableCell>Upgrade Income</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {agentConfigs.map((agent) => (
                                    <TableRow key={agent._id}>
                                        <TableCell>{agent.userId}</TableCell>
                                        <TableCell>{agent.kycPercentage}%</TableCell>
                                        <TableCell>{agent.withdrawalPercentage}%</TableCell>
                                        <TableCell>{agent.isPercentageUpgrade ? `${agent.upgradePercentage}%` : 'Fixed'}</TableCell>
                                        <TableCell>
                                            <Button size="small">Manage</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {agentConfigs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No agent-specific configurations found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingConfig(null); }} maxWidth="sm" fullWidth>
                <DialogTitle>{editingConfig ? 'Edit Rule' : 'Add New Rule'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} style={{ paddingTop: '10px' }}>
                        <Grid item xs={6}>
                            <Typography variant="caption">Commission Type</Typography>
                            <Select
                                fullWidth
                                variant="outlined"
                                value={editingConfig ? editingConfig.type : newConfig.type}
                                onChange={(e) => editingConfig ? setEditingConfig({ ...editingConfig, type: e.target.value }) : setNewConfig({ ...newConfig, type: e.target.value })}
                            >
                                <MenuItem value="direct">Direct Registration</MenuItem>
                                <MenuItem value="agent_upgrade">Agent Upgrade Income</MenuItem>
                                <MenuItem value="agent_kyc">KYC Commission</MenuItem>
                                <MenuItem value="agent_withdrawal">Withdrawal Fee Commission</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption">Commission Level</Typography>
                            <Select
                                fullWidth
                                variant="outlined"
                                value={editingConfig ? editingConfig.level : newConfig.level || 1}
                                onChange={(e) => editingConfig ? setEditingConfig({ ...editingConfig, level: parseInt(e.target.value) }) : setNewConfig({ ...newConfig, level: parseInt(e.target.value) })}
                            >
                                <MenuItem value={1}>Level 1 (Direct Affiliate)</MenuItem>
                                <MenuItem value={2}>Level 2 (Affiliate Agent)</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Package Price (Trigger)"
                                variant="outlined"
                                type="number"
                                value={editingConfig ? editingConfig.packagePrice : newConfig.packagePrice}
                                onChange={(e) => editingConfig ? setEditingConfig({ ...editingConfig, packagePrice: e.target.value }) : setNewConfig({ ...newConfig, packagePrice: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editingConfig ? editingConfig.isPercentage : newConfig.isPercentage}
                                        onChange={(e) => editingConfig ? setEditingConfig({ ...editingConfig, isPercentage: e.target.checked }) : setNewConfig({ ...newConfig, isPercentage: e.target.checked })}
                                    />
                                }
                                label="Is Percentage?"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label={(editingConfig ? editingConfig.isPercentage : newConfig.isPercentage) ? "Percentage (%)" : "Fixed Amount (₹)"}
                                variant="outlined"
                                type="number"
                                value={editingConfig ? (editingConfig.isPercentage ? editingConfig.percentage : editingConfig.amount) : (newConfig.isPercentage ? newConfig.percentage : newConfig.amount)}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (editingConfig) {
                                        if (editingConfig.isPercentage) setEditingConfig({ ...editingConfig, percentage: val });
                                        else setEditingConfig({ ...editingConfig, amount: val });
                                    } else {
                                        if (newConfig.isPercentage) setNewConfig({ ...newConfig, percentage: val });
                                        else setNewConfig({ ...newConfig, amount: val });
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveConfig} color="primary" variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

export default CommissionManagement;
