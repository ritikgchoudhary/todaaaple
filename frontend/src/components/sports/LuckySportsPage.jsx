import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, Typography, CircularProgress } from "@material-ui/core";
import axios from "axios";
import * as api from "../../api/auth";

const LUCKY_SPORTS_GAME_ID = 7004;

const LOGO_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// Cache launch URL for this tab session; resets on page refresh so API is called again
const CACHE_KEY = "__sportsLaunchUrl";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#E8ECF4",
  },
  phoneContainer: {
    width: "100%",
    maxWidth: "500px",
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
  headerLogo: {
    height: "50px",
    width: "auto",
    objectFit: "contain",
  },
  headerBalance: {
    textAlign: "right",
    cursor: "pointer",
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
  },
  loader: {
    color: "#0F766E",
  },
  iframe: {
    border: "none",
    width: "100%",
    height: "100%",
    minHeight: "300px",
    display: "block",
  },
  errorWrap: {
    padding: 24,
    textAlign: "center",
  },
}));

export default function LuckySportsPage() {
  const classes = useStyles();
  const history = useHistory();
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${api.url}/site-settings`).then((res) => {
      if (res.data?.siteLogoUrl) setSiteLogoUrl(res.data.siteLogoUrl);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored?.result?.id || !stored?.token) {
      setLoading(false);
      setError("Please log in to open Sports.");
      return;
    }
    setUser(stored.result || null);

    const cachedUrl = typeof window !== "undefined" ? window[CACHE_KEY] : null;
    if (cachedUrl) {
      setIframeUrl(cachedUrl);
      setLoading(false);
      return;
    }

    const uId = stored.result.id;
    const AuthStr = "Bearer ".concat(stored.token);

    const body = {
      userId: uId,
      game_id: LUCKY_SPORTS_GAME_ID,
      game_uid: String(LUCKY_SPORTS_GAME_ID),
    };
    axios
      .post(
        `${api.url}/game/launch/${uId}`,
        body,
        { headers: { Authorization: AuthStr, "Content-Type": "application/json" } }
      )
      .then((res) => {
        if (res.data.success && res.data.url) {
          const url = res.data.url;
          setIframeUrl(url);
          if (typeof window !== "undefined") window[CACHE_KEY] = url;
        } else {
          setError(res.data.msg || "Could not load Sports.");
        }
      })
      .catch((err) => {
        console.error("Sports launch error:", err);
        setError(err.response?.data?.msg || "Failed to load Sports. Try again.");
      })
      .finally(() => setLoading(false));
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

  return (
    <div className={classes.root}>
      <div className={classes.phoneContainer}>
        <header className={classes.header}>
          <img src={siteLogoUrl || LOGO_URL} alt="Site" className={classes.headerLogo} />
          <div className={classes.headerBalance} onClick={() => history.push("/wallet")} role="button" aria-label="Wallet balance">
            <Typography className={classes.balanceLabel}>BALANCE</Typography>
            <Typography className={classes.balanceAmount}>
              ₹ {user?.balance != null ? Number(user.balance).toFixed(2) : "0.00"}
            </Typography>
          </div>
        </header>

        <div className={classes.iframeWrap}>
        {loading && (
          <div className={classes.loaderWrap}>
            <CircularProgress size={40} className={classes.loader} thickness={4} />
            <Typography variant="body2" color="textSecondary">Loading Sports…</Typography>
          </div>
        )}
        {error && !loading && (
          <div className={classes.loaderWrap}>
            <Typography color="error" style={{ marginBottom: 8 }}>{error}</Typography>
            <Typography variant="body2" color="textSecondary" style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => history.push("/")}>
              Back to Home
            </Typography>
          </div>
        )}
        {iframeUrl && !error && (
          <iframe
            src={iframeUrl}
            title="Lucky Sports"
            className={classes.iframe}
            allowFullScreen
            allow="clipboard-read; clipboard-write; autoplay; fullscreen"
          />
        )}
        </div>
      </div>
    </div>
  );
}
