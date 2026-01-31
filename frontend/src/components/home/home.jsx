import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Dialog,
  Paper,
  IconButton,
  Avatar
} from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import * as api from "../../api/auth";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  VolumeUp as NoticeIcon,
  Close as CloseIcon,
  ExitToApp as RegisterIcon,
  AddCircle as LoginIcon
} from "@material-ui/icons";

import BannerAviator from "../../images/header.jpg";
import Game9Wickets from "../../images/wicket_9_banner.png";
import LuckySportsBanner from "../../images/lucky_sports_banner.png";
import SABABanner from "../../images/saba_sports_banner.png";
import CasinoBanner from "../../images/casino_banner.png";
import BonusBanner from "../../images/bonus_banner.png";
import Phonepe from "../../images/phonepe.png";

// Casino Providers
import EvoImg from "../../images/casino/evo.png";
import PtImg from "../../images/casino/pt.png";
import EzugiImg from "../../images/casino/ezugi.png";
import SexyImg from "../../images/casino/sexy.png";

// Crash Games
import AviatorRed from "../../images/crash/aviator_red.png";
import AviatorBlue from "../../images/crash/aviator_blue.png";
import ChickenImg from "../../images/crash/chicken.png";
import CricketImg from "../../images/cricket.png";
import WingoImg from "../../images/wingo.png";
import MinesImg from "../../images/mines.png";

