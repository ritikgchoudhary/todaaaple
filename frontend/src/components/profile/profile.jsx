import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, List, ListItem, makeStyles } from "@material-ui/core";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import SettingsIcon from "@material-ui/icons/Settings";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Header from "../../images/myHeader.jpg";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { Link } from "react-router-dom";
import * as api from "../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F5F9",
    display: "flex",
    justifyContent: "center",
    paddingBottom: "calc(60px + env(safe-area-inset-bottom))", // Space for bottom nav
  },
  frame: {
    width: "100%",
    maxWidth: 500,
    minHeight: "100vh",
    backgroundColor: "#fff",
    position: 'relative',
    paddingBottom: '20px'
  },
  headerContainer: {
    backgroundImage: `url(${Header})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "160px",
    padding: "20px",
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  balanceSection: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center'
  },
  listFullWidth: {
    marginLeft: '-15px',
    marginRight: '-15px'
  }
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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AccountCircleIcon style={{ fontSize: '40px', marginRight: '10px' }} />
              <Typography variant="h6" style={{ fontWeight: "bold" }}>
                {user && user[0].username}
              </Typography>
            </div>
            <SettingsIcon />
          </div>

          <div className={classes.balanceSection}>
            <Typography variant="h4" style={{ fontWeight: "bold" }}>
              ₹ {user && user[0].balance.toFixed(2)}
            </Typography>
            <Typography variant="body2" style={{ opacity: 0.8 }}>Account Balance</Typography>
          </div>
        </div>

        <Container>
          <List component="nav" aria-label="main mailbox folders" className={classes.listFullWidth} >
            <Link to='/agent-earning' style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>Earning as a Agent</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>

            <Link to='/mySalary' style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>My Daily Salary</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>

            <Link to='/invitationBonus' style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>My Invitation Bonus</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>

            <Link to='/offer-history' style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>My Offer history</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>


            <Link to='/redenvelope' style={{ textDecoration: 'none', color: 'black' }}>

              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>Red Envelope</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>
            <Link to='/mypromotion' style={{ textDecoration: 'none', color: 'black' }}>

              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>My Promotion</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>
            <Link to='/wallet' style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >

                  <Grid item>
                    <Typography>My Wallet</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>
            <Link to='/bank' style={{ textDecoration: 'none', color: 'black' }}>

              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>My bank</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>

            <Link to='/accountSecurity' style={{ textDecoration: 'none', color: 'black' }}>

              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>Account Security</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>

            <Link to='/about-us' style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>About us</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>

              </ListItem>
            </Link>

            <Link to='/help' style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>Customer Service</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>
              </ListItem>
            </Link>

            <Link to='/api-docs' style={{ textDecoration: 'none', color: 'black' }}>
              <ListItem button>
                <Grid
                  container
                  alignItems="center"
                  justify="space-between"
                  direction="row"
                >
                  <Grid item>
                    <Typography>API Docs</Typography>
                  </Grid>
                  <Grid item>
                    <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                  </Grid>
                </Grid>
              </ListItem>
            </Link>

            <ListItem button style={{ marginBottom: '50px' }} onClick={logOut}>
              <Grid
                container
                alignItems="center"
                justify="space-between"
                direction="row"
              >
                <Grid item>
                  <Typography>Sign out</Typography>
                </Grid>
                <Grid item>
                  <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
                </Grid>
              </Grid>

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
