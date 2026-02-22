import React, { useState, useEffect } from "react";
import { Typography, Grid, Paper, Container, Chip, Dialog, Button, Box } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import * as api from "../../api/auth";
import { useHistory } from "react-router-dom";
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
    paddingBottom: '20px',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#05c0b8',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerTitle: {
    color: 'white',
    flexGrow: 1,
    textAlign: 'center',
    fontWeight: 600,
    marginRight: '20px'
  },
  inviteCard: {
    backgroundColor: '#05c0b8',
    margin: '20px',
    borderRadius: '20px',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white',
    boxShadow: '0 10px 20px rgba(5, 192, 184, 0.3)'
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  inviteCode: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginTop: '10px',
    color: '#05c0b8',
    letterSpacing: '2px'
  },
  inviteLabel: {
    fontSize: '14px',
    opacity: 0.9,
    marginTop: '5px'
  },
  actionArea: {
    padding: '0 20px',
    marginTop: 'auto'
  },
  actionButton: {
    backgroundColor: '#05c0b8',
    color: 'white',
    padding: '12px',
    borderRadius: '25px',
    textTransform: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    width: '100%',
    marginBottom: '15px',
    boxShadow: '0 4px 10px rgba(5, 192, 184, 0.4)',
    "&:hover": {
      backgroundColor: '#04a09a'
    }
  },
  infoText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '13px',
    margin: '20px'
  }
}));

const Invite = () => {
  const classes = useStyles();
  const history = useHistory();
  const URL = api.url;
  const [user, setUser] = useState();
  const [openDialog, setDialog] = React.useState({ open: false, body: '' });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = 'Bearer '.concat(foundUser.token);
      axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(response => {
          setUser(response.data);
        })
        .catch((error) => {
          console.log(error);
          history.push('/login');
        });
    } else {
      history.push('/login');
    }
  }, []);

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };

  const copy = () => {
    const message = `TODDAPPLE'S TRUSTED & LONG TERM PLATFORM  🥳
Minimum recharge 200
Minimum withdrawal 230
Referral bonus 100🥳🥳

3 times official prediction 

⏱️10:30 am - WING 3 MIN
⏱️2:30 pm  BIG/SMALL 3 MIN 
⏱️7:30  WINGO 3 MIN 

High salary 🥳🥳

10% first deposit bonus 

GAME LINK 🔗
https://toddapple.live/login/${user && user[0] ? user[0].id : ''}`;

    navigator.clipboard.writeText(message);
    setDialog({ ...openDialog, open: true, body: 'Copied Successfully' });
    setTimeout(dialogClose, 2000);
  }

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../profile')} />
          <Typography className={classes.headerTitle}>Invite Friends</Typography>
        </div>

        <div className={classes.inviteCard}>
          <div className={classes.qrContainer}>
            {user && user[0] && (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://toddapple.live/login/${user[0].id}`}
                alt="QR Code"
                style={{ width: '150px', height: '150px' }}
              />
            )}
          </div>
          <Typography variant="h5" style={{ fontWeight: 'bold', marginTop: '10px' }}>
            My Invite Code
          </Typography>
          <Paper elevation={0} style={{ padding: '10px 30px', borderRadius: '50px', marginTop: '15px', backgroundColor: 'white' }}>
            <Typography className={classes.inviteCode}>
              {user && user[0] && user[0].id}
            </Typography>
          </Paper>
        </div>

        <Typography className={classes.infoText}>
          Share your invitation link and start earning bonuses!
        </Typography>

        <div className={classes.actionArea}>
          <Button
            onClick={copy}
            className={classes.actionButton}
            startIcon={<Box component="span" style={{ fontSize: '20px' }}>📋</Box>}
          >
            Copy Invitation Link
          </Button>
        </div>

        <Dialog
          open={openDialog.open}
          onClose={dialogClose}
          PaperProps={{
            style: {
              borderRadius: '10px',
              minWidth: '250px'
            },
          }}
        >
          <Container style={{ padding: '20px' }}>
            <Typography align="center" style={{ fontWeight: 'bold', color: '#05c0b8' }}>
              {openDialog.body}
            </Typography>
          </Container>
        </Dialog>
      </div>
    </div>
  )
}

export default Invite;
