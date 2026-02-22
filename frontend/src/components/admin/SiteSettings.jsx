import React, { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    Box,
    Button,
    CircularProgress,
} from "@material-ui/core";
import {
    PhotoCamera as LogoIcon,
    GetApp as ApkIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import AdminLayout from "./AdminLayout";
import {
    getSiteSettingsAdmin,
    uploadSiteLogo,
    uploadSiteApk,
} from "../../api/admin";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(3),
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid #E2E8F0",
        maxWidth: 560,
    },
    sectionTitle: {
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "#0F172A",
        marginBottom: theme.spacing(2),
    },
    previewBox: {
        border: "1px dashed #CBD5E1",
        borderRadius: 12,
        padding: theme.spacing(2),
        textAlign: "center",
        minHeight: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
    },
    logoPreview: {
        maxHeight: 56,
        maxWidth: "100%",
        objectFit: "contain",
    },
    uploadBtn: {
        marginTop: 12,
        backgroundColor: "#10B9B1",
        color: "#fff",
        textTransform: "none",
        "&:hover": { backgroundColor: "#0D9488" },
    },
    apkLink: {
        color: "#10B9B1",
        fontSize: "0.9rem",
        wordBreak: "break-all",
    },
    message: {
        marginTop: 12,
        fontSize: "0.9rem",
        color: "#64748B",
    },
    error: {
        color: "#DC2626",
    },
}));

const SiteSettings = () => {
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [logoUploading, setLogoUploading] = useState(false);
    const [apkUploading, setApkUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [apkDownloadUrl, setApkDownloadUrl] = useState("");
    const [message, setMessage] = useState(null);
    const logoInputRef = React.useRef(null);
    const apkInputRef = React.useRef(null);

    const fetchSettings = async () => {
        try {
            const res = await getSiteSettingsAdmin();
            setLogoUrl(res.data.logoUrl || "");
            setApkDownloadUrl(res.data.apkDownloadUrl || "");
        } catch (err) {
            setMessage("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoUploading(true);
        setMessage(null);
        try {
            const res = await uploadSiteLogo(file);
            setLogoUrl(res.data.logoUrl || "");
            setMessage("Logo updated.");
        } catch (err) {
            setMessage(err.response?.data?.error || "Logo upload failed.");
        } finally {
            setLogoUploading(false);
            if (logoInputRef.current) logoInputRef.current.value = "";
        }
    };

    const handleApkUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setApkUploading(true);
        setMessage(null);
        try {
            const res = await uploadSiteApk(file);
            setApkDownloadUrl(res.data.apkDownloadUrl || "");
            setMessage("APK updated. Download button will use this file.");
        } catch (err) {
            setMessage(err.response?.data?.error || "APK upload failed.");
        } finally {
            setApkUploading(false);
            if (apkInputRef.current) apkInputRef.current.value = "";
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box mb={3}>
                <Typography variant="h5" style={{ fontWeight: 600, color: "#0F172A" }}>
                    Site Logo & APK
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Main logo appears on the home page header. APK is used for the Download button.
                </Typography>
            </Box>

            <Paper className={classes.paper}>
                <Typography className={classes.sectionTitle}>Main Logo</Typography>
                <div className={classes.previewBox}>
                    {logoUrl ? (
                        <img src={logoUrl} alt="Site logo" className={classes.logoPreview} />
                    ) : (
                        <Typography color="textSecondary">No logo set</Typography>
                    )}
                </div>
                <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleLogoUpload}
                />
                <Button
                    className={classes.uploadBtn}
                    variant="contained"
                    startIcon={logoUploading ? <CircularProgress size={18} color="inherit" /> : <LogoIcon />}
                    disabled={logoUploading}
                    onClick={() => logoInputRef.current?.click()}
                >
                    {logoUploading ? "Uploading…" : "Upload Logo"}
                </Button>
            </Paper>

            <Paper className={classes.paper} style={{ marginTop: 24 }}>
                <Typography className={classes.sectionTitle}>APK for Download Button</Typography>
                <div className={classes.previewBox}>
                    {apkDownloadUrl ? (
                        <Typography className={classes.apkLink} component="a" href={apkDownloadUrl} target="_blank" rel="noopener noreferrer">
                            {apkDownloadUrl}
                        </Typography>
                    ) : (
                        <Typography color="textSecondary">No APK set. Upload to enable the Download button.</Typography>
                    )}
                </div>
                <input
                    type="file"
                    ref={apkInputRef}
                    accept=".apk,application/vnd.android.package-archive"
                    style={{ display: "none" }}
                    onChange={handleApkUpload}
                />
                <Button
                    className={classes.uploadBtn}
                    variant="contained"
                    startIcon={apkUploading ? <CircularProgress size={18} color="inherit" /> : <ApkIcon />}
                    disabled={apkUploading}
                    onClick={() => apkInputRef.current?.click()}
                >
                    {apkUploading ? "Uploading…" : "Upload APK"}
                </Button>
            </Paper>

            {message && (
                <Typography className={`${classes.message} ${message.includes("Failed") || message.includes("failed") ? classes.error : ""}`}>
                    {message}
                </Typography>
            )}
        </AdminLayout>
    );
};

export default SiteSettings;