const LOGO_URL = "https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
    paddingBottom: "100px",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center content on PC
  },
  mainContainer: {
    width: '100%',
    maxWidth: '500px', // Restrict width on PC for professional mobile-app look
    backgroundColor: '#fff',
    minHeight: '100vh',
    position: 'relative',
    boxShadow: '0 0 40px rgba(0,0,0,0.05)', // Subtle shadow on PC
    [theme.breakpoints.up('sm')]: {
      margin: '20px 0',
      borderRadius: '24px',
      minHeight: 'calc(100vh - 40px)',
      overflow: 'hidden',
    }
  },
  topBar: {
    backgroundColor: "#fff",
    padding: "10px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #f0f2f5",
  },
  downloadBtn: {
    background: "#f1a340",
    color: "#fff",
    borderRadius: "25px",
    textTransform: "none",
    fontWeight: "900",
    fontSize: '13px',
    padding: "6px 22px",
    boxShadow: 'none',
    '&:hover': {
      background: "#e09230",
    }
  },
  authBar: {
    backgroundColor: "#fff",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    height: "50px",
    objectFit: 'contain',
  },
  btnRegister: {
    background: "#ff5967",
    color: "#fff",
    borderRadius: "25px",
    marginRight: "10px",
    textTransform: "none",
    padding: "8px 22px",
    fontWeight: '800',
    fontSize: '14px',
    boxShadow: 'none',
  },
  btnLogin: {
    background: "#1aabff",
    color: "#fff",
    borderRadius: "25px",
    textTransform: "none",
    padding: "8px 22px",
    fontWeight: '800',
    fontSize: '14px',
    boxShadow: 'none',
  },
  heroBanner: {
    width: "100%",
    height: "220px",
    borderRadius: "24px",
    overflow: "hidden",
    margin: "10px 0 20px",
    position: "relative",
    backgroundColor: '#1a1a1c',
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
  },
  carouselTrack: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
  },
  dotContainer: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    zIndex: 10,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&.active': {
      backgroundColor: '#fff',
      width: '20px',
      borderRadius: '4px',
    }
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    color: '#fff',
    zIndex: 2,
    '& h5': {
      fontSize: '28px',
      fontWeight: '900',
      letterSpacing: '1px',
      textShadow: '0 4px 8px rgba(0,0,0,0.8)',
    },
    '& p': {
      fontSize: '14px',
      opacity: 0.9,
    }
  },
  announcementBar: {
    backgroundColor: "#fff",
    color: "#4a90e2",
    padding: "0 15px",
    display: "flex",
    alignItems: "center",
    borderRadius: "25px",
    margin: "0 20px 24px",
    border: '1px solid #e0e6ed',
    height: '42px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  newsTitle: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    paddingRight: '10px',
    marginRight: '10px',
    borderRight: '1px solid #eee',
    height: '24px',
    gap: '6px',
    '& span': {
      fontSize: '13px',
      fontWeight: '900',
      color: '#4a90e2',
      textTransform: 'uppercase',
    }
  },
  newsCarousel: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  newsSlider: {
    display: 'flex',
    whiteSpace: 'nowrap',
    animation: '$marquee 40s linear infinite',
    '&:hover': {
      animationPlayState: 'paused',
    }
  },
  slideItem: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a73e8',
    paddingRight: '50px',
  },
  "@keyframes marquee": {
    "0%": { transform: "translateX(100%)" },
    "100%": { transform: "translateX(-100%)" }
  },
  gameTypeWrapper: {
    width: "100%",
    padding: "10px 0 20px",
    backgroundColor: "rgba(248, 249, 251, 0.5)",
  },
  typeWrapper: {
    overflowX: "auto",
    scrollbarWidth: "none",
    WebkitOverflowScrolling: "touch",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    position: "relative",
    "&.rightSideBlurMask::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      width: "60px",
      height: "100%",
      background: "linear-gradient(to right, transparent, #fff)",
      pointerEvents: "none",
      zIndex: 2,
    }
  },
  tabScrollRoot: {
    display: "flex",
    listStyle: "none",
    padding: 0,
    margin: 0,
    gap: "0px", // Removed gap completely to be controlled by padding/margin
  },
  typeItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "68px",
    height: "78px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #f0f2f5",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    margin: "0 0.5px",
    "&:first-child": {
      marginLeft: "0px",
    },
    "&:last-child": {
      marginRight: "30px",
    },
    "& img": {
      width: "28px",
      height: "28px",
      marginBottom: "2px",
      objectFit: "contain",
      transition: "transform 0.3s ease",
    },
    "& span": {
      fontSize: "9.5px",
      fontWeight: "800",
      color: "#666",
      textAlign: "center",
      lineHeight: 1,
    },
    "&.active": {
      backgroundColor: "#ebf5ff",
      borderColor: "#7ebfff",
      boxShadow: "0 4px 12px rgba(126, 191, 255, 0.2)",
      "& span": {
        color: "#1a73e8",
      },
      "& img": {
        transform: "scale(1.05)",
      }
    },
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
    }
  },
  cockfightCard: {
    minWidth: "75px !important",
    height: "85px !important",
    background: "transparent !important",
    border: "none !important",
    boxShadow: "none !important",
    "& img": {
      filter: "none !important", // Keep original color
    },
    "&.active": {
      background: "linear-gradient(135deg, #ff5a5f 0%, #e0484d 100%) !important",
      boxShadow: "0 8px 15px rgba(255, 90, 95, 0.3) !important",
      borderRadius: "16px",
      "& span": { color: "#fff !important" },
      "& img": { filter: "brightness(2) !important" }
    }
  },
  catIconBox: {
    width: "36px", // Slightly smaller to fit box shape better
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5px",
    backgroundColor: "#f8f9fa",
    transition: 'all 0.3s ease',
  },
  catLabel: {
    fontSize: "10.5px", // Refined for box fit
    fontWeight: "800",
    color: "#444",
    textAlign: "center",
    transition: 'color 0.3s ease',
    lineHeight: 1.1,
  },
  featuredGrid: {
    padding: "0 20px",
  },
  featuredCard: {
    width: "100%",
    borderRadius: "20px",
    marginBottom: "20px",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#fff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    },
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    }
  },
  featuredLarge: {
    height: "220px",
  },
  featuredSmall: {
    height: "160px",
  },
  gridHalf: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  providerCard: {
    width: '100%',
    height: '140px',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
    },
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }
  },
  // Sports Section Styles (from reference image)
  gtWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    padding: '0 10px',
    marginBottom: '20px',
  },
  gameItem: {
    width: '100%',
    height: '140px',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    border: '1px solid #f0f3f8',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
    '&:active': {
      transform: 'scale(0.98)',
    },
  },
  featuredItem: {
    gridColumn: '1 / span 2',
    height: '200px',
    background: 'linear-gradient(to right, #fff 50%, #e7f3ff 100%)',
    padding: '30px',
    '& $gameItemName': {
      fontSize: '24px',
    },
    '& $gameItemLogo': {
      width: '110px',
    }
  },
  gameItemName: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#333',
    zIndex: 3,
    marginBottom: '10px',
    position: 'relative',
  },
  gameItemLogo: {
    width: '70px',
    height: 'auto',
    objectFit: 'contain',
    zIndex: 3,
    position: 'relative',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))',
  },
  athleteImg: {
    position: 'absolute',
    bottom: -10,
    right: -15,
    height: '115%',
    width: 'auto',
    zIndex: 2,
    objectFit: 'contain',
    pointerEvents: 'none',
  },

  // Casino Section Styles (from new reference image)
  casinoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '0 12px',
    marginBottom: '20px',
  },
  casinoItem: {
    width: '100%',
    height: '150px',
    borderRadius: '20px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5', // Light background
    backgroundImage: 'url(https://img.bzvm68.com/site_common/H5_7_mobile/game_item_background/bg-white.png)', // Using a light background if available, else solid
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    padding: '0 40px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    '&:active': {
      transform: 'scale(0.98)',
    },
    // Adding the abstract logo background effect
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '120px',
      height: '120px',
      backgroundImage: 'url(https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png)',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      opacity: 0.03,
      zIndex: 1,
    }
  },
  casinoChar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '55%',
    height: '100%',
    backgroundSize: 'contain',
    backgroundPosition: 'right bottom',
    backgroundRepeat: 'no-repeat',
    zIndex: 2,
    filter: 'drop-shadow(-10px 0 15px rgba(0,0,0,0.05))',
  },
  casinoContent: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '120px', // Center content in the left area
  },
  casinoName: {
    fontSize: '20px',
    fontWeight: '900',
    color: '#333',
    marginBottom: '8px',
  },
  casinoLogo: {
    height: '35px',
    width: 'auto',
    objectFit: 'contain',
  },
  gameGrid: {
    padding: "0 15px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: '8px',
    marginBottom: '15px',
  },
  gameCard: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    transition: 'all 0.2s ease',
    '&:active': {
      transform: 'scale(0.95)',
    }
  },
  gameImageWrapper: {
    width: "100%",
    aspectRatio: "1/1",
    overflow: "hidden",
    position: "relative",
  },
  gameImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  gameLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#333",
    padding: "6px 2px",
    textAlign: "center",
    backgroundColor: "#f8f9fa",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  favoriteIcon: {
    position: "absolute",
    top: "6px",
    right: "6px",
    backgroundColor: "rgba(255, 90, 95, 0.9)",
    borderRadius: "50%",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    zIndex: 2,
    '& svg': {
      fontSize: "14px",
      color: "#fff",
    }
  },
  slotContainer: {
    display: 'flex',
    padding: '0 10px',
    gap: '10px',
  },
  slotSidebar: {
    width: '70px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarItem: {
    width: '100%',
    padding: '8px 4px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    border: '1px solid #eef0f3',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&.active': {
      backgroundColor: '#ebfcfb',
      borderColor: '#05c0b8',
      '& $sidebarLabel': {
        color: '#05c0b8',
      }
    }
  },
  sidebarLabel: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  sidebarIcon: {
    width: '24px',
    height: '24px',
    objectFit: 'contain',
  },
  slotMain: {
    flexGrow: 1,
  },
  searchBar: {
    width: '100%',
    height: '40px',
    backgroundColor: '#f1f3f6',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    marginBottom: '15px',
    '& input': {
      border: 'none',
      background: 'transparent',
      outline: 'none',
      marginLeft: '10px',
      fontSize: '12px',
      width: '100%',
      color: '#666',
    }
  },
  gameGridSlot: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: '8px',
  }
}));

