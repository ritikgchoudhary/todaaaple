import React, { useState, useEffect } from "react";
import { Typography, Dialog, Grid, Container, Button, FilledInput, InputLabel, FormControl, CircularProgress, Paper, Box } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useDispatch } from "react-redux";
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
  balanceCard: {
    backgroundColor: '#05c0b8',
    margin: '20px',
    borderRadius: '15px',
    padding: '20px',
    color: 'white',
    textAlign: 'center'
  },
  balanceLabel: {
    fontSize: '14px',
    opacity: 0.9
  },
  balanceValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  formSection: {
    padding: '0 20px'
  },
  inputGroup: {
    marginBottom: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '5px'
  },
  submitBtn: {
    backgroundColor: '#05c0b8',
    color: 'white',
    width: '100%',
    padding: '12px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    textTransform: 'none',
    marginTop: '10px',
    "&:hover": {
      backgroundColor: '#04a09a'
    }
  },
  recordsBtn: {
    backgroundColor: '#e0e0e0',
    color: '#333',
    width: '100%',
    padding: '12px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    textTransform: 'none',
    marginTop: '15px',
    "&:hover": {
      backgroundColor: '#d5d5d5'
    }
  },
  infoText: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px'
  },
  serviceTimes: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px'
  }
}));

const ApplyPromotion = () => {
  const classes = useStyles();
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState([{ bonus: 'Loading...' }]);
  const [loader, setLoader] = React.useState(false);
  const history = useHistory();
  const URL = api.url;
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ amount: 0 });
  const [openDialog, setDialog] = React.useState({ open: false, body: '' });

  useEffect(() => {
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
    } else {
      history.push('/login');
    }
  }, []);

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false, body: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setDialog({ ...openDialog, open: true, body: 'Please enter a valid amount' });
      return;
    }

    const AuthStr = 'Bearer '.concat(isAuth.token);
    setFormData({ ...formData, auth: AuthStr });

    setLoader(true);
    try {
      const { data } = await api.applyBonus(formData);
      dispatch({ type: "applyBonus", data: data });
      history.push("/mypromotion");
    } catch (error) {
      setDialog({ ...openDialog, open: true, body: error.response?.data?.error || 'Something went wrong' });
    }
    setLoader(false);
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../mypromotion')} />
          <Typography className={classes.headerTitle}>Apply to Balance</Typography>
        </div>

        <div className={classes.balanceCard}>
          <Typography className={classes.balanceLabel}>My Bonus</Typography>
          <Typography className={classes.balanceValue}>₹ {user && user[0] ? user[0].bonus : '...'}</Typography>
          <Typography style={{ fontSize: '11px', opacity: 0.8 }}>
            Min: ₹10 | Max: ₹200,000
          </Typography>
        </div>

        <Container className={classes.formSection}>
          <Typography style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Apply Amount</Typography>

          <FormControl fullWidth className={classes.inputGroup}>
            <InputLabel style={{ paddingLeft: '10px' }}>Enter Amount</InputLabel>
            <FilledInput
              type="number"
              name="amount"
              onChange={handleChange}
              disableUnderline
              startAdornment={<Typography style={{ marginRight: '10px', fontWeight: 'bold' }}>₹</Typography>}
              inputProps={{ style: { padding: '15px' } }}
            />
          </FormControl>

          <Button onClick={handleSubmit} className={classes.submitBtn}>
            Submit Application
          </Button>

          <Button onClick={() => history.push('/applyrecord')} className={classes.recordsBtn}>
            View Records
          </Button>

          <div className={classes.serviceTimes}>
            <Typography style={{ fontWeight: 'bold', marginBottom: '10px', color: '#05c0b8' }}>Service Time</Typography>
            <Typography className={classes.infoText}>Monday - Friday: 10:00 - 17:00</Typography>
            <Typography className={classes.infoText} style={{ marginTop: '10px', fontStyle: 'italic' }}>
              Limit: 1 time per day for Apply Bonus to Balance!
            </Typography>
          </div>
        </Container>

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
            <Typography align="center" style={{ marginBottom: '15px' }}>{openDialog.body}</Typography>
            <Button fullWidth onClick={dialogClose} style={{ color: '#05c0b8' }}>OK</Button>
          </Container>
        </Dialog>
      </div>
    </div>
  )
}

export default ApplyPromotion;
