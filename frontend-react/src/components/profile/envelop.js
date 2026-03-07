import React, { useState, useEffect } from 'react';
import { Paper, Container, Typography, Grid, Dialog, CircularProgress, Button, Box } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import * as api from "../../api/auth";
import { useHistory } from "react-router-dom";
import axios from 'axios';
import { makeStyles } from "@material-ui/core/styles";
import EmailIcon from '@material-ui/icons/Email';

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
  redEnvelopeCard: {
    backgroundColor: '#d64040',
    borderRadius: '20px',
    padding: '40px 20px',
    margin: '40px 20px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(214, 64, 64, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  },
  circle: {
    width: '120px',
    height: '120px',
    backgroundColor: '#ffd700',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
    transition: 'transform 0.2s',
    marginBottom: '20px',
    "&:active": {
      transform: 'scale(0.95)'
    }
  },
  claimText: {
    color: '#d64040',
    fontWeight: 'bold',
    fontSize: '24px'
  },
  amountText: {
    color: '#d64040',
    fontWeight: 'bold',
    fontSize: '28px'
  },
  statusText: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  subStatusText: {
    fontSize: '16px',
    opacity: 0.9
  },
  decorativeCircle: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: '-150px',
    left: '-50px'
  }
}));

const Envelop = () => {
  const classes = useStyles();
  const params = useParams();
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState();
  const [result, setResult] = useState();
  const [amount, setAmount] = useState(0);
  const [loader, setLoader] = useState(false);
  const history = useHistory();
  const URL = api.url;

  useEffect(() => {
    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = 'Bearer '.concat(foundUser.token);

      axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(response => {
          setUser(response.data);
        })
        .catch((error) => {
          console.log(error);
          history.push('/login');
        });

      // Use Axios for consistency instead of XMLHttpRequest
      axios.get(`${URL}/validateEnvelop/${params.id}/${foundUser.result.id}`)
        .then(response => {
          setResult(response.data);
          setLoader(false);
        })
        .catch(err => {
          console.log(err);
          setLoader(false);
        });

    } else {
      history.push("/login");
    }
  }, []);

  const claimEnvelop = async () => {
    setLoader(true);
    axios.get(`${URL}/claimEnvelop/${params.id}/${isAuth && isAuth.result.id}`)
      .then(response => {
        setAmount(response.data.amount);
        setLoader(false);
      })
      .catch(err => {
        console.log(err);
        setLoader(false);
      });
  }

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../profile')} />
          <Typography className={classes.headerTitle}>Red Envelope</Typography>
        </div>

        <div className={classes.redEnvelopeCard}>
          <div className={classes.decorativeCircle}></div>
          <EmailIcon style={{ fontSize: '60px', marginBottom: '20px', opacity: 0.8 }} />

          {result && !result.expired ? (
            <>
              <div className={classes.circle} onClick={amount === 0 ? claimEnvelop : null}>
                {amount !== 0 ? (
                  <Typography className={classes.amountText}>₹{amount.toFixed(2)}</Typography>
                ) : (
                  <Typography className={classes.claimText}>OPEN</Typography>
                )}
              </div>
              <Typography style={{ fontSize: '18px', fontWeight: '500' }}>
                {amount !== 0 ? 'Congratulations!' : 'Tap to open'}
              </Typography>
            </>
          ) : (
            <>
              <Typography className={classes.statusText}>FINISHED</Typography>
              <Typography className={classes.subStatusText}>I'm sorry you're late!</Typography>
            </>
          )}
        </div>

        <Dialog
          open={loader}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container align="center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '10px' }}>
            <CircularProgress style={{ color: 'white' }} />
            <Typography style={{ color: 'white', marginTop: '10px' }}>Please Wait!</Typography>
          </Container>
        </Dialog>
      </div>
    </div>
  )
}

export default Envelop;
