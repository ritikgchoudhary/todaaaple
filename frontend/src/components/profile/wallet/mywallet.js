import React, { useState, useEffect } from 'react';
import { Typography, Grid, Container, Paper, Button, Box } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { Link, useHistory } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F5F9",
    display: "flex",
    justifyContent: "center",
    paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
  },
  frame: {
    width: "100%",
    maxWidth: 500,
    minHeight: "100vh",
    backgroundColor: "#fff",
    position: 'relative',
    paddingBottom: '20px'
  },
  header: {
    backgroundColor: '#05c0b8',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    flexDirection: 'column',
    position: 'relative',
    paddingBottom: '60px', // Space for the card overlap
    borderBottomLeftRadius: '20px',
    borderBottomRightRadius: '20px',
  },
  headerTop: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    marginBottom: '20px'
  },
  headerTitle: {
    flexGrow: 1,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '18px',
    marginRight: '20px'
  },
  userInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    padding: '0 10px'
  },
  walletCard: {
    margin: '-50px 20px 20px',
    padding: '20px',
    borderRadius: '15px',
    backgroundColor: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    position: 'relative',
    zIndex: 2
  },
  balanceTitle: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '5px'
  },
  balance: {
    color: '#05c0b8',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  actionButton: {
    flex: 1,
    textTransform: 'none',
    fontWeight: 'bold',
    padding: '10px',
    borderRadius: '10px',
    boxShadow: 'none',
    fontSize: '16px'
  },
  cashableText: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
}));

const MyWallet = () => {
  const classes = useStyles();
  const [isAuth, setAuth] = useState(false);
  const history = useHistory();
  const URL = api.url;
  const [user, setUser] = useState([{ balance: 0.0, username: '', withWallet: 0.0 }]);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = 'Bearer '.concat(foundUser.token);
      axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(response => {
          setUser(response.data);
          if (response.data.block) {
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

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <div className={classes.headerTop}>
            <ArrowBackIosIcon
              style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }}
              onClick={() => history.push('../profile')}
            />
            <Typography className={classes.headerTitle}>My Wallet</Typography>
          </div>

          <div className={classes.userInfo}>
            <Typography style={{ fontWeight: "bold", fontSize: '18px' }}>
              {user && user[0].username}
            </Typography>
            <AccountCircleIcon style={{ fontSize: '40px', opacity: 0.9 }} />
          </div>
        </div>

        <div className={classes.walletCard}>
          <Typography className={classes.balanceTitle}>Total Assets</Typography>
          <Typography className={classes.balance}>
            ₹ {user && user[0].balance ? user[0].balance.toFixed(2) : '0.00'}
          </Typography>

          <div className={classes.cashableText}>
            <span>Cashable Balance</span>
            <span style={{ color: '#333', fontWeight: 'bold' }}>
              ₹ {user && (user[0].withWallet < user[0].balance) ? user[0].withWallet.toFixed(2) : (user[0].balance ? user[0].balance.toFixed(2) : '0.00')}
            </span>
          </div>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <a href={`https://pay.toddapple.live/placeOrder3/${user && user[0].id}/${isAuth && isAuth.token}`} style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  className={classes.actionButton}
                  style={{ backgroundColor: '#05c0b8', color: 'white', width: '100%' }}
                >
                  Recharge
                </Button>
              </a>
            </Grid>
            <Grid item xs={6}>
              <Link to='/withdrawal' style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  className={classes.actionButton}
                  style={{ borderColor: '#05c0b8', color: '#05c0b8', width: '100%' }}
                >
                  Withdraw
                </Button>
              </Link>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default MyWallet;
