import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import { Link } from "react-router-dom";
import {
  PersonOutline as AccountIcon,
  AccountBalanceWalletOutlined as DepositIcon,
  HomeOutlined as HomeIcon,
  Home as HomeIconSelected,
  CardGiftcardOutlined as BonusIcon,
  HeadsetMicOutlined as SupportIcon
} from "@material-ui/icons";
import WhatsApp from "../images/whatsapp.png";
import Telegram from "../images/telegram.png";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "500px",
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "transparent",
    zIndex: 2000,
    display: 'flex',
    justifyContent: 'center', // Center on PC
    paddingBottom: "env(safe-area-inset-bottom)",
  },
  navContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderTop: '1px solid #f0f2f5',
    boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
  },
  navAction: {
    minWidth: 'auto',
    padding: '8px 0',
    color: '#999',
    '&.Mui-selected': {
      color: '#05c0b8',
    },
    '& .MuiBottomNavigationAction-label': {
      fontSize: '10px !important',
      fontWeight: '600',
    }
  },
  homeAction: {
    color: '#05c0b8',
    '& .MuiBottomNavigationAction-wrapper': {
      transform: 'translateY(-12px)',
      backgroundColor: '#fff',
      borderRadius: '50%',
      width: '58px',
      height: '58px',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #f0f2f5',
    }
  }
}));

export default function NavBar() {
  const classes = useStyles();
  const pathname = window.location.pathname; // in case user visits the path directly. The BottomNavBar is able to follow suit.
  const [value, setValue] = useState(pathname);
  const [isAuth, setAuth] = useState(false);
  const handleChange = (event, newValue) => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setAuth(true)


    } else {
      setAuth(false)

    }
    setValue(newValue);
  };

  useEffect(() => {

    const interval = setInterval(() => {

      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        setAuth(true)


      } else {
        setAuth(false)

      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);




  return (

    <div className={classes.root}>
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels={true}
        className={classes.navContainer}
      >
        <BottomNavigationAction
          label="Account"
          value={isAuth ? "/profile" : "/login"}
          icon={<AccountIcon />}
          component={Link}
          to={isAuth ? "/profile" : '/login'}
          className={classes.navAction}
        />
        <BottomNavigationAction
          label="Deposit"
          value="/recharge"
          icon={<DepositIcon />}
          component={Link}
          to="/preOrder"
          className={classes.navAction}
        />
        <BottomNavigationAction
          label="Home"
          value="/"
          icon={value === '/' ? <HomeIconSelected /> : <HomeIcon />}
          component={Link}
          to="/"
          className={classes.homeAction}
        />
        <BottomNavigationAction
          label="Bonus"
          value="/invitationBonus"
          icon={<BonusIcon />}
          component={Link}
          to="/invitationBonus"
          className={classes.navAction}
        />
        <BottomNavigationAction
          label="Online Chat"
          value="/help"
          icon={<SupportIcon />}
          component={Link}
          to="/help"
          className={classes.navAction}
        />
      </BottomNavigation>

      <a href="https://wa.me/message/6F6ZZQERITWCK1">
        <div style={{
          position: "fixed",
          bottom: 130,
          right: "max(20px, calc(50% - 250px + 20px))",
          width: '50px',
          height: '50px',
          borderRadius: '50px',
          backgroundImage: `url(${WhatsApp})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1000
        }}>
        </div>
      </a>
      <a href="https://t.me/earningsource111">
        <div style={{
          position: "fixed",
          bottom: 70,
          right: "max(20px, calc(50% - 250px + 20px))",
          width: '50px',
          height: '50px',
          borderRadius: '50px',
          backgroundImage: `url(${Telegram})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1000
        }}>
        </div>
      </a>
    </div>

  );
}
