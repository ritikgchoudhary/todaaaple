import React, { useState, useEffect } from "react";
import { useHistory, Link, useParams } from "react-router-dom";
import {
  Button,
  Typography,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import * as api from "../../api/auth";
import PersonIcon from "@material-ui/icons/Person";
import LockIcon from "@material-ui/icons/Lock";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import SmsIcon from "@material-ui/icons/Sms";
import CardGiftcardIcon from "@material-ui/icons/CardGiftcard";
import CloseIcon from "@material-ui/icons/Close";
import axios from "axios";

const AuthForm = () => {
  const URL = api.url;
  const params = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const initialState = {
    phone: "",
    password: "",
    code: "",
    cpassword: "",
    referCode: params.id || "",
  };
  const [formData, setFormData] = useState(initialState);
  const [isLogin, setLogin] = useState(true);
  const [loader, setLoader] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [canRun, setRun] = useState(false);
  const [counter, setCounter] = useState(90);
  const [openDialog, setDialog] = useState({ open: false, body: "" });

  const SITE_KEY = "6Le-ej8mAAAAAL_Fl83Pp_iZ5ZLKpyQ8KWuTTF83";

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(() => history.push("/"))
        .catch(() => history.push("/login"));
    }
  }, [URL, history]);

  useEffect(() => {
    const loadScriptByURL = (id, url, callback) => {
      if (document.getElementById(id)) {
        if (callback) callback();
        return;
      }
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url;
      script.id = id;
      script.onload = () => callback && callback();
      document.body.appendChild(script);
    };
    loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`, () => {});
  }, [SITE_KEY]);

  useEffect(() => {
    let timer;
    if (canRun && counter > 0) timer = setTimeout(() => setCounter((c) => c - 1), 1000);
    else if (counter === 0) setRun(false);
    return () => clearTimeout(timer);
  }, [canRun, counter]);

  const dialogClose = () => setDialog((d) => ({ ...d, open: false }));

  const sendOTP = (e) => {
    e.preventDefault();
    const phoneStr = String(formData.phone).trim();
    if (phoneStr.length !== 10) {
      setDialog((d) => ({ ...d, open: true, body: "Please Enter Valid Number !" }));
      return;
    }
    setCounter(90);
    setRun(true);
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(SITE_KEY, { action: "submit" }).then((token) => {
          axios.post(`${URL}/sendOTP`, { token, phone: phoneStr }).catch(console.error);
        });
      });
    }
  };

  const switchLogin = () => setLogin(true);
  const switchSignup = () => setLogin(false);

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    try {
      if (isLogin) {
        const { data } = await api.signin(formData);
        if (data && data.token) localStorage.setItem("user", JSON.stringify({ result: data.result, token: data.token }));
        dispatch({ type: "Auth", data });
        history.push("/");
      } else {
        const { data } = await api.signup(formData);
        if (data && data.token) localStorage.setItem("user", JSON.stringify({ result: data.result, token: data.token }));
        dispatch({ type: "Auth", data });
        history.push("/");
      }
    } catch (err) {
      setDialog((d) => ({ ...d, open: true, body: err.response?.data?.error || "Something went wrong." }));
    }
    setLoader(false);
  };

  const handleClickShowPassword = () => setShowPassword((p) => !p);

  const inputProps = {
    style: { fontSize: "1rem" },
  };
  const inputLabelProps = {
    shrink: true,
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            type="button"
            onClick={switchLogin}
            style={{
              ...styles.tab,
              ...(isLogin ? styles.tabActive : {}),
            }}
          >
            Sign In
          </button>
          <span style={styles.tabDivider}>|</span>
          <button
            type="button"
            onClick={switchSignup}
            style={{
              ...styles.tab,
              ...(!isLogin ? styles.tabActive : {}),
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate autoComplete="off">
          {/* Mobile / Account */}
          <TextField
            fullWidth
            name="phone"
            label="Mobile number / Account"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            inputProps={{ maxLength: 10 }}
            InputProps={{
              ...inputProps,
              startAdornment: (
                <InputAdornment position="start" style={{ marginRight: 4 }}>
                  {isLogin ? <PersonIcon style={{ color: "#666" }} /> : <span style={styles.prefix}>+91</span>}
                </InputAdornment>
              ),
            }}
            InputLabelProps={inputLabelProps}
            variant="outlined"
            size="medium"
            style={styles.input}
          />

          {/* Password */}
          <TextField
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              ...inputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon style={{ color: "#666" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClickShowPassword} aria-label="toggle password">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={inputLabelProps}
            variant="outlined"
            size="medium"
            style={styles.input}
          />

          {/* Register-only: Confirm Password */}
          {!isLogin && (
            <TextField
              fullWidth
              name="cpassword"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={formData.cpassword}
              onChange={handleChange}
              InputProps={{
                ...inputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon style={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={inputLabelProps}
              variant="outlined"
              size="medium"
              style={styles.input}
            />
          )}

          {/* Register-only: OTP */}
          {!isLogin && (
            <div style={styles.otpRow}>
              <TextField
                fullWidth
                name="code"
                label="Verification Code"
                type="tel"
                value={formData.code}
                onChange={handleChange}
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  ...inputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SmsIcon style={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={inputLabelProps}
                variant="outlined"
                size="medium"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                type="button"
                variant="contained"
                disabled={canRun && counter > 0}
                onClick={(canRun && counter === 0) || (!canRun && counter === 90) ? sendOTP : undefined}
                style={styles.otpBtn}
              >
                {canRun ? (counter === 0 ? "Resend" : counter) : "OTP"}
              </Button>
            </div>
          )}

          {/* Register-only: Referral */}
          {!isLogin && (
            <TextField
              fullWidth
              name="referCode"
              label="Recommendation Code"
              value={formData.referCode}
              onChange={handleChange}
              InputProps={{
                ...inputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <CardGiftcardIcon style={{ color: "#666" }} />
                  </InputAdornment>
                ),
              }}
              InputLabelProps={inputLabelProps}
              variant="outlined"
              size="medium"
              style={styles.input}
            />
          )}

          {isLogin && (
            <div style={styles.forgetRow}>
              <Link to="/resetPassword" style={styles.forgetLink}>
                Forgot Password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loader}
            style={styles.primaryBtn}
          >
            {loader ? <CircularProgress size={24} style={{ color: "#fff" }} /> : (isLogin ? "Login" : "Register")}
          </Button>

          <Button
            type="button"
            fullWidth
            variant="outlined"
            onClick={() => history.push("/")}
            style={styles.secondaryBtn}
          >
            Back to Home
          </Button>
        </form>
      </div>

      {/* Loader overlay */}
      <Dialog open={loader} PaperProps={{ style: { backgroundColor: "transparent", boxShadow: "none" } }}>
        <div style={styles.loaderOverlay}>
          <CircularProgress style={{ color: "#fff" }} />
          <Typography style={{ marginTop: 12, color: "#fff" }}>Please wait...</Typography>
        </div>
      </Dialog>

      {/* Error dialog */}
      <Dialog open={openDialog.open} onClose={dialogClose} PaperProps={{ style: styles.dialogPaper }}>
        <DialogContent style={styles.dialogContent}>
          <div style={styles.dialogHeader}>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>Notice</Typography>
            <IconButton size="small" onClick={dialogClose} style={{ padding: 4 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          <Typography variant="body2" style={{ color: "#555" }}>{openDialog.body}</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
    padding: "32px 28px 40px",
  },
  tabs: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    gap: 8,
  },
  tab: {
    border: "none",
    background: "none",
    fontFamily: "inherit",
    fontSize: 17,
    fontWeight: 500,
    color: "#64748b",
    cursor: "pointer",
    padding: "8px 4px",
    transition: "color 0.2s",
  },
  tabActive: {
    color: "#0f172a",
    fontWeight: 700,
  },
  tabDivider: {
    color: "#cbd5e1",
    fontSize: 18,
    userSelect: "none",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  input: {
    marginBottom: 0,
  },
  prefix: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginRight: 4,
  },
  otpRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
  },
  otpBtn: {
    minWidth: 72,
    height: 56,
    background: "#0ea5e9",
    color: "#fff",
    fontWeight: 600,
    textTransform: "none",
  },
  forgetRow: {
    textAlign: "right",
    marginTop: -4,
  },
  forgetLink: {
    fontSize: 14,
    color: "#0ea5e9",
    textDecoration: "none",
  },
  primaryBtn: {
    marginTop: 8,
    padding: "14px 24px",
    background: "linear-gradient(90deg, #0d9488 0%, #0f766e 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    textTransform: "none",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(13, 148, 136, 0.4)",
  },
  secondaryBtn: {
    padding: "12px 24px",
    borderColor: "#94a3b8",
    color: "#64748b",
    fontWeight: 500,
    textTransform: "none",
    borderRadius: 12,
  },
  loaderOverlay: {
    background: "rgba(15, 23, 42, 0.9)",
    padding: "32px 40px",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  dialogPaper: {
    borderRadius: 16,
    maxWidth: 360,
  },
  dialogContent: {
    padding: "20px 24px",
  },
  dialogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
};

export default AuthForm;
