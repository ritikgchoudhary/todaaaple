import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  FormControl,
  InputLabel,
  FilledInput,
  Container,
  Button,
  MenuItem,
  Select,
  Dialog,
  CircularProgress,
  Paper
} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link, useHistory } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { useDispatch } from "react-redux";
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
    marginRight: '20px' // offset for back button
  },
  content: {
    padding: '20px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  actionBtn: {
    width: "100%",
    height: "50px",
    borderRadius: "25px",
    backgroundColor: "#05c0b8",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "none",
    marginTop: "20px",
    "&:hover": {
      backgroundColor: "#04a09a",
    },
  },
  historyBtn: {
    width: "100%",
    height: "50px",
    borderRadius: "25px",
    backgroundColor: "#757575",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "none",
    marginTop: "15px",
    "&:hover": {
      backgroundColor: "#616161",
    },
  },
  otpContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  otpBtn: {
    backgroundColor: '#05c0b8',
    color: 'white',
    marginLeft: '10px',
    height: '56px',
    minWidth: '80px',
    "&:hover": {
      backgroundColor: '#04a09a',
    }
  }
}));

const MyRedEnvelop = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [isAuth, setAuth] = useState(false);
  const history = useHistory();
  const URL = api.url;

  const [user, setUser] = useState([{ balance: 0.0 }]);
  const [formData, setFormData] = useState({ amount: 0, type: 'Fixed Amount', qty: 0, auth: '' });
  const [otp, setOtp] = useState();
  const [canRun, setRun] = useState(false);
  const [counter, setCounter] = useState(90);
  const [openDialog, setDialog] = React.useState({ open: false, body: '' });
  const [loader, setLoader] = React.useState(false);

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };

  useEffect(() => {
    if (canRun && counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [canRun, counter]);

  const sendOTP = async (e) => {
    setCounter(90);
    setRun(true);
    const data = {
      phone: user[0].phone,
    };
    try {
      await axios.post(`${URL}/sendOTPEnv`, data);
    } catch (e) {
      console.log("Error sending OTP");
    }
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = 'Bearer '.concat(foundUser.token);
      axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(response => {
          setUser(response.data);
          if (response.data[0].block) {
            // Handle block
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

  const handleChange = (e) => {
    const AuthStr = 'Bearer '.concat(isAuth.token);
    setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id, auth: AuthStr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      const { data } = await api.createEnvelop(formData);
      dispatch({ type: "createEnvelop", data: data });
      setLoader(false);
      history.push("/redEnvelopeHistory");
    } catch (error) {
      setLoader(false);
      setDialog({ ...openDialog, open: true, body: error.response?.data?.error || "Error creating envelope" });
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={history.goBack} />
          <Typography className={classes.headerTitle}>Red Envelope</Typography>
        </div>

        <Container className={classes.content}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl variant="filled" fullWidth className={classes.inputGroup}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    defaultValue="Fixed Amount"
                    name='type'
                    onChange={handleChange}
                    disableUnderline
                    style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
                  >
                    <MenuItem value='Fixed amount'>Fixed Amount</MenuItem>
                    <MenuItem value='Lucky Draw'>Lucky Draw</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl variant="filled" fullWidth className={classes.inputGroup}>
                  <InputLabel>Total Bonus Amount</InputLabel>
                  <FilledInput
                    type="number"
                    name="amount"
                    onChange={handleChange}
                    disableUnderline
                    style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl variant="filled" fullWidth className={classes.inputGroup}>
                  <InputLabel>Number of Envelopes</InputLabel>
                  <FilledInput
                    type="number"
                    name="qty"
                    onChange={handleChange}
                    disableUnderline
                    style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <div className={classes.otpContainer}>
                  <FormControl variant="filled" fullWidth>
                    <InputLabel>OTP</InputLabel>
                    <FilledInput
                      type="number"
                      name="code"
                      onChange={handleChange}
                      disableUnderline
                      style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
                    />
                  </FormControl>
                  <Button
                    className={classes.otpBtn}
                    onClick={counter === 0 || !canRun ? sendOTP : null}
                    disabled={canRun && counter > 0}
                  >
                    {canRun && counter > 0 ? counter : 'OTP'}
                  </Button>
                </div>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" className={classes.actionBtn}>
                  Create Envelope
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  className={classes.historyBtn}
                  onClick={() => history.push("/redEnvelopeHistory")}
                >
                  Historical Records
                </Button>
              </Grid>
            </Grid>
          </form>
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
          <Container align="center" style={{ backgroundColor: 'black', opacity: '0.6', height: '100px', paddingTop: "10px", borderRadius: 10 }}>
            <CircularProgress style={{ color: 'white' }} />
            <Typography style={{ paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
          </Container>
        </Dialog>

        <Dialog
          open={openDialog.open}
          onClose={dialogClose}
          PaperProps={{
            style: {
              borderRadius: '12px',
              padding: '20px'
            },
          }}
        >
          <Container>
            <Typography style={{ padding: '10px', color: "black" }}>{openDialog.body}</Typography>
          </Container>
        </Dialog>
      </div>
    </div>
  );
};

export default MyRedEnvelop;
