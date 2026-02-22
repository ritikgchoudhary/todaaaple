import React, { useState, useEffect } from "react";
import { useHistory, Link, useParams } from "react-router-dom";
import {
  Button,
  Typography,
  TextField,
  CircularProgress,
  Dialog,
  Box,
  Container,
  InputAdornment,
  IconButton
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import PhoneIcon from "@material-ui/icons/Phone";
import LockIcon from "@material-ui/icons/Lock";
import SmsIcon from "@material-ui/icons/Sms";
import GroupIcon from "@material-ui/icons/Group";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { useDispatch } from "react-redux";
import axios from 'axios';
import * as api from "../../api/auth";
import logo from "../../assets/images/logo.png";

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
  logoSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "40px",
  },
  welcomeText: {
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
  toggleWrapper: {
    display: "flex",
    backgroundColor: "#F1F5F9",
    borderRadius: "20px",
    padding: "5px",
    marginBottom: "35px",
    position: 'relative',
  },
  toggleBtn: {
    flex: 1,
    padding: "12px",
    textAlign: "center",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#64748B",
    cursor: "pointer",
    borderRadius: "15px",
    zIndex: 2,
    transition: "all 0.3s ease",
  },
  activeToggle: {
    color: "#10B9B1",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
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
  submitAction: {
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
  authFooter: {
    display: "flex",
    justifyContent: "center",
    marginTop: "30px",
    gap: "5px",
  },
  linkText: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#64748B",
  },
  linkAction: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#10B9B1",
    textDecoration: "none",
    "&:hover": { textDecoration: 'underline' }
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
  forgotText: {
    textAlign: 'right',
    marginTop: '-10px',
    marginBottom: '20px',
  },
  forgotLink: {
    color: '#64748B',
    fontSize: '0.85rem',
    fontWeight: 600,
    textDecoration: 'none',
    "&:hover": { color: '#10B9B1' }
  }
}));

const AuthForm = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const params = useParams();
  const URL = api.url;

  const [isLogin, setLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loader, setLoader] = useState(false);
  const [formData, setFormData] = useState({ phone: "", password: "", code: "", cpassword: "", referCode: params.id || "" });
  const [counter, setCounter] = useState(90);
  const [canRun, setRun] = useState(false);
  const [openDialog, setDialog] = useState({ open: false, body: "" });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) history.push("/");
  }, [history]);

  useEffect(() => {
    let timer;
    if (canRun && counter > 0) {
      timer = setTimeout(() => setCounter(counter - 1), 1000);
    } else if (counter === 0) {
      setRun(false);
    }
    return () => clearTimeout(timer);
  }, [canRun, counter]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const sendOTP = async () => {
    if (formData.phone.length !== 10) {
      setDialog({ open: true, body: "Please enter a valid 10-digit mobile number." });
      return;
    }
    setCounter(90);
    setRun(true);
    const SITE_KEY = "6Le-ej8mAAAAAL_Fl83Pp_iZ5ZLKpyQ8KWuTTF83";
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(async token => {
          try {
            await axios.post(`${URL}/sendOTP`, { token, phone: formData.phone });
          } catch (err) {
            console.error(err);
          }
        });
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      const { data } = isLogin ? await api.signin(formData) : await api.signup(formData);
      dispatch({ type: "Auth", data });
      history.push("/");
    } catch (error) {
      setDialog({ open: true, body: error.response?.data?.error || "Invalid credentials. Please try again." });
    }
    setLoader(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.decoration} />
      <div className={classes.decoration2} />

      <div className={classes.header}>
        <IconButton onClick={() => history.push("/")} className={classes.backBtn}>
          <ArrowBackIcon style={{ color: "#0F172A", fontSize: "20px" }} />
        </IconButton>
        <IconButton className={classes.backBtn}>
          <HelpOutlineIcon style={{ color: "#64748B", fontSize: "20px" }} />
        </IconButton>
      </div>

      <div style={{ marginTop: '20px', zIndex: 10 }}>
        <div className={classes.logoSection}>
          <img src={logo} alt="Toddapple Logo" style={{ height: '70px', objectFit: 'contain' }} />
        </div>
      </div>

      <div className={classes.card}>
        <div className={classes.toggleWrapper}>
          <div
            className={`${classes.toggleBtn} ${isLogin ? classes.activeToggle : ""}`}
            onClick={() => setLogin(true)}
          >
            Log In
          </div>
          <div
            className={`${classes.toggleBtn} ${!isLogin ? classes.activeToggle : ""}`}
            onClick={() => setLogin(false)}
          >
            Sign Up
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Mobile Number"
            name="phone"
            type="number"
            className={classes.inputField}
            autoComplete="tel"
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
            placeholder="Account Password"
            name="password"
            type={showPassword ? "text" : "password"}
            className={classes.inputField}
            autoComplete="current-password"
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div className={classes.iconHighlight}>
                    <LockIcon style={{ color: "#10B9B1", fontSize: "18px" }} />
                  </div>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff style={{ color: "#94A3B8" }} /> : <Visibility style={{ color: "#94A3B8" }} />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {isLogin && (
            <div className={classes.forgotText}>
              <Link to="/resetPassword" className={classes.forgotLink}>Forgot Password?</Link>
            </div>
          )}

          {!isLogin && (
            <>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Confirm Password"
                name="cpassword"
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

              <TextField
                fullWidth
                variant="outlined"
                placeholder="Referral Code (Optional)"
                name="referCode"
                className={classes.inputField}
                value={formData.referCode}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div className={classes.iconHighlight}>
                        <GroupIcon style={{ color: "#10B9B1", fontSize: "18px" }} />
                      </div>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          <Button
            type="submit"
            className={classes.submitAction}
            disabled={loader}
          >
            {loader ? (
              <CircularProgress size={24} style={{ color: "#fff" }} />
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </Button>

          {/* BYPASS BUTTON */}
          <Button
            fullWidth
            onClick={() => {
              setFormData({ phone: '9988776655', password: 'bypass' });
              setTimeout(() => {
                const fakeEvent = { preventDefault: () => { } };
                handleSubmit(fakeEvent);
              }, 100);
            }}
            style={{ marginTop: '10px', color: '#10B9B1', fontWeight: 'bold', textTransform: 'none' }}
          >
            Direct Login (Bypass)
          </Button>
        </form>

        <div className={classes.authFooter}>
          <Typography className={classes.linkText}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Typography>
          <span
            className={classes.linkAction}
            style={{ cursor: 'pointer' }}
            onClick={() => setLogin(!isLogin)}
          >
            {isLogin ? " Register" : " Login"}
          </span>
        </div>
      </div>

      {/* Modern Notice Dialog */}
      <Dialog
        open={openDialog.open}
        onClose={() => setDialog({ ...openDialog, open: false })}
        PaperProps={{ style: { borderRadius: '25px', padding: '10px' } }}
      >
        <Box p={3} textAlign="center">
          <Typography variant="h6" style={{ fontWeight: 800, color: "#10B9B1", marginBottom: "12px" }}>Notification</Typography>
          <Typography style={{ color: "#475569", lineHeight: 1.6, fontSize: '1rem' }}>{openDialog.body}</Typography>
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
            Continue
          </Button>
        </Box>
      </Dialog>
    </div>
  );
};

export default AuthForm;
