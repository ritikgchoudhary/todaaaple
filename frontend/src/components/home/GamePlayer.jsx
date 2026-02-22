import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
    makeStyles,
    IconButton,
    Button,
    Toolbar,
    Typography,
    CircularProgress,
    Box,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0a0a0f',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'env(safe-area-inset-top, 0)',
    },
    header: {
        flexShrink: 0,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(5, 192, 184, 0.25)',
    },
    toolbar: {
        minHeight: 56,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 'env(safe-area-inset-top, 0)',
    },
    backBtn: {
        color: '#fff',
        marginRight: 4,
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.08)',
        },
    },
    title: {
        flex: 1,
        fontSize: '1.1rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        paddingRight: 8,
    },
    closeBtn: {
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.1)',
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.18)',
        },
    },
    iframeContainer: {
        flex: 1,
        position: 'relative',
        width: '100%',
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    iframe: {
        border: 'none',
        width: '100%',
        height: '100%',
        display: 'block',
    },
    loaderWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0f',
        gap: 16,
    },
    loader: {
        color: '#05c0b8',
    },
    loaderText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: '0.9rem',
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
    },
    emptyTitle: {
        color: '#fff',
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: 8,
    },
    emptySub: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.95rem',
        marginBottom: 24,
    },
    emptyBtn: {
        color: '#05c0b8',
        borderColor: '#05c0b8',
        textTransform: 'none',
        fontWeight: 600,
        '&:hover': {
            borderColor: '#05c0b8',
            backgroundColor: 'rgba(5, 192, 184, 0.08)',
        },
    },
}));

const GamePlayer = () => {
    const classes = useStyles();
    const location = useLocation();
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('Game');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (location.state && location.state.url) {
            setUrl(location.state.url);
            if (location.state.title) setTitle(location.state.title);
            setHasError(false);
        } else {
            setHasError(true);
            setLoading(false);
        }
    }, [location, history]);

    const handleClose = () => history.push('/');

    if (hasError) {
        return (
            <div className={classes.root}>
                <Box className={classes.header}>
                    <Toolbar className={classes.toolbar}>
                        <Typography className={classes.title}>Play</Typography>
                    </Toolbar>
                </Box>
                <div className={classes.emptyState}>
                    <Typography className={classes.emptyTitle}>No game selected</Typography>
                    <Typography className={classes.emptySub}>
                        Choose a game from the home screen to start playing.
                    </Typography>
                    <Button
                        variant="outlined"
                        className={classes.emptyBtn}
                        onClick={handleClose}
                        size="medium"
                    >
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <Box className={classes.header}>
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        edge="start"
                        className={classes.backBtn}
                        onClick={handleClose}
                        aria-label="back"
                    >
                        <ArrowBackIosIcon style={{ fontSize: 20 }} />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {title}
                    </Typography>
                    <IconButton
                        edge="end"
                        className={classes.closeBtn}
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </Box>

            <div className={classes.iframeContainer}>
                {loading && (
                    <div className={classes.loaderWrap}>
                        <CircularProgress size={48} className={classes.loader} thickness={4} />
                        <Typography className={classes.loaderText}>Loading game…</Typography>
                    </div>
                )}
                {url && (
                    <iframe
                        src={url}
                        title="Game Frame"
                        className={classes.iframe}
                        onLoad={() => setLoading(false)}
                        allowFullScreen
                        allow="clipboard-read; clipboard-write; autoplay; fullscreen"
                    />
                )}
            </div>
        </div>
    );
};

export default GamePlayer;
