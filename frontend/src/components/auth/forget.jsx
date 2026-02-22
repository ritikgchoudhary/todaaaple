import React, { useState, useEffect } from "react";
import {
  Typography,
  CircularProgress,
  Button,
  Dialog,
  IconButton,
  Box,
  TextField,
  InputAdornment
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { useHistory } from "react-router-dom";
import SmsIcon from "@material-ui/icons/Sms";
import LockIcon from "@material-ui/icons/Lock";
import PhoneIcon from "@material-ui/icons/Phone";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import * as api from "../../api/auth";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Outfit', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  decoration: {
    position: 'absolute',
    top: '-15%',
    right: '-10%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(16, 185, 177, 0.1) 0%, rgba(16, 185, 177, 0.05) 100%)',
    zIndex: 0,
  },
  decoration2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-15%',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(16, 185, 177, 0.05) 0%, rgba(16, 185, 177, 0.1) 100%)',
    zIndex: 0,
  },
  header: {
    width: '100%',
    maxWidth: '500px',
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: "#fff",
    boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
    "&:hover": { backgroundColor: "#F1F5F9" },
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: "40px",
    borderTopRightRadius: "40px",
    padding: "40px 30px",
    boxShadow: "0 -10px 40px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    zIndex: 5,
    [theme.breakpoints.up('sm')]: {
      borderRadius: '40px',
      margin: '20px 0',
      flex: 'none',
    }
  },
  titleSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "40px",
    zIndex: 10
  },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#0F172A",
    marginTop: "15px",
    textAlign: "center",
  },
  subtitle: {
    color: "#64748B",
    fontSize: "0.95rem",
    marginTop: "8px",
    textAlign: "center",
    maxWidth: '280px'
  },
  inputField: {
    marginBottom: "20px",
    "& .MuiOutlinedInput-root": {
      borderRadius: "18px",
      backgroundColor: "#F8FAFC",
      border: "1px solid #F1F5F9",
      transition: "all 0.3s ease",
      "&.Mui-focused": {
        borderColor: "#10B9B1",
        backgroundColor: "#fff",
        boxShadow: "0 0 0 4px rgba(16, 185, 177, 0.08)",
      },
      "& fieldset": { border: "none" },
    },
    "& .MuiInputBase-input": {
      padding: "18px 14px",
      fontWeight: 500,
    }
  },
  iconHighlight: {
    backgroundColor: "rgba(16, 185, 177, 0.1)",
    borderRadius: "12px",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "10px",
  },
  actionBtn: {
    marginTop: "30px",
    width: "100%",
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    color: "#fff",
    padding: "18px",
    borderRadius: "20px",
    fontWeight: 800,
    fontSize: "1.1rem",
    textTransform: "none",
    boxShadow: "0 15px 30px rgba(15, 23, 42, 0.2)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "#10B9B1",
      transform: "translateY(-2px)",
      boxShadow: "0 20px 40px rgba(16, 185, 177, 0.3)",
    },
    "&:disabled": {
      background: "#CBD5E1",
      boxShadow: "none",
    }
  },
  otpButton: {
    color: "#10B9B1",
    fontWeight: 700,
    textTransform: "none",
    backgroundColor: "rgba(16, 185, 177, 0.08)",
    borderRadius: "12px",
    padding: "8px 15px",
    fontSize: "0.85rem",
    "&:disabled": { color: "#94A3B8" },
  },
}));

