import React, { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    Box,
    Switch,
    FormControlLabel,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    CircularProgress,
} from "@material-ui/core";
import {
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    AccountBalanceWallet as WalletIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import AdminLayout from "./AdminLayout";
import { getRechargeSettings, updateRechargeSettings } from "../../api/admin";

const GATEWAY_LABELS = {
    auto: "Auto (QR/Paytm)",
    manual: "UPI (Manual)",
    card: "Card (Credit/Debit)",
    lgpay: "LG Pay",
    watchpay: "Watch Pay",
    rupeerush: "Rupee Rush",
};

const DEFAULT_ORDER = ["auto", "manual", "card", "lgpay", "watchpay", "rupeerush"];

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(3),
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid #E2E8F0",
        maxWidth: 640,
    },
    sectionTitle: {
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "#0F172A",
        marginBottom: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    saveBtn: {
        marginTop: theme.spacing(3),
        backgroundColor: "#10B9B1",
        color: "#fff",
        textTransform: "none",
        fontWeight: 600,
        padding: "10px 24px",
        "&:hover": {
            backgroundColor: "#0D9488",
        },
    },
    listItem: {
        border: "1px solid #E2E8F0",
        borderRadius: 8,
        marginBottom: 8,
    },
    listItemText: {
        "& span": { fontWeight: 500 },
    },
    moveBtn: {
        padding: 4,
    },
}));

const RechargeSettings = () => {
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [rechargeEnabled, setRechargeEnabled] = useState(true);
    const [gatewayOrder, setGatewayOrder] = useState([...DEFAULT_ORDER]);
    const [gatewayEnabled, setGatewayEnabled] = useState({
        auto: true,
        manual: true,
        card: true,
        lgpay: true,
        watchpay: true,
        rupeerush: true,
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getRechargeSettings();
                const d = res.data;
                if (typeof d.rechargeEnabled === "boolean") setRechargeEnabled(d.rechargeEnabled);
                if (Array.isArray(d.gatewayOrder) && d.gatewayOrder.length) setGatewayOrder(d.gatewayOrder);
                if (d.gatewayEnabled && typeof d.gatewayEnabled === "object") setGatewayEnabled((prev) => ({ ...prev, ...d.gatewayEnabled }));
            } catch (err) {
                console.error(err);
                setMessage("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const moveGateway = (index, direction) => {
        const newOrder = [...gatewayOrder];
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= newOrder.length) return;
        [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
        setGatewayOrder(newOrder);
    };

    const handleToggleGateway = (id) => {
        setGatewayEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await updateRechargeSettings({
                rechargeEnabled,
                gatewayOrder,
                gatewayEnabled,
            });
            setMessage("Settings saved successfully.");
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box>
                <Typography variant="h5" style={{ fontWeight: 600, marginBottom: 24, color: "#0F172A" }}>
                    Recharge & Gateway Settings
                </Typography>

                <Paper className={classes.paper}>
                    <Typography className={classes.sectionTitle}>
                        <WalletIcon /> PreOrder / Recharge
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={rechargeEnabled}
                                onChange={(e) => setRechargeEnabled(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={rechargeEnabled ? "Recharge page is ON (users can recharge)" : "Recharge page is OFF"}
                    />

                    <Typography className={classes.sectionTitle} style={{ marginTop: 24 }}>
                        Gateways – Order & Enable/Disable
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                        Change order with ↑ ↓. Turn off to hide from users.
                    </Typography>
                    <List disablePadding>
                        {gatewayOrder.map((id, index) => (
                            <ListItem
                                key={id}
                                className={classes.listItem}
                                secondaryAction={
                                    <Box display="flex" alignItems="center">
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={gatewayEnabled[id] !== false}
                                                    onChange={() => handleToggleGateway(id)}
                                                    color="primary"
                                                />
                                            }
                                            label=""
                                            labelPlacement="start"
                                        />
                                        <IconButton
                                            className={classes.moveBtn}
                                            size="small"
                                            onClick={() => moveGateway(index, "up")}
                                            disabled={index === 0}
                                            aria-label="Move up"
                                        >
                                            <ArrowUpIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            className={classes.moveBtn}
                                            size="small"
                                            onClick={() => moveGateway(index, "down")}
                                            disabled={index === gatewayOrder.length - 1}
                                            aria-label="Move down"
                                        >
                                            <ArrowDownIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={GATEWAY_LABELS[id] || id}
                                    secondary={`Rank #${index + 1}`}
                                    className={classes.listItemText}
                                />
                            </ListItem>
                        ))}
                    </List>

                    {message && (
                        <Typography color={message.includes("Failed") ? "error" : "primary"} style={{ marginTop: 16 }}>
                            {message}
                        </Typography>
                    )}
                    <Button
                        className={classes.saveBtn}
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving…" : "Save settings"}
                    </Button>
                </Paper>
            </Box>
        </AdminLayout>
    );
};

export default RechargeSettings;
