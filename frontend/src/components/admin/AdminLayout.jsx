import React, { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CssBaseline,
    Box,
    IconButton,
    Avatar,
    Divider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    AccountBalanceWallet as WalletIcon,
    Settings as SettingsIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
    SportsEsports as GamesIcon,
} from "@material-ui/icons";
import { useHistory, useLocation } from "react-router-dom";

const drawerWidth = 260;

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        backgroundColor: "#F8FAFC",
        minHeight: "100vh",
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: "#fff",
        color: "#0F172A",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: "#0F172A",
        color: "#fff",
        border: "none",
    },
    drawerContainer: {
        overflow: "auto",
        marginTop: "64px",
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        marginTop: "64px",
    },
    logo: {
        fontWeight: "bold",
        letterSpacing: "1px",
        color: "#10B9B1",
        cursor: "pointer",
    },
    listItem: {
        margin: "8px 16px",
        borderRadius: "8px",
        "&:hover": {
            backgroundColor: "rgba(16, 185, 177, 0.1)",
            color: "#10B9B1",
            "& $listIcon": {
                color: "#10B9B1",
            },
        },
    },
    activeItem: {
        backgroundColor: "#10B9B1 !important",
        color: "#fff",
        "& $listIcon": {
            color: "#fff",
        },
    },
    listIcon: {
        color: "#94A3B8",
        minWidth: "40px",
    },
    listText: {
        "& span": {
            fontSize: "0.95rem",
            fontWeight: 500,
        },
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    avatar: {
        backgroundColor: "#10B9B1",
        marginLeft: theme.spacing(2),
    },
}));

const AdminLayout = ({ children }) => {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const adminApi = localStorage.getItem("MASTER_ADMIN_API");
        if (!adminApi) {
            // For now, let's just allow it if we are developing, but in production, we should redirect
            // history.push("/login");
            setIsAdmin(true); // Temporarily true for development
        } else {
            setIsAdmin(true);
        }
    }, [history]);

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
        { text: "User Management", icon: <PeopleIcon />, path: "/admin/users" },
        { text: "Withdrawals", icon: <WalletIcon />, path: "/admin/withdrawals" },
        { text: "Commissions", icon: <GamesIcon />, path: "/admin/commissions" },
        { text: "Providers", icon: <SettingsIcon />, path: "/admin/providers" },
        { text: "All Games", icon: <GamesIcon />, path: "/admin/games" },
        { text: "Categories", icon: <DashboardIcon />, path: "/admin/categories" },
        { text: "Recharge & Gateway", icon: <WalletIcon />, path: "/admin/recharge-settings" },
        { text: "Home Carousel", icon: <GamesIcon />, path: "/admin/carousel" },
        { text: "Logo & APK", icon: <SettingsIcon />, path: "/admin/site-settings" },
        { text: "Settings", icon: <SettingsIcon />, path: "/admin/settings" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("MASTER_ADMIN_API");
        history.push("/login"); // or wherever the login is
    };

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar className={classes.toolbar}>
                    <Box display="flex" alignItems="center">
                        <IconButton edge="start" color="inherit" aria-label="menu" style={{ marginRight: 10 }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.logo} onClick={() => history.push("/admin/dashboard")}>
                            DELTIN7 <span style={{ color: "#475569", fontSize: "0.8rem" }}>ADMIN</span>
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                        <Typography variant="body2" style={{ color: "#64748B", fontWeight: 500 }}>
                            Administrator
                        </Typography>
                        <Avatar className={classes.avatar}>AD</Avatar>
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerContainer}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => history.push(item.path)}
                                className={`${classes.listItem} ${location.pathname === item.path ? classes.activeItem : ""}`}
                            >
                                <ListItemIcon className={classes.listIcon}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} className={classes.listText} />
                            </ListItem>
                        ))}
                        <Divider style={{ backgroundColor: "rgba(255,255,255,0.1)", margin: "16px" }} />
                        <ListItem button className={classes.listItem} onClick={handleLogout}>
                            <ListItemIcon className={classes.listIcon}>
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText primary="Logout" className={classes.listText} />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
            <main className={classes.content}>{children}</main>
        </div>
    );
};

export default AdminLayout;