const Forget = () => {
  const URL = api.url;
  const history = useHistory();
  const classes = useStyles();
  const [loader, setLoader] = useState(false);
  const [validated, setValidated] = useState(false);
  const [openDialog, setDialog] = useState({ open: false, body: "" });
  const [counter, setCounter] = useState(90);
  const [canRun, setRun] = useState(false);
  const [formData, setFormData] = useState({ phone: "", password: "", code: "", confirm: "" });

  useEffect(() => {
    let timer;
    if (canRun && counter > 0) {
      timer = setTimeout(() => setCounter(counter - 1), 1000);
    } else if (counter === 0) {
      setRun(false);
    }
    return () => clearTimeout(timer);
  }, [canRun, counter]);

  const sendOTP = async () => {
    if (formData.phone.length !== 10) {
      setDialog({ open: true, body: "Please enter a valid 10-digit number!" });
      return;
    }
    try {
      setCounter(90);
      setRun(true);
      await axios.post(`${URL}/sendOTPFor`, { phone: formData.phone });
    } catch (err) {
      setDialog({ open: true, body: "Error sending OTP. Try again." });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.phone) {
      setDialog({ open: true, body: "Please fill all fields!" });
      return;
    }
    setLoader(true);
    // Mimic verification or call API if exists
    setTimeout(() => {
      setValidated(true);
      setLoader(false);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      setDialog({ open: true, body: "Passwords do not match!" });
      return;
    }
    setLoader(true);
    try {
      await api.reset(formData);
      setLoader(false);
      setDialog({ open: true, body: "Password Changed Successfully!" });
      setTimeout(() => history.push("/login"), 2000);
    } catch (error) {
      setLoader(false);
      setDialog({ open: true, body: error.response?.data?.error || "Update failed!" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={classes.root}>
      <div className={classes.decoration} />
      <div className={classes.decoration2} />

      <div className={classes.header}>
        <IconButton onClick={() => history.push("/login")} className={classes.backBtn}>
          <ArrowBackIcon style={{ color: "#0F172A", fontSize: "20px" }} />
        </IconButton>
        <IconButton className={classes.backBtn}>
          <HelpOutlineIcon style={{ color: "#64748B", fontSize: "20px" }} />
        </IconButton>
      </div>

      <div className={classes.titleSection}>
        <Typography className={classes.title}>Reset Password</Typography>
      </div>

      <div className={classes.card}>
        {!validated ? (
          <form onSubmit={handleVerify}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Mobile Number"
              name="phone"
              type="number"
              className={classes.inputField}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <div className={classes.iconHighlight}>
                      <PhoneIcon style={{ color: "#10B9B1", fontSize: "18px" }} />
                    </div>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Verification Code"
              name="code"
              type="number"
              className={classes.inputField}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <div className={classes.iconHighlight}>
                      <SmsIcon style={{ color: "#10B9B1", fontSize: "18px" }} />
                    </div>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      className={classes.otpButton}
                      disabled={canRun}
                      onClick={sendOTP}
                    >
                      {canRun ? `${counter}s` : "Get OTP"}
                    </Button>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              className={classes.actionBtn}
              disabled={loader}
            >
              {loader ? <CircularProgress size={24} style={{ color: "#fff" }} /> : "Verify Identity"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="New Password"
              name="password"
              type="password"
              className={classes.inputField}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <div className={classes.iconHighlight}>
                      <LockIcon style={{ color: "#10B9B1", fontSize: "18px" }} />
                    </div>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Confirm Password"
              name="confirm"
              type="password"
              className={classes.inputField}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <div className={classes.iconHighlight}>
                      <LockIcon style={{ color: "#10B9B1", fontSize: "18px" }} />
                    </div>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              className={classes.actionBtn}
              disabled={loader}
            >
              {loader ? <CircularProgress size={24} style={{ color: "#fff" }} /> : "Change Password"}
            </Button>
          </form>
        )}
      </div>

      <Dialog
        open={openDialog.open}
        onClose={() => setDialog({ ...openDialog, open: false })}
        PaperProps={{ style: { borderRadius: '25px', padding: '10px' } }}
      >
        <Box p={3} textAlign="center">
          <Typography variant="h6" style={{ fontWeight: 800, color: "#10B9B1", marginBottom: "12px" }}>Notification</Typography>
          <Typography style={{ color: "#475569", lineHeight: 1.6 }}>{openDialog.body}</Typography>
          <Button
            fullWidth
            onClick={() => setDialog({ ...openDialog, open: false })}
            style={{
              marginTop: "25px",
              backgroundColor: "#0F172A",
              color: "#fff",
              borderRadius: "15px",
              padding: "12px",
              fontWeight: 800,
              textTransform: "none"
            }}
          >
            Got it
          </Button>
        </Box>
      </Dialog>
    </div>
  );
};

export default Forget;
