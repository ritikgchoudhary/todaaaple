import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, List, ListItem, makeStyles, IconButton, Box } from "@material-ui/core";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import SettingsIcon from "@material-ui/icons/Settings";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import CardGiftcardIcon from "@material-ui/icons/CardGiftcard";
import HistoryIcon from "@material-ui/icons/History";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import SecurityIcon from "@material-ui/icons/Security";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import HeadsetMicOutlinedIcon from "@material-ui/icons/HeadsetMicOutlined";
import CodeIcon from "@material-ui/icons/Code";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import Header from "../../images/myHeader.jpg";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import { Link } from "react-router-dom";
import * as api from "../../api/auth";
import axios from "axios";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F5F9",
    display: "flex",
    justifyContent: "center",
    paddingBottom: "calc(68px + env(safe-area-inset-bottom))",
  },
  frame: {
    width: "100%",
    maxWidth: 500,
    minHeight: "100vh",
    backgroundColor: "#fff",
    position: "relative",
    paddingBottom: 32,
  },
  headerContainer: {
    backgroundImage: `url(${Header})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "160px",
    padding: "20px 20px 24px",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userAvatar: {
    fontSize: "44px !important",
    marginRight: 14,
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
  },
  userName: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "1.125rem",
    fontWeight: 700,
    letterSpacing: "0.01em",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  settingsBtn: {
    color: "rgba(255,255,255,0.95)",
    padding: 8,
    "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
  },
  balanceSection: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  balanceAmount: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "1.75rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    textShadow: "0 1px 3px rgba(0,0,0,0.25)",
  },
  balanceLabel: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "0.8125rem",
    fontWeight: 500,
    opacity: 0.9,
    marginTop: 4,
  },
  listFullWidth: {
    paddingTop: 20,
    paddingLeft: 16,
    paddingRight: 16,
  },
  listItem: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottom: "1px solid #F1F5F9",
  },
  listItemIcon: {
    minWidth: 40,
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    color: "#0F766E",
    backgroundColor: "rgba(15, 118, 110, 0.08)",
  },
  listItemText: {
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "0.9375rem",
    fontWeight: 600,
    color: "#0F172A",
  },
  listItemArrow: {
    color: "#94A3B8",
    fontSize: "18px !important",
  },
  signOutIcon: {
    color: "#DC2626",
    backgroundColor: "rgba(220, 38, 38, 0.08)",
  },
  signOutText: {
    color: "#DC2626",
    fontWeight: 600,
  },
}));

const Profile = () => {
  const classes = useStyles();
  const URL = api.url;
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState([{ balance: 0.0 }]);
  const [isBlocked, setBlock] = useState({ open: false, msg: '' });
  const history = useHistory();

  const removeRecaptcha = () => {
    const script = document.getElementById('recaptcha-script');
    if (script) {
      script.remove();
    }

    const recaptchaElems = document.getElementsByClassName('grecaptcha-badge');
    if (recaptchaElems.length) {
      recaptchaElems[0].remove();
    }
  }

  useEffect(() => {
    removeRecaptcha();
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {

      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = 'Bearer '.concat(foundUser.token);
      axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(response => {
          setUser(response.data);
          if (response.data.block) {
            setBlock({ ...isBlocked, open: true, msg: 'Account Suspended' });
            localStorage.removeItem("user");
            window.location.replace("/login");

          }
        })
        .catch((error) => {
          console.log(error);
          history.push('/login');
        });

    } else {
      history.push('/login');

    }

  }, []);
  const [open, setOpen] = React.useState(false);

  const logOut = () => {
    localStorage.removeItem("user");
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
    } else {
      window.location.replace("/login");
    }
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <Dialog
          open={isBlocked.open}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container align="center" style={{ backgroundColor: 'black', opacity: '0.6', height: '80px', paddingTop: "10px" }}>
            <Typography style={{ paddingTop: '10px', color: "white" }}>{isBlocked.msg}</Typography>
          </Container>
        </Dialog>

        <div className={classes.headerContainer}>
          <div className={classes.userInfo}>
            <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              <AccountCircleIcon className={classes.userAvatar} />
              <Typography className={classes.userName} noWrap>
                {user && user[0] && user[0].username}
              </Typography>
            </div>
            <IconButton className={classes.settingsBtn} aria-label="Settings" component={Link} to="/accountSecurity">
              <SettingsIcon style={{ fontSize: 24 }} />
            </IconButton>
          </div>

          <div className={classes.balanceSection}>
            <Typography className={classes.balanceAmount}>
              ₹ {user && user[0] && user[0].balance != null ? Number(user[0].balance).toFixed(2) : "0.00"}
            </Typography>
            <Typography className={classes.balanceLabel}>Account Balance</Typography>
          </div>
        </div>

        <Container disableGutters>
          <List component="nav" aria-label="Profile menu" className={classes.listFullWidth}>
            <Link to="/agent-earning" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><TrendingUpIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>Earning as an Agent</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/mySalary" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><AttachMoneyIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>My Daily Salary</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/invitationBonus" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><CardGiftcardIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>My Invitation Bonus</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/offer-history" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><HistoryIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>My Offer History</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/redenvelope" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><MailOutlineIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>Red Envelope</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/mypromotion" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><LocalOfferIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>My Promotion</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/wallet" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><AccountBalanceWalletIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>My Wallet</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/bank" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><AccountBalanceIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>My Bank</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/accountSecurity" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><SecurityIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>Account Security</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/about-us" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><InfoOutlinedIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>About Us</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/help" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><HeadsetMicOutlinedIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>Customer Service</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <Link to="/api-docs" style={{ textDecoration: "none", color: "inherit" }}>
              <ListItem button className={classes.listItem}>
                <Box className={classes.listItemIcon}><CodeIcon style={{ fontSize: 22 }} /></Box>
                <Typography className={classes.listItemText}>API Docs</Typography>
                <Box flex={1} />
                <ArrowForwardIosIcon className={classes.listItemArrow} />
              </ListItem>
            </Link>
            <ListItem button className={classes.listItem} style={{ marginBottom: 32 }} onClick={logOut}>
              <Box className={`${classes.listItemIcon} ${classes.signOutIcon}`}><ExitToAppIcon style={{ fontSize: 22 }} /></Box>
              <Typography className={`${classes.listItemText} ${classes.signOutText}`}>Sign Out</Typography>
              <Box flex={1} />
              <ArrowForwardIosIcon className={classes.listItemArrow} />
            </ListItem>
          </List>
        </Container>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"

        >

          <DialogContent style={{ borderRadius: '20px' }}>
            <DialogContentText id="alert-dialog-description" style={{ color: 'black' }}>
              Force Clear Cache ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" >
              Cancel
            </Button>
            <Button href="#" onClick={handleClose} color="secondary" autoFocus>
              Clear
            </Button>
          </DialogActions>
        </Dialog>

      </div>
    </div>
  );
};

export default Profile;
