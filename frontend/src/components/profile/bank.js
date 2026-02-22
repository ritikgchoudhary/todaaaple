import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Container,
  FilledInput,
  InputLabel,
  FormControl,
  Button,
  CircularProgress,
  Dialog,
  Paper,
  Box
} from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import {
  Payment,
  Person,
  LocalPhone,
  AccountBalance,
  LocationCity,
  Business,
  Email,
  Sms as SmsIcon
} from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as api from "../../api/auth";
import axios from "axios";
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
  bankCard: {
    background: 'linear-gradient(135deg, #05c0b8 0%, #039dc4 100%)',
    color: 'white',
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '20px',
    boxShadow: '0 4px 10px rgba(5, 192, 184, 0.4)'
  },
  formSection: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '10px',
  },
  inputGroup: {
    marginBottom: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  icon: {
    color: '#05c0b8',
    marginRight: '10px'
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
  editBtn: {
    width: "100%",
    padding: '15px',
    border: '2px dashed #05c0b8',
    color: '#05c0b8',
    borderRadius: '10px',
    backgroundColor: 'rgba(5, 192, 184, 0.05)',
    fontWeight: 'bold',
    textTransform: 'none',
    fontSize: '16px',
    marginTop: '20px'
  }
}));

const MyBank = () => {
  const classes = useStyles();
  const URL = api.url;
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState();
  const history = useHistory();
  const [isEdit, setEdit] = useState(false);
  const dispatch = useDispatch();

  const [counter, setCounter] = useState(90);
  const initialState = {
    phone: "",
    name: "",
    ifsc: "",
    account: "",
    confirm: "",
    state: "",
    city: "",
    address: "",
    email: "",
    code: "",
    upi: "",
  };
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setLoading] = useState(false);
  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [canRun, setRun] = useState(false);
  const [otpDialog, setOtpDialog] = React.useState({ open: false, body: "" });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUser/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.log(error);
          history.push("/login");
        });
    } else {
      history.push("/login");
    }
  }, []);

  useEffect(() => {
    if (canRun && counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [canRun, counter]);

  const otpdialogClose = () => {
    setOtpDialog({ ...otpDialog, open: false, body: "" });
  };
  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };

  const handleEdit = () => {
    setEdit(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
      userId: isAuth.result.id,
      userPhone: isAuth.result.phone,
    });
  };

  const sendOTP = async (e) => {
    setCounter(90);
    setRun(true);
    const data = {
      phone: `${user[0].phone}`,
    };
    try {
      await axios.post(`${URL}/sendOTPBank`, data);
    } catch (e) {
      console.log("Error sending OTP");
    }
  };

  const submitOTP = async () => {
    setLoading(() => true);
    try {
      const { data } = await api.bank(formData);
      dispatch({ type: "bank", data: data });
      history.push("/profile");
    } catch (error) {
      setDialog({
        ...openDialog,
        open: true,
        body: error.response?.data?.error || "Error submitting form",
      });
    }
    setLoading(() => false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(() => true);
    const AuthStr = "Bearer ".concat(isAuth.token);
    setFormData({ ...formData, auth: AuthStr });

    // Basic validation
    const requiredFields = ['name', 'phone', 'ifsc', 'account', 'confirm', 'state', 'city', 'address', 'email', 'upi'];
    const hasEmpty = requiredFields.some(field => formData[field] === '');

    if (hasEmpty || formData.account !== formData.confirm) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Please enter all fields correctly and ensure account numbers match.",
      });
      setLoading(false);
    } else {
      if (!formData.upi.includes('@') || formData.upi.length < 5) {
        setDialog({ ...openDialog, open: true, body: 'Invalid UPI' });
        setLoading(false);
      } else {
        try {
          setOtpDialog({ otpDialog, open: true });
          // Trigger OTP send automatically or wait for user? Original logic implied manual click
        } catch (error) {
          setDialog({ ...openDialog, open: true, body: error.resposne?.data?.error });
        }
        setLoading(false);
      }
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../profile')} />
          <Typography className={classes.headerTitle}>My Bank Card</Typography>
        </div>

        <Container className={classes.content}>
          {user && user[0].bank && user[0].bank[0] ? (
            <div className={classes.bankCard}>
              <Typography style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                Linked Bank Account
              </Typography>
              <Typography style={{ fontSize: '14px', opacity: 0.9 }}>
                {user[0].bank[0].name}
              </Typography>
              <Typography style={{ fontSize: '20px', letterSpacing: '2px', margin: '10px 0' }}>
                {user[0].bank[0].account}
              </Typography>
              <Typography style={{ fontSize: '12px', opacity: 0.8 }}>
                IFSC: {user[0].bank[0].ifsc}
              </Typography>
            </div>
          ) : null}

          {!isEdit && (
            <Button
              className={classes.editBtn}
              onClick={handleEdit}
            >
              {user && user[0].bank && user[0].bank[0] ? "+ Edit Bank Details" : "+ Add Bank Account"}
            </Button>
          )}

          {isEdit && (
            <form className={classes.formSection}>
              <Typography style={{ marginBottom: '15px', color: '#666', fontWeight: 'bold' }}>
                Enter Bank Details
              </Typography>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <Person className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="Actual Name"
                  name="name"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <LocalPhone className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="Mobile Number"
                  name="phone"
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <AccountBalance className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="IFSC Code"
                  name="ifsc"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <AccountBalance className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="Account Number"
                  name="account"
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <AccountBalance className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="Confirm Account Number"
                  name="confirm"
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <LocationCity className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="State"
                  name="state"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <Business className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="City"
                  name="city"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <LocationCity className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="Address"
                  name="address"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <Email className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="Email"
                  name="email"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Box display="flex" alignItems="center" className={classes.inputGroup}>
                <Payment className={classes.icon} style={{ marginLeft: '10px' }} />
                <FilledInput
                  placeholder="UPI ID"
                  name="upi"
                  onChange={handleChange}
                  fullWidth
                  disableUnderline
                  style={{ backgroundColor: 'transparent' }}
                />
              </Box>

              <Button onClick={handleSubmit} className={classes.actionBtn}>
                Update Bank Details
              </Button>
            </form>
          )}
        </Container>

        <Dialog
          open={isLoading}
          PaperProps={{
            style: {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
          }}
        >
          <Container
            align="center"
            style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              height: "100px",
              width: "100px",
              paddingTop: "10px",
              borderRadius: "10px",
            }}
          >
            <CircularProgress style={{ color: "white" }} />
            <Typography style={{ paddingTop: "10px", color: "white", fontSize: '12px' }}>
              Processing...
            </Typography>
          </Container>
        </Dialog>

        <Dialog open={otpDialog.open} onClose={otpdialogClose}>
          <Container style={{ padding: '20px', minWidth: '300px' }}>
            <Typography align="center" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
              Security Verification
            </Typography>

            <Box display="flex" alignItems="center" style={{ marginBottom: '20px' }}>
              <SmsIcon style={{ color: '#666', marginRight: '10px' }} />
              <FilledInput
                placeholder="Enter OTP"
                name="code"
                type="number"
                onChange={handleChange}
                disableUnderline
                style={{ backgroundColor: '#f5f5f5', borderRadius: '5px', padding: '5px 10px' }}
              />
              <Button
                onClick={counter === 0 || !canRun ? sendOTP : null}
                disabled={canRun && counter > 0}
                style={{
                  backgroundColor: '#05c0b8',
                  color: 'white',
                  marginLeft: '10px',
                  minWidth: '80px'
                }}
              >
                {canRun && counter > 0 ? counter : 'OTP'}
              </Button>
            </Box>

            <Button
              fullWidth
              variant="contained"
              style={{ backgroundColor: '#05c0b8', color: 'white' }}
              onClick={submitOTP}
            >
              Submit
            </Button>
          </Container>
        </Dialog>

        <Dialog
          open={openDialog.open}
          onClose={dialogClose}
          PaperProps={{
            style: {
              borderRadius: "10px",
              padding: "20px",
            },
          }}
        >
          <Typography>{openDialog.body}</Typography>
        </Dialog>
      </div>
    </div>
  );
};

export default MyBank;
