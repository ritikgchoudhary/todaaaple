import React, { useState, useEffect } from 'react';
import { Typography, Grid, FormControl, InputLabel, CircularProgress, FilledInput, Button, Container, Dialog } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
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
  formControl: {
    marginBottom: '20px'
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: '5px'
  },
  submitBtn: {
    backgroundColor: '#05c0b8',
    color: 'white',
    width: '100%',
    padding: '12px',
    borderRadius: '25px',
    fontWeight: 'bold',
    textTransform: 'none',
    fontSize: '16px',
    marginTop: '20px',
    "&:hover": {
      backgroundColor: '#04a09a'
    }
  }
}));

const ModifyPayment = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const [user, setUser] = useState();
  const [loader, setLoader] = React.useState(false);
  const [name, setName] = useState({ payCurrent: '', payNew: '' });
  const [openDialog, setDialog] = React.useState({ open: false, body: '' });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setName((prev) => ({ ...prev, userId: foundUser.result.id }));

      // Using axios instead of XMLHttpRequest for consistency
      axios.get(`https://secured.servider.net/getUser/${foundUser.result.id}`)
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.log("Error fetching user", error);
        });

    } else {
      history.push('/login');
    }
  }, []);

  const handleChange = (e) => {
    setName({ ...name, type: 'payment', [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    setLoader(true);
    try {
      const { data } = await api.accountSecurity(name);
      dispatch({ type: "accSeq", data: data });
      history.push("/accountSecurity");
    } catch (error) {
      setLoader(false);
      setDialog({ ...openDialog, open: true, body: error.response?.data?.error || "Error updating payment password" })
    }
    setLoader(false);
  }

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../accountSecurity')} />
          <Typography className={classes.headerTitle}>Modify Payment Password</Typography>
        </div>

        <Container className={classes.content}>
          <Typography style={{ marginBottom: '20px', color: '#666' }}>
            Set a new payment password for withdrawals.
          </Typography>

          <form noValidate autoComplete="off">
            <FormControl fullWidth variant="filled" className={classes.formControl}>
              <InputLabel>Current Payment Password</InputLabel>
              <FilledInput
                name="payCurrent"
                type="password"
                onChange={handleChange}
                disableUnderline
                className={classes.input}
              />
            </FormControl>

            <FormControl fullWidth variant="filled" className={classes.formControl}>
              <InputLabel>New Payment Password</InputLabel>
              <FilledInput
                name="payNew"
                type="password"
                onChange={handleChange}
                disableUnderline
                className={classes.input}
              />
            </FormControl>

            <Button
              variant="contained"
              onClick={handleSubmit}
              className={classes.submitBtn}
            >
              Update Payment Password
            </Button>
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
          <Container align="center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', height: '100px', paddingTop: "10px", borderRadius: '10px', width: '100px' }}>
            <CircularProgress style={{ color: 'white' }} />
            <Typography style={{ paddingTop: '10px', color: "white", fontSize: '12px' }}>Please Wait!</Typography>
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

export default ModifyPayment;