const Home = () => {
  const classes = useStyles();
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [notice, setNotice] = useState({ open: false, data: null });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('sports');

  const slides = [
    { image: "https://i.ibb.co/VWVvG2f/double-stake.png", title: "DOUBLE YOUR STAKE", subtitle: "100% Bonus, Double the Fun!" },
    { image: CasinoBanner, title: "CASINO", subtitle: "PREMIUM EXPERIENCE" },
    { image: BonusBanner, title: "BONUS", subtitle: "REFER & EARN MORE" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'sports', label: 'Sports', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/4_active.png" },
    { id: 'casino', label: 'Live Casino', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/3.png" },
    { id: 'crash', label: 'Crash Game', icon: "https://img.bzvm68.com/GoWin11/crash_game_icon/crash.png" },
    { id: 'slot', label: 'Slot Game', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/2.png" },
    { id: 'lottery', label: 'Lottery', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/5.png" },
    { id: 'cards', label: 'Card Game', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/gowin11/6.png" },
    { id: 'cockfight', label: 'Cockfight Live', icon: "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon/8.png" },
  ];

  const crashGames = [
    { title: "Aviator", image: AviatorRed },
    { title: "AviatorX", image: AviatorBlue },
    { title: "Aviator Extra", image: AviatorRed },
    { title: "Chicken Dash", image: ChickenImg },
    { title: "Frog Dash", image: ChickenImg },
    { title: "Cricket Burst", image: CricketImg },
    { title: "Firework", image: WingoImg },
    { title: "Go Rush", image: MinesImg },
    { title: "Crash Goal", image: CricketImg },
  ];

  const lotteryCards = [
    { title: "INDIA LOTTO", subtitle: "National Jackpot", image: LuckySportsBanner, logo: "🇮🇳" },
    { title: "SEA", subtitle: "TC GAMING", image: SABABanner, logo: "🎰" },
    { title: "BBIN", subtitle: "THE GAMING BEAT", image: CasinoBanner, logo: "🎮" },
  ];

  const slotProviders = [
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'hot', label: 'HOT', icon: '🔥' },
    { id: 'jdb', label: 'JDB', icon: '🎰' },
    { id: 'r88', label: 'R88', icon: '💎' },
    { id: 'jili', label: 'JILI', icon: '🃏' },
    { id: 'pg', label: 'PG', icon: '🔥' },
    { id: 'maha', label: 'Maha', icon: '🐘' },
  ];

  const slotGames = [
    { title: "Aviator", image: AviatorRed },
    { title: "Chicken Dash", image: ChickenImg },
    { title: "Cleopatra", image: CasinoBanner },
    { title: "Super Ace", image: EvoImg },
    { title: "Maya Gems", image: PtImg },
    { title: "Piggy Bank", image: LuckySportsBanner },
    { title: "Fortune Gems", image: SexyImg },
    { title: "Double Ace", image: EzugiImg },
  ];

  const [selectedProvider, setSelectedProvider] = useState('hot');
  const [selectedCardProvider, setSelectedCardProvider] = useState('jili');

  const cardProviders = [
    { id: 'jili', label: 'JILI', icon: '🎰' },
    { id: 'r88', label: 'R88', icon: '💎' },
    { id: 'km', label: 'KM', icon: '🃏' },
    { id: 'jdb', label: 'JDB', icon: '🔥' },
    { id: 'cq9', label: 'CQ9', icon: '🎮' },
  ];

  const cardGames = [
    { title: "Teenpatti 20-20", image: SexyImg, badge: "JL" },
    { title: "TeenPatti Joker", image: EvoImg, badge: "JL" },
    { title: "TeenPatti", image: PtImg, badge: "JL" },
    { title: "Pool Rummy", image: EzugiImg, badge: "JL" },
    { title: "Rummy", image: SexyImg, badge: "JL" },
    { title: "Andar Bahar", image: EvoImg, badge: "JL" },
    { title: "Domino Go", image: PtImg, badge: "JL" },
    { title: "Ultimate Texas", image: EzugiImg, badge: "JL" },
    { title: "Video Poker", image: SexyImg, badge: "JL" },
  ];

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setIsAuth(true);
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios.get(`${api.url}/getUserHome/${foundUser.result.id}/`, {
        headers: { Authorization: AuthStr },
      }).then((res) => {
        setUser(res.data[0]);
      }).catch(err => {
        console.error(err);
      });
    }

    axios.get(`${api.url}/getNotice`).then((res) => {
      if (res.data.notice?.heading) {
        setNotice({ open: true, data: res.data.notice });
      }
    });
  }, []);

  return (
    <div className={classes.root}>
      <div className={classes.mainContainer}>
        <div className={classes.topBar}>
          <Box display="flex" alignItems="center">
            <CloseIcon style={{ fontSize: 24, color: '#333', marginRight: '15px', cursor: 'pointer' }} />
            <img src={LOGO_URL} alt="Deltin" style={{ height: '30px', marginRight: '10px' }} />
            <Typography style={{ fontWeight: 900, fontSize: '16px', color: '#1a1a1a' }}>DELTIN7 APP</Typography>
          </Box>
          <Button variant="contained" className={classes.downloadBtn}>Download</Button>
        </div>

        {/* Logo / Auth Bar */}
        <div className={classes.authBar}>
          <img src={LOGO_URL} alt="Deltin Sport" className={classes.logo} />
          {!isAuth ? (
            <Box display="flex">
              <Button
                variant="contained"
                className={classes.btnRegister}
                onClick={() => history.push('/login')}
              >
                Register
              </Button>
              <Button
                variant="contained"
                className={classes.btnLogin}
                onClick={() => history.push('/login')}
              >
                Log-in
              </Button>
            </Box>
          ) : (
            <Box textAlign="right" onClick={() => history.push('/profile')} style={{ cursor: 'pointer' }}>
              <Typography variant="overline" style={{ color: '#888', fontWeight: 'bold', display: 'block', lineHeight: 1 }}>ACCOUNT BALANCE</Typography>
              <Typography variant="h5" style={{ color: '#05c0b8', fontWeight: '900' }}>₹{user?.balance.toFixed(2)}</Typography>
            </Box>
          )}
        </div>

        {/* Hero Banner Slider */}
        <Box px={2.5}>
          <div className={classes.heroBanner}>
            <AnimatePresence initial={false}>
              <motion.img
                key={currentSlide}
                src={slides[currentSlide].image}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={classes.heroImage}
              />
            </AnimatePresence>
            <div className={classes.dotContainer}>
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`${classes.dot} ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </div>
        </Box>

        {/* Announcement Section (Ticker) */}
        <div className={classes.announcementBar}>
          <div className={classes.newsTitle}>
            <NoticeIcon style={{ fontSize: 20 }} />
            <span>Announcement</span>
          </div>
          <div className={classes.newsCarousel}>
            <div className={classes.newsSlider}>
              <span className={classes.slideItem}>📢 Maintenance Announcement - SSG Live Casino will be under maintenance.</span>
              <span className={classes.slideItem}>⚠️ Maintenance Announcement - R88 will be under maintenance from 04/02.</span>
              <span className={classes.slideItem}>⚙️ Maintenance Announcement - CQ9 will be under maintenance from 14/03.</span>
              <span className={classes.slideItem}>⛔ Please do not save old UPI for deposit to avoid loss of funds.</span>
              <span className={classes.slideItem}>✨ Welcome to Deltin7 - India's most trusted gaming platform!</span>
            </div>
          </div>
        </div>

        {/* Categories Menu Section */}
        <div className={classes.gameTypeWrapper}>
          <div className={`${classes.typeWrapper} rightSideBlurMask`}>
            <ul className={classes.tabScrollRoot}>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <div
                    className={`${classes.typeItem} ${selectedCategory === cat.id ? 'active' : ''} ${cat.id === 'cockfight' ? classes.cockfightCard : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <img src={cat.icon} alt={cat.label} />
                    <span>{cat.label}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Custom Scroll Indicator Bar */}
        <Box px={20} mb={3} mt={-1}>
          <div style={{ height: '3px', width: '100px', margin: '0 auto', backgroundColor: '#f0f2f5', borderRadius: '10px', position: 'relative', overflow: 'hidden' }}>
            <div
              id="category-scroll-indicator"
              style={{
                height: '100%',
                width: '30%',
                backgroundColor: '#05c0b8',
                borderRadius: '10px',
                position: 'absolute',
                left: '0%',
                transition: 'left 0.1s ease-out',
                boxShadow: '0 0 8px rgba(5, 192, 184, 0.4)'
              }}
            />
          </div>
        </Box>

        {/* Dynamic Content Area */}
        <Box minHeight="500px">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {selectedCategory === 'sports' && (
                <div className={classes.gtWrapper}>
                  {[
                    { id: '9W', name: '9WICKETS', type: 'featured', char: '4-GP9W.png', icon: '4-GP9W.png' },
                    { id: 'LS', name: 'Lucky Sports', type: 'grid', char: '4-GPLS.png', icon: '4-GPLS.png' },
                    { id: 'SABA', name: 'SABA', type: 'grid', char: '4-GPOW.png', icon: '4-GPOW-en_US.png' },
                    { id: 'NBB', name: 'NewBB', type: 'grid', char: '4-GPNBB.png', icon: '4-GPBB-new bb.png' },
                    { id: 'SBO', name: 'SBO', type: 'grid', char: '4-GPSB2.png', icon: '4-GPSB2.png' },
                    { id: 'FB', name: 'FB', type: 'grid', char: '4-GPFB.png', icon: '4-GPFB-en_US.png' },
                  ].map((game) => (
                    <div
                      key={game.id}
                      className={`${classes.gameItem} ${game.type === 'featured' ? classes.featuredItem : ''}`}
                      onClick={() => history.push('/cricket')}
                    >
                      <div className={classes.gameItemName}>{game.name}</div>
                      <img
                        src={`https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/${game.icon}`}
                        alt={game.name}
                        className={classes.gameItemLogo}
                      />
                      <img
                        src={`https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/${game.char}`}
                        alt="Athlete"
                        className={classes.athleteImg}
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedCategory === 'casino' && (
                <div className={classes.casinoWrapper}>
                  {[
                    { id: 'EVO', name: 'EVO', char: '3-1.png', icon: '3-GPEV.png' },
                    { id: 'PT', name: 'PT', char: '3-2.png', icon: '3-GPPT3.png' },
                    { id: 'EZUGI', name: 'Ezugi', char: '3-3.png', icon: '3-GPEZ.png' },
                    { id: 'SEXY', name: 'SEXY', char: '3-4.png', icon: '3-GPSX2.png' },
                    { id: 'SSG', name: 'SSG', char: '3-5.png', icon: '3-GPSS.png' },
                    { id: 'MG', name: 'MG', char: '3-6.png', icon: '3-GPMG2.png' },
                    { id: 'PA', name: 'PA', char: '3-7.png', icon: '3-GPAG2.png' },
                  ].map((game) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={classes.casinoItem}
                      onClick={() => history.push('/casino')}
                    >
                      <div
                        className={classes.casinoChar}
                        style={{ backgroundImage: `url(https://img.bzvm68.com/site_common/H5_7_mobile/hall_pics/gowin11/${game.char})` }}
                      />
                      <div className={classes.casinoContent}>
                        <div className={classes.casinoName}>{game.name}</div>
                        <img
                          src={`https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/${game.icon}`}
                          alt={game.name}
                          className={classes.casinoLogo}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedCategory === 'crash' && (
                <div className={classes.gameGrid}>
                  {crashGames.map((game, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={classes.gameCard}
                      onClick={() => history.push('/aviator')}
                    >
                      <div className={classes.favoriteIcon}>
                        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                      </div>
                      <div className={classes.gameImageWrapper}>
                        <img src={game.image} className={classes.gameImage} alt={game.title} />
                      </div>
                      <Typography className={classes.gameLabel}>{game.title}</Typography>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedCategory === 'slot' && (
                <div className={classes.slotContainer}>
                  <div className={classes.slotSidebar}>
                    {slotProviders.map((p) => (
                      <div
                        key={p.id}
                        className={`${classes.sidebarItem} ${selectedProvider === p.id ? 'active' : ''}`}
                        onClick={() => setSelectedProvider(p.id)}
                      >
                        <Typography className={classes.sidebarLabel}>{p.label}</Typography>
                        <span style={{ fontSize: '18px' }}>{p.icon}</span>
                      </div>
                    ))}
                  </div>
                  <div className={classes.slotMain}>
                    <div className={classes.searchBar}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <input placeholder="Search games..." type="text" />
                    </div>
                    <div className={classes.gameGridSlot}>
                      {slotGames.map((game, index) => (
                        <div key={index} className={classes.gameCard} onClick={() => history.push('/casino')}>
                          <div className={classes.favoriteIcon}><svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></div>
                          <div className={classes.gameImageWrapper}><img src={game.image} className={classes.gameImage} alt={game.title} /></div>
                          <Typography className={classes.gameLabel}>{game.title}</Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === 'cards' && (
                <div className={classes.slotContainer}>
                  <div className={classes.slotSidebar}>
                    {cardProviders.map((p) => (
                      <div
                        key={p.id}
                        className={`${classes.sidebarItem} ${selectedCardProvider === p.id ? 'active' : ''}`}
                        onClick={() => setSelectedCardProvider(p.id)}
                      >
                        <Typography className={classes.sidebarLabel}>{p.label}</Typography>
                        <span style={{ fontSize: '18px' }}>{p.icon}</span>
                      </div>
                    ))}
                  </div>
                  <div className={classes.slotMain}>
                    <div className={classes.gameGridSlot}>
                      {cardGames.map((game, index) => (
                        <div key={index} className={classes.gameCard} onClick={() => history.push('/casino')}>
                          <div style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(252, 194, 94, 0.9)', padding: '2px 4px', borderRadius: '4px', zIndex: 2 }}>
                            <Typography style={{ fontSize: '8px', fontWeight: 'bold', color: '#000' }}>{game.badge}</Typography>
                          </div>
                          <div className={classes.gameImageWrapper}><img src={game.image} className={classes.gameImage} alt={game.title} /></div>
                          <Typography className={classes.gameLabel}>{game.title}</Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === 'lottery' && (
                <div className={classes.providerList}>
                  {lotteryCards.map((lottery, index) => (
                    <motion.div
                      key={index}
                      className={classes.providerCard}
                      onClick={() => history.push('/wingo')}
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                        height: '160px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 25px'
                      }}
                    >
                      <Box style={{ flex: 1, zIndex: 1 }}>
                        <Typography variant="h6" style={{ fontWeight: 900, color: '#1a237e' }}>{lottery.title}</Typography>
                        <Typography variant="body2" style={{ fontWeight: 'bold', color: '#5c6bc0' }}>{lottery.subtitle}</Typography>
                        <div style={{ marginTop: 10, width: '50px', height: '50px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{lottery.logo}</div>
                      </Box>
                      <img src={lottery.image} alt={lottery.title} style={{ width: '160px', height: 'auto', position: 'absolute', right: '-10px', bottom: '0', opacity: 0.8 }} />
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedCategory === 'cockfight' && (
                <div className={classes.providerList}>
                  <motion.div
                    className={classes.providerCard}
                    onClick={() => history.push('/casino')}
                    style={{
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                      height: '180px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 25px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box style={{ zIndex: 1 }}>
                      <Typography variant="h5" style={{ fontWeight: 900, color: '#1a237e' }}>SV388</Typography>
                      <div style={{ marginTop: '10px', width: '50px', height: '50px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography style={{ fontWeight: 900, color: '#fbc02d', fontSize: '20px' }}>SV</Typography>
                      </div>
                    </Box>
                    <img src={SABABanner} alt="SV388" style={{ position: 'absolute', right: '-20px', bottom: '0', width: '220px', height: 'auto', opacity: 0.9 }} />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Notice Dialog */}
        <Dialog open={notice.open} onClose={() => setNotice({ ...notice, open: false })} PaperProps={{ style: { borderRadius: '20px' } }}>
          <Box p={4}>
            <Typography variant="h5" style={{ fontWeight: 900, marginBottom: '16px', color: '#333' }}>{notice.data?.heading}</Typography>
            <Typography variant="body1" style={{ color: '#666', lineHeight: 1.6 }}>{notice.data?.body}</Typography>
            <Box mt={4} textAlign="center">
              <Button fullWidth variant="contained" style={{ backgroundColor: '#05c0b8', color: '#fff', borderRadius: '12px', padding: '12px', fontWeight: 'bold' }} onClick={() => setNotice({ ...notice, open: false })}>
                Great, Let's Play!
              </Button>
            </Box>
          </Box>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;
