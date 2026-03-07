import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import {
  makeStyles,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
} from "@material-ui/core";
import {
  Close as CloseIcon,
  VolumeUp as NoticeIcon,
  SportsEsports as GameIcon,
} from "@material-ui/icons";
import { CircularProgress, Dialog, Container } from "@material-ui/core";
import axios from "axios";
import * as api from "../../api/auth";
import { fetchGameCatalogPublic } from "../../api/gameCatalog";

// --- IMAGES (Restored from previous versions or generic placeholders) ---
import HeaderBg from "../../images/header.jpg";
import Banner1 from "../../images/lucky_sports_banner.png";
import Banner2 from "../../images/casino_banner.png";
import Banner3 from "../../images/bonus_banner.png";

// Fallback provider/game images
import WingoIcon from "../../images/wingo.png";

// Logo URL matching the "Deltin" brand in the image
const LOGO_URL = "https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#EFF2F5", // Background for the "desktop" space around the phone
    display: "flex",
    justifyContent: "center",
    "& *": {
      textDecoration: "none !important",
    },
    "& *:hover": {
      textDecoration: "none !important",
    }
  },
  mainContainer: {
    width: "100%",
    maxWidth: "480px", // Strict mobile width
    backgroundColor: "#F4F7FE", // App background
    minHeight: "100vh",
    paddingBottom: "80px",
    position: "relative",
    boxShadow: "0 0 20px rgba(0,0,0,0.05)",
    overflowX: "hidden", // Prevent accidental horizontal scroll
  },
  // 1. Top Download Banner
  topAppBanner: {
    backgroundColor: "#fff",
    padding: "4px 8px", // Reduced padding
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #eee",
  },
  appBannerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  downloadBtn: {
    backgroundColor: "#10B9B0", // Teal
    color: "#fff",
    borderRadius: "20px",
    textTransform: "none",
    fontWeight: "bold",
    fontSize: "11px",
    padding: "2px 10px", // Smaller button
    "&:hover": { backgroundColor: "#0D9488" }
  },

  // 2. Main Header
  header: {
    padding: "6px 12px", // Tighter header
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  headerLogo: {
    height: "28px", // Smaller logo
    objectFit: "contain",
  },
  authBtns: {
    display: "flex",
    gap: "8px",
  },
  regBtn: {
    border: "1px solid #10B9B0", // Teal
    color: "#10B9B0",
    borderRadius: "20px",
    textTransform: "none",
    fontSize: "12px",
    padding: "2px 12px",
    minWidth: "auto",
    "& .MuiButton-startIcon": { marginRight: "4px" }
  },
  loginBtn: {
    backgroundColor: "#10B9B0", // Teal
    color: "#fff",
    borderRadius: "20px",
    textTransform: "none",
    fontSize: "12px",
    padding: "2px 14px",
    minWidth: "auto",
    "&:hover": { backgroundColor: "#0D9488" }
  },

  // 3. Carousel
  carouselWrap: {
    padding: "8px 15px",
  },
  bannerImg: {
    width: "100%",
    height: "160px", // Reduced height to look like a carousel
    borderRadius: "12px",
    display: "block",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    objectFit: "cover",
  },

  // 4. Announcement
  announcement: {
    backgroundColor: "#fff",
    margin: "0 15px",
    borderRadius: "8px",
    padding: "6px 10px",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    color: "#666",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  marquee: {
    marginLeft: "8px",
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    color: "#5C7092", // Blue-ish grey text
  },

  // 5. Category Tabs (The square ones from the image)
  catScroll: {
    display: "flex",
    overflowX: "auto",
    padding: "15px 15px",
    gap: "10px",
    "&::-webkit-scrollbar": { display: "none" },
  },
  catItem: {
    minWidth: "75px",
    height: "75px",
    backgroundColor: "#EBF1FA", // Light grey-blue
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "2px solid transparent",
    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
  },
  catItemActive: {
    backgroundColor: "rgba(16, 185, 176, 0.1)", // Light Teal tint
    borderColor: "#10B9B0", // Teal border
    "& $catLabel": { color: "#10B9B0", fontWeight: "bold" },
  },
  catIcon: {
    width: "32px",
    height: "32px",
    marginBottom: "4px",
    objectFit: "contain",
  },
  catLabel: {
    fontSize: "11px",
    color: "#666",
    lineHeight: "1.2",
  },

  // 6. Game Grid
  featuredCard: {
    margin: "0 15px 15px",
    backgroundColor: "#E8F0FE", // Very light blue
    borderRadius: "16px",
    padding: "0",
    position: "relative",
    overflow: "hidden",
    height: "140px",
    display: "flex",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
  featuredContent: {
    zIndex: 2,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  featuredTitle: {
    fontWeight: "900",
    fontSize: "18px",
    color: "#0F172A",
    marginBottom: "4px",
    textTransform: "uppercase",
  },
  featuredBadge: {
    marginTop: "8px",
    backgroundColor: "#000",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    width: "fit-content",
  },
  featuredImg: {
    position: "absolute",
    right: 0,
    bottom: 0,
    height: "100%",
    width: "60%",
    objectFit: "cover",
    maskImage: "linear-gradient(to left, black 60%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to left, black 60%, transparent 100%)",
  },

  // Sports section – reference layout (gt-wrapper / game-item)
  gtWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    padding: "0 15px 15px",
  },
  // Live Casino – all cards full width (card-b), vertical stack like HTML
  gtWrapperCasino: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 10,
    padding: "0 15px 15px",
  },
  gameItem: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 100,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  gameItemCardB: {
    gridColumn: "1 / -1",
    minHeight: 130,
  },
  characterBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: "contain",
    backgroundPosition: "right bottom",
    backgroundRepeat: "no-repeat",
    pointerEvents: "none",
  },
  gameItemContent: {
    position: "relative",
    zIndex: 2,
    padding: "10px 12px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  gameItemTextContent: {},
  gameItemName: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#0F172A",
    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
  },
  gameItemImgContent: {
    "& img": {
      height: 28,
      maxWidth: "90%",
      objectFit: "contain",
      display: "block",
    },
  },
  gridList: {
    padding: "0 15px",
  },
  gridCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "12px",
    position: "relative",
    overflow: "hidden",
    minHeight: "100px",
    display: "flex",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    background: "linear-gradient(135deg, #ffffff 0%, #F1FBF9 100%)", // Light Green tint
    cursor: "pointer",
  },
  cardLeft: {
    display: "flex",
    flexDirection: "column",
    zIndex: 2,
    maxWidth: "60%"
  },
  cardName: {
    fontWeight: "bold",
    fontSize: "13px",
    color: "#1E293B",
    marginBottom: "6px",
    lineHeight: "1.2",
  },
  cardLogo: {
    width: "30px",
    height: "30px",
    objectFit: "contain",
    borderRadius: "50%",
    backgroundColor: "#fff",
    padding: "2px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  cardChar: {
    position: "absolute",
    right: "-5px",
    bottom: "-5px",
    height: "110px", // Larger breakout
    width: "80px",
    objectFit: "contain", // Or scale-down
  },
  // Wallet Section for Logged In
  balanceCard: {
    margin: "15px",
    padding: "16px 20px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #10B9B0 0%, #0D9488 100%)", // Teal Gradient
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 20px rgba(16, 185, 176, 0.2)",
  },
  balanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletActions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },
  walletBtn: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    color: "#fff",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "13px",
    fontWeight: "bold",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.25)" }
  },
  depositBtn: {
    flex: 1,
    backgroundColor: "#fff",
    color: "#0D9488", // Dark Teal
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "13px",
    fontWeight: "bold",
  },
  // Sidebar for Slots
  sidebarWrap: {
    display: 'flex',
    gap: '10px',
    // Calculate height: 100vh - (Header + Nav + Search + Margin roughly 180px)
    // Adjust as needed
    height: 'calc(100vh - 220px)',
    overflow: 'hidden',
    padding: '10px 15px',
  },
  sidebar: {
    width: '80px',
    minWidth: '80px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '4px',
    paddingBottom: '50px',
    "&::-webkit-scrollbar": { display: "none" },
  },
  sidebarItem: {
    width: '100%',
    height: '60px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    padding: '4px',
  },
  sidebarItemActive: {
    borderColor: '#10B9B0',
    backgroundColor: 'rgba(16,185,176,0.15)',
    transform: 'scale(1.05)',
  },
  sidebarLogo: {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    height: '100%',
    paddingBottom: '50px',
    "&::-webkit-scrollbar": { display: "none" },
  },
}));

