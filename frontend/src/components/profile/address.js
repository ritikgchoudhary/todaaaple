import React, { useState, useEffect } from 'react';
import { Typography, Grid, Container, FilledInput, InputLabel, FormControl, Backdrop, CircularProgress, Dialog, Button, Paper } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as api from "../../api/auth";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import {
  Person,
  Business,
  Room,
  Phone
} from "@material-ui/icons";

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
    marginRight: '20px'
  },
  content: {
    padding: '20px',
  },
  currentAddress: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '1px solid #eee'
  },
  addressLabel: {
    fontWeight: 'bold',
    color: '#05c0b8',
    marginBottom: '10px',
    fontSize: '14px'
  },
  addressText: {
    fontSize: '13px',
    color: '#333',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center'
  },
  formSection: {
    marginTop: '20px'
  },
  inputGroup: {
    marginBottom: '15px'
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
    marginTop: '20px',
    "&:hover": {
      backgroundColor: '#04a09a'
    }
  },
  icon: {
    fontSize: '16px',
    marginRight: '8px',
    color: '#999'
  }
}));

const MyAddress = () => {
  const classes = useStyles();
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState();
  const dispatch = useDispatch();
  const history = useHistory();
  const URL = api.url;

  const initialState = { name: '', ifsc: '', account: '', confirm: '', state: '', city: '', address: '', email: '' };
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setLoading] = useState(false);
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
      history.push("/login");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id });
  };

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.address(formData);
      dispatch({ type: "address", data: data });
      history.push("/profile");
    } catch (error) {
      setDialog({ ...openDialog, open: true, body: error.response?.data?.error || "Error updating address" })
    }
    setLoading(false);
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../profile')} />
          <Typography className={classes.headerTitle}>My Address</Typography>
        </div>

        <Container className={classes.content}>
          {user && user[0].address && user[0].address[0] ? (
            <Paper elevation={0} className={classes.currentAddress}>
              <Typography className={classes.addressLabel}>CURRENT ADDRESS</Typography>
              <Typography className={classes.addressText}><Person className={classes.icon} /> {user[0].address[0].name}</Typography>
              <Typography className={classes.addressText}><Phone className={classes.icon} /> {user[0].address[0].phone}</Typography>
              <Typography className={classes.addressText}><Room className={classes.icon} /> {user[0].address[0].address}</Typography>
              <Typography className={classes.addressText}><Business className={classes.icon} /> {user[0].address[0].city}, {user[0].address[0].state}</Typography>
            </Paper>
          ) : null}

          <Typography style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
            {user && user[0].address && user[0].address[0] ? "Update Address" : "Add Address"}
          </Typography>

          <form className={classes.formSection}>
            <FormControl fullWidth variant="filled" className={classes.inputGroup}>
              <InputLabel>Full Name</InputLabel>
              <FilledInput
                name="name"
                onChange={handleChange}
                disableUnderline
                style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
              />
            </FormControl>

            <FormControl fullWidth variant="filled" className={classes.inputGroup}>
              <InputLabel>Mobile Number</InputLabel>
              <FilledInput
                name="phone"
                type='number'
                onChange={handleChange}
                disableUnderline
                style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
              />
            </FormControl>

            <FormControl fullWidth variant="filled" className={classes.inputGroup}>
              <InputLabel>State</InputLabel>
              <FilledInput
                name="state"
                onChange={handleChange}
                disableUnderline
                style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
              />
            </FormControl>

            <FormControl fullWidth variant="filled" className={classes.inputGroup}>
              <InputLabel>City</InputLabel>
              <FilledInput
                name="city"
                onChange={handleChange}
                disableUnderline
                style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
              />
            </FormControl>

            <FormControl fullWidth variant="filled" className={classes.inputGroup}>
              <InputLabel>Address (Street, House No.)</InputLabel>
              <FilledInput
                name="address"
                onChange={handleChange}
                disableUnderline
                style={{ backgroundColor: '#f5f5f5', borderRadius: '5px' }}
              />
            </FormControl>

            <Button onClick={handleSubmit} className={classes.submitBtn}>
              Save Address
            </Button>
          </form>
        </Container>

        <Dialog
          open={isLoading}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container align="center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '10px' }}>
            <CircularProgress style={{ color: 'white' }} />
            <Typography style={{ color: 'white', marginTop: '10px' }}>Processing...</Typography>
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
            <Typography align="center">{openDialog.body}</Typography>
            <Button onClick={dialogClose} fullWidth style={{ color: '#05c0b8', marginTop: '10px' }}>OK</Button>
          </Container>
        </Dialog>
      </div>
    </div>
  )
}

export default MyAddress;
