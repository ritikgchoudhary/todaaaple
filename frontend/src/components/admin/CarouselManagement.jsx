import React, { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    Box,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    CircularProgress,
    Avatar,
    TextField,
} from "@material-ui/core";
import {
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    Delete as DeleteIcon,
    AddPhotoAlternate as UploadIcon,
    VpnKey as KeyIcon,
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import AdminLayout from "./AdminLayout";
import {
    getCarouselAdmin,
    uploadCarouselImage,
    addCarouselImageByUrl,
    updateCarouselOrder,
    deleteCarouselImage,
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
    listItem: {
        border: "1px solid #E2E8F0",
        borderRadius: 8,
        marginBottom: 8,
    },
    listImg: {
        width: 80,
        height: 50,
        objectFit: "cover",
        borderRadius: 6,
    },
    uploadBtn: {
        marginTop: 16,
        marginBottom: 24,
        backgroundColor: "#10B9B1",
        color: "#fff",
        textTransform: "none",
        "&:hover": { backgroundColor: "#0D9488" },
    },
    saveBtn: {
        marginTop: 16,
        backgroundColor: "#10B9B1",
        color: "#fff",
        textTransform: "none",
        "&:hover": { backgroundColor: "#0D9488" },
    },
}));

const CarouselManagement = () => {
    const classes = useStyles();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [message, setMessage] = useState(null);
    const [adminApiKey, setAdminApiKey] = useState(localStorage.getItem("MASTER_ADMIN_API") || "");
    const [keySaved, setKeySaved] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [addingByUrl, setAddingByUrl] = useState(false);
    const inputRef = React.useRef(null);

    const fetchImages = async () => {
        try {
            const res = await getCarouselAdmin();
            setImages(Array.isArray(res.data.images) ? res.data.images : []);
            setMessage(null);
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Failed to load carousel.";
            setMessage(msg);
            setImages([]);
        } finally {
            setLoading(false);
        }
    };

    const saveAdminKey = () => {
        const key = (adminApiKey || "").trim();
        if (key) {
            localStorage.setItem("MASTER_ADMIN_API", key);
            setKeySaved(true);
            setMessage("Admin API key saved. Reloading list…");
            fetchImages();
            setTimeout(() => setKeySaved(false), 2000);
        } else {
            setMessage("Enter Admin API key (from server config.env AdminAPI).");
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setMessage(null);
        try {
            await uploadCarouselImage(file);
            await fetchImages();
            setMessage("Image uploaded.");
        } catch (err) {
            const status = err.response?.status;
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Upload failed.";
            const hint = status === 403 ? " Set Admin API key above and Save." : status === 404 ? " Backend not reachable? Restart backend on port 4001." : "";
            setMessage(errMsg + (hint || ""));
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    const handleAddByUrl = async () => {
        const url = (imageUrlInput || "").trim();
        if (!url || !url.startsWith("http")) {
            setMessage("Enter a valid image URL (e.g. https://cdn.example.com/banner.jpg)");
            return;
        }
        setAddingByUrl(true);
        setMessage(null);
        try {
            await addCarouselImageByUrl(url);
            setImageUrlInput("");
            await fetchImages();
            setMessage("Image added from URL.");
        } catch (err) {
            setMessage(err.response?.data?.error || err.message || "Failed to add image.");
        } finally {
            setAddingByUrl(false);
        }
    };

    const move = (index, dir) => {
        const next = index + (dir === "up" ? -1 : 1);
        if (next < 0 || next >= images.length) return;
        const newOrder = [...images];
        [newOrder[index], newOrder[next]] = [newOrder[next], newOrder[index]];
        setImages(newOrder);
    };

    const handleSaveOrder = async () => {
        setMessage(null);
        try {
            await updateCarouselOrder(images);
            setMessage("Order saved.");
        } catch (err) {
            setMessage("Failed to save order.");
        }
    };

    const handleDelete = async (url) => {
        if (!window.confirm("Remove this image from the carousel?")) return;
        setMessage(null);
        try {
            await deleteCarouselImage(url);
            setImages((prev) => prev.filter((u) => u !== url));
            setMessage("Image removed.");
        } catch (err) {
            setMessage("Failed to delete.");
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
                    Home Page Carousel
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
                    Upload and reorder the sliding banner images on the home page.
                </Typography>

                <Paper className={classes.paper} style={{ marginBottom: 24 }}>
                    <Typography className={classes.sectionTitle} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <KeyIcon fontSize="small" /> Admin API Key
                    </Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 12 }}>
                        If upload or load fails with &quot;Unauthorized&quot;, set the key from your server <code>config.env</code> (AdminAPI).
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <TextField
                            size="small"
                            placeholder="AdminAPI value from config.env"
                            value={adminApiKey}
                            onChange={(e) => setAdminApiKey(e.target.value)}
                            variant="outlined"
                            type="password"
                            style={{ minWidth: 280 }}
                            inputProps={{ "aria-label": "Admin API key" }}
                        />
                        <Button variant="contained" color="primary" onClick={saveAdminKey} style={{ backgroundColor: "#10B9B1" }}>
                            {keySaved ? "Saved" : "Save key"}
                        </Button>
                    </Box>
                </Paper>

                <Paper className={classes.paper}>
                    <Typography className={classes.sectionTitle}>Banner images</Typography>

                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 12 }}>
                        Add by URL (CDN / image link) — no file upload, works without backend upload route:
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" style={{ marginBottom: 16 }}>
                        <TextField
                            size="small"
                            placeholder="https://cdn.example.com/banner.jpg"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            variant="outlined"
                            style={{ minWidth: 280, flex: 1 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddByUrl}
                            disabled={addingByUrl}
                            style={{ backgroundColor: "#10B9B1", color: "#fff" }}
                        >
                            {addingByUrl ? "Adding…" : "Add URL"}
                        </Button>
                    </Box>

                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: 8 }}>Or upload from device:</Typography>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleUpload}
                    />
                    <Button
                        className={classes.uploadBtn}
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading…" : "Upload image"}
                    </Button>

                    {images.length === 0 ? (
                        <Typography color="textSecondary">No images yet. Upload to add.</Typography>
                    ) : (
                        <>
                            <List disablePadding>
                                {images.map((url, index) => (
                                    <ListItem key={url} className={classes.listItem}>
                                        <ListItemAvatar>
                                            <Avatar variant="rounded" src={url} style={{ width: 80, height: 50 }} />
                                        </ListItemAvatar>
                                        <ListItemText primary={`Slide ${index + 1}`} secondary={url.slice(0, 50) + "…"} />
                                        <ListItemSecondaryAction>
                                            <IconButton size="small" onClick={() => move(index, "up")} disabled={index === 0}>
                                                <ArrowUpIcon />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => move(index, "down")} disabled={index === images.length - 1}>
                                                <ArrowDownIcon />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(url)} color="secondary">
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                            <Button className={classes.saveBtn} variant="contained" onClick={handleSaveOrder}>
                                Save order
                            </Button>
                        </>
                    )}

                    {message && (
                        <Typography color={message.includes("Failed") ? "error" : "primary"} style={{ marginTop: 16 }}>
                            {message}
                        </Typography>
                    )}
                </Paper>
            </Box>
        </AdminLayout>
    );
};

export default CarouselManagement;