// --- CATEGORY DATA (Matching the visual icons roughly) ---
const CATEGORIES = [
  { id: 'sports', label: 'Sports', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/4_active.png" },
  { id: 'casino', label: 'Live Casino', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/3.png" },
  { id: 'crash', label: 'Crash Game', icon: "https://img.bzvm68.com/GoWin11/crash_game_icon/crash.png" },
  { id: 'slot', label: 'Slot Game', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/2.png" },
  { id: 'lottery', label: 'Lottery', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/5.png" },
  { id: 'cards', label: 'Card Game', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/6.png" },
];

// Sports section – exact same images/structure as provided HTML (jo HTML diya uski images)
const CARD_BG = "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-4.png";
const HALL_PICS_BASE = "https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/";
const GAME_LOGO_BASE = "https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/";
const SPORTS_SECTION_ITEMS = [
  { key: "9wickets", name: "9WICKETS", charImg: `${HALL_PICS_BASE}4-GP9W.png`, logoImg: `${GAME_LOGO_BASE}4-GP9W.png` },
  { key: "lucky-sports", name: "Lucky Sports", charImg: `${HALL_PICS_BASE}4-GPLS.png`, logoImg: `${GAME_LOGO_BASE}4-GPLS.png` },
  { key: "saba", name: "SABA", charImg: `${HALL_PICS_BASE}4-GPOW.png`, logoImg: `${GAME_LOGO_BASE}4-GPOW-en_US.png` },
  { key: "newbb", name: "NewBB", charImg: `${HALL_PICS_BASE}4-GPNBB.png`, logoImg: `${GAME_LOGO_BASE}4-GPBB-new bb.png` },
  { key: "sbo", name: "SBO", charImg: `${HALL_PICS_BASE}4-GPSB2.png`, logoImg: `${GAME_LOGO_BASE}4-GPSB2.png` },
  { key: "fb", name: "FB", charImg: `${HALL_PICS_BASE}4-GPFB.png`, logoImg: `${GAME_LOGO_BASE}4-GPFB-en_US.png` },
];

// Live Casino section – exact same as provided HTML (bg-3, hall_pics 3-x, game_logo 3-GPxx)
const CARD_BG_CASINO = "https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-3.png";
const LIVE_CASINO_SECTION_ITEMS = [
  { key: "evo", name: "EVO", charImg: `${HALL_PICS_BASE}3-1.png`, logoImg: `${GAME_LOGO_BASE}3-GPEV.png` },
  { key: "pt", name: "PT", charImg: `${HALL_PICS_BASE}3-2.png`, logoImg: `${GAME_LOGO_BASE}3-GPPT3.png` },
  { key: "ezugi", name: "Ezugi", charImg: `${HALL_PICS_BASE}3-3.png`, logoImg: `${GAME_LOGO_BASE}3-GPEZ.png` },
  { key: "sexy", name: "SEXY", charImg: `${HALL_PICS_BASE}3-4.png`, logoImg: `${GAME_LOGO_BASE}3-GPSX2.png` },
  { key: "ssg", name: "SSG", charImg: `${HALL_PICS_BASE}3-5.png`, logoImg: `${GAME_LOGO_BASE}3-GPSS.png` },
  { key: "mg", name: "MG", charImg: "", logoImg: `${GAME_LOGO_BASE}3-GPMG2.png` },
  { key: "pa", name: "PA", charImg: "", logoImg: `${GAME_LOGO_BASE}3-GPAG2.png` },
];

const Home = () => {
  const classes = useStyles();
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [games, setGames] = useState([]);
  const [selectedCat, setSelectedCat] = useState('sports');
  const [notice, setNotice] = useState("Welcome to Deltin7. Win Big Daily!");
  const [launching, setLaunching] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [siteLogoUrl, setSiteLogoUrl] = useState("");
  const [apkDownloadUrl, setApkDownloadUrl] = useState("");

  // Fetch Providers
  useEffect(() => {
    axios.get(`${api.url}/getProviders`)
      .then(res => {
        // 1. Filter active providers
        const activeProviders = res.data.filter(p => p.status === 1);

        // 2. Remove Duplicates based on brand_title (unique name)
        const uniqueProviders = [];
        const seenNames = new Set();

        activeProviders.forEach(p => {
          // Normalize name for comparison (lowercase, trim)
          const nameKey = p.brand_title ? p.brand_title.toLowerCase().trim() : p.brand_id;

          if (!seenNames.has(nameKey)) {
            seenNames.add(nameKey);
            uniqueProviders.push(p);
          }
        });

        setProviders(uniqueProviders);
      })
      .catch(e => console.error("Providers fetch error:", e));
  }, []);

  // Reset provider filter when category changes
  useEffect(() => {
    setSelectedProvider('all');
  }, [selectedCat]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setIsAuth(true);
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);

      const AuthStr = "Bearer ".concat(foundUser.token);
      axios.get(`${api.url}/getUserHome/${foundUser.result.id}/`, {
        headers: { Authorization: AuthStr },
      }).then((res) => {
        if (res.data && res.data[0]) setUser(res.data[0]);
      }).catch(err => {
        console.error("User Fetch Error:", err);
        // Optionally handle user fetch failure
      });
    }
  }, []);

  // Fallback games if API fails or returns empty
  const FALLBACK_GAMES = [
    { key: "9wickets", name: "9WICKETS", category: "sports", type: "featured", logoUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GP9W.png", charImageUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/4-GP9W.png" },
    { key: "lucky-sports", name: "Lucky Sports", category: "sports", type: "grid", logoUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPLS.png", charImageUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/4-GPLS.png" },
    { key: "saba-sports", name: "SABA", category: "sports", type: "grid", logoUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPOW-en_US.png", charImageUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/4-GPOW.png" },
    { key: "evo", name: "EVO", category: "casino", type: "grid", logoUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/3-GPEV.png", charImageUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/3-1.png" },
    { key: "aviator", name: "Aviator", category: "crash", type: "grid", charImageUrl: "https://img.bzvm68.com/GoWin11/crash_game_icon/crash.png" },
    { key: "slots-hot", name: "HOT Slots", category: "slot", type: "grid", charImageUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/2.png" },
    { key: "sv388", name: "SV388", category: "cockfight", type: "grid", logoUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GP9W.png", charImageUrl: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/4_active.png" },
  ];

  // Fetch Games
  useEffect(() => {
    fetchGameCatalogPublic()
      .then((res) => {
        if (res.data?.games && res.data.games.length > 0) {
          // Deduplicate Games
          const uniqueGames = [];
          const seenIds = new Set();

          res.data.games.forEach(g => {
            const key = g.id || g._id;
            if (key && !seenIds.has(key)) {
              seenIds.add(key);
              uniqueGames.push(g);
            }
          });

          setGames(uniqueGames);
        } else {
          setGames([]);
        }
      })
      .catch((e) => {
        console.error("Fetch Games Error:", e);
        setGames([]);
      });
  }, []);

  // Fetch Carousel
  useEffect(() => {
    axios.get(`${api.url}/carousel`)
      .then((res) => {
        if (Array.isArray(res.data?.images) && res.data.images.length > 0) {
          setCarouselImages(res.data.images);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Site Settings (logo + APK)
  useEffect(() => {
    axios.get(`${api.url}/site-settings`)
      .then((res) => {
        if (res.data?.logoUrl) setSiteLogoUrl(res.data.logoUrl);
        if (res.data?.apkDownloadUrl) setApkDownloadUrl(res.data.apkDownloadUrl);
      })
      .catch(() => {});
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const t = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [carouselImages.length]);

  // Fetch Notice
  useEffect(() => {
    axios.get(`${api.url}/getNotice`)
      .then((res) => {
        if (res.data.notice?.heading) {
          setNotice(res.data.notice.body || res.data.notice.heading);
        }
      })
      .catch((err) => {
        console.error("Notice Fetch Error:", err);
      });
  }, []);

  const openGame = async (game) => {
    if (!isAuth) {
      history.push('/login');
      return;
    }

    // Logic: If it has a SoftAPI UID OR it's in the sports category, prioritize the iGaming launch flow.
    // This avoids games in the sports category redirecting to local /cricket routes.
    if (game.softapiGameUid || game.category === 'sports') {
      setLaunching(true);
      try {
        const uId = user?.id || JSON.parse(localStorage.getItem("user"))?.result?.id;
        const AuthStr = "Bearer ".concat(user?.token || JSON.parse(localStorage.getItem("user"))?.token);

        // Fallback to game.key if softapiGameUid is missing (common for seeded sports games)
        const game_uid = game.softapiGameUid || game.key;

        const res = await axios.post(`${api.url}/game/launch/${uId}`, {
          game_uid: game_uid
        }, {
          headers: { Authorization: AuthStr }
        });

        if (res.data.success && res.data.url) {
          // Open in Iframe Player instead of new tab
          history.push('/play', { url: res.data.url, title: game.name });
        } else {
          alert(res.data.msg || "Failed to launch game. Please ensure the Game UID is configured.");
        }
      } catch (err) {
        console.error("Launch Error:", err);
        alert("Server Error while launching game");
      }
      setLaunching(false);
      return;
    }

    if (game.externalUrl) {
      // Try opening external URL in iframe too
      history.push('/play', { url: game.externalUrl, title: game.name });
    }
    else if (game.onClickPath) history.push(game.onClickPath);
  };

  const filteredGames = useMemo(() => {
    let result = games.filter(g => g.category?.toLowerCase() === selectedCat?.toLowerCase());

    if (selectedCat === 'slot' && selectedProvider !== 'all') {
      result = result.filter(g => g.provider === selectedProvider);
    }
    return result;
  }, [games, selectedCat, selectedProvider]);

  // Separate Featured vs Grid games (logic: if type='featured' and it's the first one)
  const featuredGame = filteredGames.find(g => g.type === 'featured');
  // Show standard grid for the rest
  const gridGames = filteredGames.filter(g => g !== featuredGame);

  return (
    <div className={classes.root}>
      <div className={classes.mainContainer}>
        {/* 1. App Download Banner */}
        <div className={classes.topAppBanner}>
          <div className={classes.appBannerLeft}>
            <CloseIcon style={{ fontSize: "16px", color: "#999" }} />
            <div>
              <img src={siteLogoUrl || LOGO_URL} alt="icon" style={{ height: "16px", verticalAlign: 'middle' }} />
              <span style={{ fontWeight: "900", fontSize: "12px", marginLeft: "4px" }}>APP</span>
            </div>
          </div>
          {apkDownloadUrl ? (
            <Button className={classes.downloadBtn} component="a" href={apkDownloadUrl} download target="_blank" rel="noopener noreferrer">
              Download
            </Button>
          ) : (
            <Button className={classes.downloadBtn} disabled>Download</Button>
          )}
        </div>

        {/* 2. Header (Logo + Auth/Wallet) */}
        <div className={classes.header}>
          <img src={siteLogoUrl || LOGO_URL} alt="Site" className={classes.headerLogo} />

          {isAuth ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }} onClick={() => history.push('/wallet')}>
                <Typography variant="caption" style={{ color: '#666', fontWeight: 'bold', fontSize: '10px', display: 'block' }}>BALANCE</Typography>
                <Typography variant="body2" style={{ color: '#0F172A', fontWeight: '900', fontSize: '14px' }}>₹{user?.balance ? Number(user.balance).toFixed(2) : '0.00'}</Typography>
              </div>
              <Button
                className={classes.loginBtn}
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.reload();
                }}
                style={{ backgroundColor: '#475569', padding: '4px 12px' }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className={classes.authBtns}>
              <Button
                className={classes.regBtn}
                startIcon={<span style={{ fontSize: '16px' }}>→</span>}
                onClick={() => history.push('/login')}
              >
                Register
              </Button>
              <Button
                className={classes.loginBtn}
                onClick={() => history.push('/login')}
                startIcon={<span style={{ fontSize: '14px' }}>+</span>}
              >
                Log-in
              </Button>
            </div>
          )}
        </div>

        {/* 3. Balance Card (Visible only when logged in) */}
        {isAuth && (
          <div className={classes.balanceCard}>
            <div className={classes.balanceRow}>
              <div>
                <Typography variant="caption" style={{ opacity: 0.8, fontSize: '11px', display: 'block' }}>Total Balance</Typography>
                <Typography variant="h5" style={{ fontWeight: '900', marginTop: '4px' }}>₹ {user?.balance ? Number(user.balance).toFixed(2) : '0.00'}</Typography>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Typography variant="caption" style={{ opacity: 0.8, fontSize: '11px', display: 'block' }}>User ID</Typography>
                <Typography variant="body2" style={{ fontWeight: 'bold' }}>{user?.id || '----'}</Typography>
              </div>
            </div>
            <div className={classes.walletActions}>
              <Button className={classes.walletBtn} onClick={() => history.push('/wallet')}>Withdraw</Button>
              <Button className={classes.depositBtn} onClick={() => history.push('/recharge')}>Recharge</Button>
            </div>
          </div>
        )}

        {/* 3. Hero Banner / Carousel */}
        <div className={classes.carouselWrap}>
          {carouselImages.length > 0 ? (
            <>
              <img src={carouselImages[carouselIndex]} alt={`Banner ${carouselIndex + 1}`} className={classes.bannerImg} />
              {carouselImages.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
                  {carouselImages.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: i === carouselIndex ? "#10B9B0" : "#ccc",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <img src={Banner1} alt="Banner" className={classes.bannerImg} />
          )}
        </div>

        {/* 4. Announcement */}
        <div className={classes.announcement}>
          <NoticeIcon style={{ color: "#10B9B0", fontSize: "20px" }} />
          <div className={classes.marquee}>
            <marquee scrollamount="4">{notice}</marquee>
          </div>
        </div>

        {/* 5. Category Tabs */}
        <div className={classes.catScroll}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`${classes.catItem} ${selectedCat === cat.id ? classes.catItemActive : ''}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              <img src={cat.icon} alt={cat.label} className={classes.catIcon} />
              <span className={classes.catLabel}>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* 6. Sports Section – exact same as provided HTML (same images, same structure) */}
        {selectedCat === 'sports' ? (
          <div className={classes.gtWrapper}>
            {SPORTS_SECTION_ITEMS.map((item, idx) => {
              const apiGame = games.find(g => (g.key || "").toLowerCase() === item.key || (g.name || "").toLowerCase().replace(/\s+/g, "-") === item.key);
              const launchGame = apiGame ? { ...apiGame, name: item.name } : { key: item.key, name: item.name, category: "sports", softapiGameUid: item.key };
              const isFirst = idx === 0;
              return (
                <div
                  key={item.key}
                  className={`${classes.gameItem} ${isFirst ? classes.gameItemCardB : ""}`}
                  style={{ backgroundImage: `url(${CARD_BG})` }}
                  onClick={() => openGame(launchGame)}
                >
                  <div className={classes.characterBg} style={{ backgroundImage: `url(${item.charImg})` }} />
                  <div className={classes.gameItemContent}>
                    <div className={classes.gameItemTextContent}>
                      <div className={classes.gameItemName}>{item.name}</div>
                    </div>
                    <div className={classes.gameItemImgContent}>
                      <img src={item.logoImg} alt="" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : selectedCat === 'casino' ? (
          /* 6b. Live Casino Section – exact same as provided HTML (bg-3, all card-b full width) */
          <div className={classes.gtWrapperCasino}>
            {LIVE_CASINO_SECTION_ITEMS.map((item) => {
              const apiGame = games.find(g => (g.key || "").toLowerCase() === item.key || (g.name || "").toLowerCase().replace(/\s+/g, "") === item.key.toLowerCase());
              const launchGame = apiGame ? { ...apiGame, name: item.name } : { key: item.key, name: item.name, category: "casino", softapiGameUid: item.key };
              return (
                <div
                  key={item.key}
                  className={`${classes.gameItem} ${classes.gameItemCardB}`}
                  style={{ backgroundImage: `url(${CARD_BG_CASINO})`, minHeight: 120 }}
                  onClick={() => openGame(launchGame)}
                >
                  {item.charImg ? <div className={classes.characterBg} style={{ backgroundImage: `url(${item.charImg})` }} /> : <div className={classes.characterBg} />}
                  <div className={classes.gameItemContent}>
                    <div className={classes.gameItemTextContent}>
                      <div className={classes.gameItemName}>{item.name}</div>
                    </div>
                    <div className={classes.gameItemImgContent}>
                      <img src={item.logoImg} alt="" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
        {/* 6b. Featured Game (Big Card) – non-sports */}
        {featuredGame && (
          <div className={classes.featuredCard} onClick={() => openGame(featuredGame)}>
            <div className={classes.featuredContent}>
              <div className={classes.featuredTitle}>{featuredGame.name}</div>
              <img
                src={featuredGame.logoUrl || "https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GP9W.png"}
                style={{ height: "24px", objectFit: "contain", alignSelf: "flex-start" }}
                alt="logo"
              />
            </div>
            <img
              src={featuredGame.charImageUrl || Banner1}
              className={classes.featuredImg}
              alt="char"
            />
          </div>
        )}

        {/* 7. Grid Games */}
        {/* 7. Grid Games (Sidebar for Slots) */}
        {selectedCat === 'slot' ? (
          <div className={classes.sidebarWrap}>
            {/* Sidebar */}
            <div className={classes.sidebar}>
              <div
                className={`${classes.sidebarItem} ${selectedProvider === 'all' ? classes.sidebarItemActive : ''}`}
                onClick={() => setSelectedProvider('all')}
              >
                <span style={{ fontWeight: '900', fontSize: '10px', color: '#ef4444' }}>HOT</span>
                <span style={{ fontSize: '16px' }}>🔥</span>
              </div>
              {providers.filter(p =>
                games.some(g => g.category === selectedCat && g.provider === p.brand_id)
              ).map(p => (
                <div
                  key={p.brand_id}
                  className={`${classes.sidebarItem} ${selectedProvider === p.brand_id ? classes.sidebarItemActive : ''}`}
                  onClick={() => setSelectedProvider(p.brand_id)}
                >
                  <img src={p.brand_img_cdn || p.brand_img} className={classes.sidebarLogo} alt={p.brand_title} />
                </div>
              ))}
            </div>

            {/* Content */}
            <div className={classes.contentArea}>
              <Grid container spacing={2}>
                {gridGames.map((game, idx) => {
                  const charImg = game.charImageUrl || game.backgroundUrl || "https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/4-GPLS.png";
                  const logoImg = game.logoUrl || WingoIcon;

                  // Force thumbnail layout for slots
                  return (
                    <Grid item xs={4} key={game._id || idx}>
                      <div className={classes.gridCard} onClick={() => openGame(game)} style={{ padding: 0, height: '130px', minHeight: 'unset', overflow: 'hidden' }}>
                        <img
                          src={charImg}
                          style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block', borderRadius: '12px' }}
                          alt={game.name}
                        />
                      </div>
                    </Grid>
                  )
                })}
              </Grid>
            </div>
          </div>
        ) : (
          /* Standard Grid for other categories */
          <Grid container spacing={2} className={classes.gridList}>
            {gridGames.map((game, idx) => {
              const charImg = game.charImageUrl || game.backgroundUrl || "https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/4-GPLS.png";
              const logoImg = game.logoUrl || WingoIcon;

              const isCardLayout = (selectedCat === 'sports' || selectedCat === 'casino');
              const gridSize = isCardLayout ? 6 : 3;

              return (
                <Grid item xs={gridSize} key={game._id || idx}>
                  {isCardLayout ? (
                    <div className={classes.gridCard} onClick={() => openGame(game)}>
                      <div className={classes.cardLeft}>
                        <div className={classes.cardName}>{game.name}</div>
                        <img src={logoImg} className={classes.cardLogo} alt="logo" />
                      </div>
                      <img src={charImg} className={classes.cardChar} alt="char" />
                    </div>
                  ) : (
                    <div className={classes.gridCard} onClick={() => openGame(game)} style={{ padding: 0, height: '130px', minHeight: 'unset', overflow: 'hidden' }}>
                      <img
                        src={charImg}
                        style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block', borderRadius: '12px' }}
                        alt={game.name}
                      />
                    </div>
                  )}
                </Grid>
              )
            })}
          </Grid>
        )}

        {/* Fallback empty state */}
        {filteredGames.length === 0 && (
          <Box p={3} textAlign="center">
            <Typography variant="body2" color="textSecondary">No games found in this category.</Typography>
          </Box>
        )}
          </>
        )}
      </div>

      <Dialog open={launching} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
        <Container align="center" style={{ backgroundColor: 'black', opacity: '0.8', height: '120px', width: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: 20 }}>
          <CircularProgress style={{ color: '#10B9B0' }} />
          <Typography style={{ marginTop: '15px', color: "white", fontWeight: 'bold', fontSize: '14px' }}>Launching...</Typography>
        </Container>
      </Dialog>
    </div>
  );
};

export default Home;
