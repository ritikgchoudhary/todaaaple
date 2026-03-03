import React, { useState, useEffect } from "react";
import { useHistory, Link, useParams } from "react-router-dom";
import {
  Button,
  Typography,
  Grid,
  Container,
  CircularProgress,
  Dialog,
} from "@material-ui/core";
import LockIcon from "@material-ui/icons/Lock";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import FilledInput from "@material-ui/core/FilledInput";
import IconButton from "@material-ui/core/IconButton";
import { useDispatch } from "react-redux";
import * as api from "../../api/auth";
import PersonIcon from "@material-ui/icons/Person";
import SmsIcon from "@material-ui/icons/Sms";
import AssistantIcon from "@material-ui/icons/Assistant";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";

const useStyles = makeStyles({
  underline: {
    "&&&:before": { borderBottom: "none" },
    "&&:after": { borderBottom: "none" },
  },
});

const AuthForm = () => {
  const URL = api.url;
  const params = useParams();
  const classes = useStyles();
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
  const [isLogin, setLogin] = useState(false);
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

  return (
    <>
      <Container maxWidth="sm" className={classes.container}>
        <>
          <Grid container spacing={1} alignItems="flex-end" style={{ padding: "50px" }}>
            <Grid item xs={5}>
              <Button variant="text" className={classes.heading} onClick={switchLogin} style={{ fontWeight: "bold", textTransform: "none", fontSize: isLogin ? "19px" : "16px" }}>
                Sign In
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="h5" gutterBottom>|</Typography>
            </Grid>
            <Grid item xs={5}>
              <Button variant="text" className={classes.heading} onClick={switchSignup} style={{ fontWeight: "bold", textTransform: "none", fontSize: isLogin ? "16px" : "19px" }}>
                Register
              </Button>
            </Grid>
          </Grid>

          <Dialog open={loader} PaperProps={{ style: { backgroundColor: "transparent", boxShadow: "none" } }}>
            <Container align="center" style={{ backgroundColor: "black", opacity: "0.6", height: "100px", paddingTop: "10px" }}>
              <CircularProgress style={{ color: "white" }} />
              <Typography style={{ paddingTop: "10px", color: "white" }}>Please Wait!</Typography>
            </Container>
          </Dialog>

          <form noValidate method="post" autoComplete="off" onSubmit={handleSubmit} className={classes.form} id="register-form">
            <Container style={{ border: "1px solid", borderColor: "#dbdbdb", padding: "30px" }}>
              <div>
                <Grid container direction="row" alignItems="center">
                  <Grid item xs={2}>{isLogin ? <PersonIcon /> : <Typography>+91</Typography>}</Grid>
                  <Grid item xs={10}>
                    <FormControl fullWidth variant="filled" InputProps={{ classes }}>
                      <InputLabel InputProps={{ classes }}>Mobile number/Account</InputLabel>
                      <FilledInput
                        InputProps={{ classes }}
                        fullWidth
                        name="phone"
                        type="tel"
                        inputProps={{ maxLength: 10 }}
                        id="filled"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ backgroundColor: "white", textUnderlineOffset: "none" }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </div>
              <div>
                <Grid container direction="row" alignItems="center" style={{ paddingTop: "20px" }}>
                  <Grid item xs={2}><LockIcon /></Grid>
                  <Grid item xs={10}>
                    <FormControl fullWidth variant="filled">
                      <InputLabel htmlFor="filled-adornment-password">Password</InputLabel>
                      <FilledInput
                        name="password"
                        id="filled-adornment-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        style={{ backgroundColor: "white", textUnderlineOffset: "none" }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Dialog open={openDialog.open} onClose={dialogClose} PaperProps={{ style: { backgroundColor: "transparent", boxShadow: "none" } }}>
                  <Container style={{ backgroundColor: "black", opacity: "0.6", height: "50px" }}>
                    <Typography style={{ paddingTop: "10px", color: "white" }}>{openDialog.body}</Typography>
                  </Container>
                </Dialog>
              </div>

              {!isLogin && (
                <div>
                  <Grid container direction="row" alignItems="center" style={{ paddingTop: "20px" }}>
                    <Grid item xs={2}><LockIcon /></Grid>
                    <Grid item xs={10}>
                      <FormControl fullWidth variant="filled">
                        <InputLabel htmlFor="filled-adornment-cpassword">Confirm Password</InputLabel>
                        <FilledInput
                          name="cpassword"
                          id="filled-adornment-cpassword"
                          type={showPassword ? "text" : "password"}
                          value={formData.cpassword}
                          onChange={handleChange}
                          style={{ backgroundColor: "white", textUnderlineOffset: "none" }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                                {showPassword ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </div>
              )}

              {!isLogin && (
                <div>
                  <Grid container direction="row" alignItems="center" style={{ paddingTop: "20px" }}>
                    <Grid item xs={2}><SmsIcon /></Grid>
                    <Grid item xs={8}>
                      <FormControl fullWidth variant="filled">
                        <InputLabel htmlFor="filled-adornment-code">Verification Code</InputLabel>
                        <FilledInput type="tel" inputProps={{ maxLength: 6 }} name="code" id="filled-adornment-code" value={formData.code} onChange={handleChange} style={{ backgroundColor: "white", textUnderlineOffset: "none" }} />
                      </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                      <Container style={{ backgroundColor: "#00b8a9", height: "30px", width: "55px" }}>
                        <Button type="button" disabled={canRun && counter > 0} onClick={(canRun && counter === 0) || (!canRun && counter === 90) ? sendOTP : undefined} style={{ paddingTop: "1px", marginLeft: "-22px", color: "white", textTransform: "none" }}>
                          {canRun ? (counter === 0 ? "Resend" : counter) : "OTP"}
                        </Button>
                      </Container>
                    </Grid>
                  </Grid>
                </div>
              )}

              {!isLogin && (
                <div>
                  <Grid container direction="row" alignItems="center" style={{ paddingTop: "20px" }}>
                    <Grid item xs={2}><AssistantIcon /></Grid>
                    <Grid item xs={10}>
                      <FormControl fullWidth variant="filled" style={{ borderBottom: "none" }}>
                        <InputLabel htmlFor="filled-adornment-referCode" style={{ borderBottom: "none" }}>Recommendation Code</InputLabel>
                        <FilledInput value={formData.referCode} name="referCode" id="filled-adornment-referCode" onChange={handleChange} style={{ backgroundColor: "white", borderBottom: "none" }} />
                      </FormControl>
                    </Grid>
                  </Grid>
                </div>
              )}
            </Container>

            {isLogin && (
              <Link to="/resetPassword" style={{ textDecoration: "none", color: "black" }}>
                <Typography align="right" style={{ paddingTop: "10px", color: "grey", fontSize: "15px" }}>Forget Password</Typography>
              </Link>
            )}

            <Container style={{ backgroundColor: "#00b8a9", height: "50px", width: "220px", marginTop: "30px" }}>
              <Typography align="center">
                <Button type="submit" style={{ paddingTop: "12px", color: "white", textTransform: "none" }}>{isLogin ? "Login Immediately" : "Register"}</Button>
              </Typography>
            </Container>
            <Container style={{ backgroundColor: "grey", height: "50px", width: "220px", marginTop: "20px", marginBottom: "90px", cursor: "pointer" }} onClick={() => history.push("/")}>
              <Typography align="center" style={{ paddingTop: "12px", color: "white" }}>Back Home</Typography>
            </Container>
          </form>
        </>
      </Container>
    </>
  );
};

export default AuthForm;
