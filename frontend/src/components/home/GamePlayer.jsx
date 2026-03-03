import React, { useEffect, useState, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  makeStyles,
  Typography,
  Button,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import axios from "axios";
import * as api from "../../api/auth";

const LOGO_URL = "https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#E8ECF4",
  },
  phoneContainer: {
    width: "100%",
    maxWidth: "430px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "calc(68px + env(safe-area-inset-bottom))",
    backgroundColor: "#F8FAFC",
    boxShadow: "0 0 40px rgba(0,0,0,0.06)",
    position: "relative",
  },
  header: {
    flexShrink: 0,
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottom: "1px solid #E2E8F0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  backBtn: {
    padding: 6,
    color: "#0F172A",
    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
  },
  headerTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#0F172A",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  headerLogo: {
    height: "26px",
    objectFit: "contain",
  },
  headerBalance: {
    textAlign: "right",
    cursor: "pointer",
    flexShrink: 0,
  },
  balanceLabel: {
    display: "block",
    fontSize: "10px",
    fontWeight: 600,
    color: "#64748B",
  },
  balanceAmount: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#0F172A",
    lineHeight: 1.2,
  },
  iframeWrap: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    backgroundColor: "#000",
  },
  loaderWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    gap: 12,
    animation: "fadeIn 0.3s ease-out",
  },
  loaderSpinner: {
    width: 48,
    height: 48,
    border: "4px solid rgba(15, 118, 110, 0.2)",
    borderTopColor: "#0F766E",
    borderRadius: "50%",
    animation: "$spin 0.8s linear infinite",
  },
  "@keyframes spin": {
    to: { transform: "rotate(360deg)" },
  },
  loaderBar: {
    width: "80%",
    maxWidth: 200,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(15, 118, 110, 0.2)",
    "& .MuiLinearProgress-bar": {
      backgroundColor: "#0F766E",
    },
  },
  loaderWrapExiting: {
    opacity: 0,
    pointerEvents: "none",
    transition: "opacity 0.4s ease-out",
  },
  iframe: {
    border: "none",
    width: "100%",
    height: "100%",
    minHeight: "300px",
    display: "block",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0F172A",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: "0.9rem",
    color: "#64748B",
    marginBottom: 24,
  },
  emptyBtn: {
    color: "#0F766E",
    borderColor: "#0F766E",
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      borderColor: "#0F766E",
      backgroundColor: "rgba(15, 118, 110, 0.08)",
    },
  },
}));

const GamePlayer = () => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [loaderExiting, setLoaderExiting] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("Game");
  const [hasError, setHasError] = useState(false);
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [user, setUser] = useState(null);
  const exitTimerRef = useRef(null);
  const [showOpenHint, setShowOpenHint] = useState(false);

  useEffect(() => {
    if (location.state && location.state.url) {
      setUrl(location.state.url);
      if (location.state.title) setTitle(location.state.title);
      setHasError(false);
      setShowOpenHint(false);
    } else {
      setHasError(true);
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    axios.get(`${api.url}/site-settings`).then((res) => {
      if (res.data?.logoUrl) setSiteLogoUrl(res.data.logoUrl);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored?.result?.id || !stored?.token) return;
    const AuthStr = "Bearer ".concat(stored.token);
    axios
      .get(`${api.url}/getUserHome/${stored.result.id}/`, { headers: { Authorization: AuthStr } })
      .then((res) => {
        if (res.data && res.data[0]) setUser(res.data[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  }, []);

  useEffect(() => {
    if (!url) return;
    // If the iframe is blocked by CSP/X-Frame-Options, it may render an error page.
    // We can't reliably detect that cross-origin, so show a hint after a short delay.
    const t = setTimeout(() => setShowOpenHint(true), 3500);
    return () => clearTimeout(t);
  }, [url]);

  const handleIframeLoad = () => {
    setLoaderExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setLoading(false);
      setLoaderExiting(false);
      exitTimerRef.current = null;
    }, 400);
  };

  const handleClose = () => history.push("/");

  const openInNewTab = () => {
    if (!url) return;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.assign(url);
  };

  if (hasError) {
    return (
      <div className={classes.root}>
        <div className={classes.phoneContainer}>
          <header className={classes.header}>
            <div className={classes.headerLeft}>
              <IconButton className={classes.backBtn} onClick={handleClose} aria-label="Back" size="small">
                <ArrowBackIosIcon style={{ fontSize: 18 }} />
              </IconButton>
              <Typography className={classes.headerTitle}>Play</Typography>
            </div>
          </header>
          <div className={classes.emptyState}>
            <Typography className={classes.emptyTitle}>No game selected</Typography>
            <Typography className={classes.emptySub}>
              Choose a game from the home screen to start playing.
            </Typography>
            <Button variant="outlined" className={classes.emptyBtn} onClick={handleClose} size="medium">
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.phoneContainer}>
        <header className={classes.header}>
          <div className={classes.headerLeft}>
            <IconButton className={classes.backBtn} onClick={handleClose} aria-label="Back" size="small">
              <ArrowBackIosIcon style={{ fontSize: 18 }} />
            </IconButton>
            <Typography className={classes.headerTitle} title={title}>
              {title}
            </Typography>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button
              variant="outlined"
              size="small"
              className={classes.emptyBtn}
              onClick={openInNewTab}
              style={{ padding: "3px 10px", minWidth: 0 }}
            >
              Open
            </Button>
            <div className={classes.headerBalance} onClick={() => history.push("/wallet")} role="button" aria-label="Wallet balance">
              <Typography className={classes.balanceLabel}>BALANCE</Typography>
              <Typography className={classes.balanceAmount}>
                ₹ {user?.balance != null ? Number(user.balance).toFixed(2) : "0.00"}
              </Typography>
            </div>
          </div>
        </header>

        <div className={classes.iframeWrap}>
          {loading && (
            <div className={`${classes.loaderWrap} ${loaderExiting ? classes.loaderWrapExiting : ""}`}>
              <div className={classes.loaderSpinner} aria-hidden />
              <Typography variant="body2" color="textSecondary">Loading game…</Typography>
              <LinearProgress className={classes.loaderBar} />
            </div>
          )}
          {!loading && showOpenHint && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ pointerEvents: "auto", background: "rgba(15,23,42,0.85)", color: "#fff", padding: "8px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, maxWidth: "92%" }}>
                <Typography style={{ fontSize: 12, color: "rgba(255,255,255,0.92)" }}>
                  If the game is blank, tap <b>Open</b> (some providers block iframes).
                </Typography>
              </div>
            </div>
          )}
          {url && (
            <iframe
              src={url}
              title={title || "Game"}
              className={classes.iframe}
              onLoad={handleIframeLoad}
              allowFullScreen
              allow="clipboard-read; clipboard-write; autoplay; fullscreen"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlayer;
