import React from "react";
import { useLocation, Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core";

const FOOTER_ICON_BASE = "https://img.bzvm68.com/site_common/H5_7_mobile/footer_icon";
const GAME_TYPE_ICON_BASE = "https://img.bzvm68.com/site_common/H5_7_mobile/game_type_icon";
const SPORTS_ICON = `${GAME_TYPE_ICON_BASE}/gowin11/4_active.png`;
const WINGO_ICON = `${GAME_TYPE_ICON_BASE}/2.png`;

const useStyles = makeStyles((theme) => ({
  FooterDiv: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    background: "#fff",
    boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
    // Phone safe area: notch/home indicator (iPhone X+, Android gesture)
    paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
    paddingLeft: "env(safe-area-inset-left)",
    paddingRight: "env(safe-area-inset-right)",
    maxWidth: "100vw",
  },
  footerInner: {
    width: "100%",
    maxWidth: 480,
  },
  mobile_footer__background: {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-around",
    background: "transparent",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: "10px 4px 8px",
    minHeight: "56px",
    "@media (max-width: 360px)": {
      padding: "8px 2px 6px",
      minHeight: "52px",
    },
  },
  linkItem: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "rgba(0,0,0,0.85)",
    cursor: "pointer",
    // Min 44px tap target (Apple HIG)
    minHeight: 44,
    "& a": {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: 44,
      textDecoration: "none",
      color: "inherit",
      padding: "4px 0",
    },
  },
  linkItemActive: {
    color: "#1976d2",
    "& $footer_icon img": {
      opacity: 1,
    },
  },
  footer_icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    flexShrink: 0,
    "& img": {
      width: 26,
      height: 26,
      objectFit: "contain",
      display: "block",
    },
    "@media (max-width: 360px)": {
      "& img": {
        width: 24,
        height: 24,
      },
    },
  },
  ellipsis: {
    width: "100%",
    textAlign: "center",
    fontSize: "clamp(10px, 2.5vw, 12px)",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingLeft: 4,
    paddingRight: 4,
    lineHeight: 1.2,
  },
  badge: {
    position: "relative",
    "& sup": {
      position: "absolute",
      top: -2,
      right: -8,
      minWidth: 14,
      height: 14,
      borderRadius: 7,
      fontSize: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f44336",
      color: "#fff",
    },
  },
}));

export default function NavBar() {
  const classes = useStyles();
  const location = useLocation();
  const pathname = location.pathname || "/";

  const isHome = pathname === "/";
  const isAccount = pathname === "/profile" || pathname.startsWith("/accountSecurity") || pathname === "/bank" || pathname === "/address" || pathname === "/financial";
  const isSports = pathname === "/sports";
  const isWingo = pathname.startsWith("/wingo");
  const isChat = pathname === "/help" || pathname === "/contact";

  const items = [
    {
      symbol: "account",
      label: "Account",
      to: "/profile",
      icon: `${FOOTER_ICON_BASE}/footer_account.png`,
      active: isAccount,
      badge: 0,
    },
    {
      symbol: "sports",
      label: "Sports",
      to: "/sports",
      icon: SPORTS_ICON,
      active: isSports,
    },
    {
      symbol: "home",
      label: "Home",
      to: "/",
      icon: isHome ? `${FOOTER_ICON_BASE}/footer_home_active.png` : `${FOOTER_ICON_BASE}/footer_home.png`,
      active: isHome,
      isMain: true,
    },
    {
      symbol: "wingo",
      label: "Wingo",
      to: "/wingo/1",
      icon: WINGO_ICON,
      active: isWingo,
    },
    {
      symbol: "customService",
      label: "Online Chat",
      to: "/help",
      icon: `${FOOTER_ICON_BASE}/footer_customService.png`,
      active: isChat,
    },
  ];

  return (
    <div className={classes.FooterDiv}>
      <div className={classes.footerInner}>
        <div className={classes.mobile_footer__background}>
          {items.map((item) => (
            <div
              key={item.symbol}
              className={`${classes.linkItem} ${item.active ? `${classes.linkItemActive} isActive` : ""} ${item.isMain ? "linkMain" : ""}`}
              data-symbol={item.symbol}
            >
              <Link to={item.to}>
                {item.symbol === "account" ? (
                  <div className={classes.badge}>
                    <div className={classes.footer_icon}>
                      <img src={item.icon} alt="" />
                    </div>
                    {item.badge > 0 && <sup className="el-badge__content el-badge__content--danger is-fixed">{item.badge}</sup>}
                  </div>
                ) : (
                  <div className={classes.footer_icon}>
                    <img src={item.icon} alt="" />
                  </div>
                )}
                <div className={classes.ellipsis}>{item.label}</div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
