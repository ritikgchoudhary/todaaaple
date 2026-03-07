/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  FormControl,
  Button,
  FilledInput,
  InputLabel,
  Container,
  Dialog,
  CircularProgress,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
} from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import EditIcon from "@material-ui/icons/Edit";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import ClearIcon from "@material-ui/icons/Clear";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import utr1 from "../../../assets/images/utr1.png";
import utr2 from "../../../assets/images/utr2.png";
import utr3 from "../../../assets/images/utr3.png";
import * as api from "../../../api/auth";

const TEAL = "#05c0b8";

const AMOUNT_OPTIONS = [100, 200, 300, 500, 1000];

const GATEWAY_LABELS = {
  auto: (autoLimit) => (autoLimit && autoLimit.auto ? "Auto (QR)" : "Auto (Paytm)"),
  manual: "UPI (Manual)",
  card: "Card (Credit/Debit)",
  lgpay: "LG Pay",
  watchpay: "Watch Pay",
  rupeerush: "Rupee Rush",
};
const GATEWAY_RANGES = {
  auto: "100 - 50K",
  manual: "200 - 1L",
  card: "200 - 1L",
  lgpay: "200 - 50K",
  watchpay: "200 - 50K",
  rupeerush: "200 - 50K",
};
const DEFAULT_GATEWAY_LIST = ["auto", "manual", "card", "lgpay", "watchpay", "rupeerush"];

const useStyles = makeStyles(() => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F5F9",
    display: "flex",
    justifyContent: "center",
    paddingBottom: "calc(100px + env(safe-area-inset-bottom))",
  },
  frame: {
    width: "100%",
    maxWidth: 500,
    minHeight: "100vh",
    backgroundColor: "#fff",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    padding: "10px 16px",
    backgroundColor: TEAL,
  },
  content: {
    padding: "20px",
  },
  balanceSection: {
    textAlign: "center",
    marginBottom: "24px",
  },
  balanceText: {
    fontSize: "26px",
    fontWeight: "bold",
    color: TEAL,
  },
  balanceLabel: {
    fontSize: "14px",
    color: "#666",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  sectionTitleIcon: {
    color: TEAL,
    fontSize: 20,
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: "0 16px",
    border: "1px solid #e0e0e0",
  },
  currencySymbol: {
    fontSize: "20px",
    fontWeight: "bold",
    marginRight: 10,
    color: TEAL,
  },
  amountInput: {
    "& .MuiFilledInput-root": { backgroundColor: "transparent" },
    "& .MuiFilledInput-input": {
      padding: "14px 0",
      fontSize: "17px",
      fontWeight: "bold",
      color: "#333",
    },
    "& .MuiFilledInput-underline:before": { borderBottom: "none" },
    "& .MuiFilledInput-underline:after": { borderBottom: "none" },
  },
  quickAmountGrid: {
    marginBottom: 16,
  },
  amountButtonsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  quickBtn: {
    minWidth: "calc(33.33% - 6px)",
    flex: "1 1 calc(33.33% - 6px)",
    minHeight: 44,
    borderRadius: 10,
    fontSize: "14px",
    fontWeight: 600,
    backgroundColor: "#fff",
    color: "#333",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    touchAction: "manipulation",
    margin: 0,
    padding: "0 8px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: "#f0fdfa",
      borderColor: TEAL,
    },
  },
  quickBtnSelected: {
    minWidth: "calc(33.33% - 6px)",
    flex: "1 1 calc(33.33% - 6px)",
    minHeight: 44,
    borderRadius: 10,
    fontSize: "14px",
    fontWeight: 600,
    backgroundColor: TEAL,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    touchAction: "manipulation",
    margin: 0,
    padding: "0 8px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: "#04a09a",
      color: "#fff",
    },
  },
  channelCard: {
    padding: "14px 16px",
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    color: "#666",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#f0fdfa",
      borderColor: TEAL,
    },
  },
  channelCardSelected: {
    backgroundColor: TEAL,
    color: "#fff",
    borderColor: TEAL,
    fontWeight: 600,
  },
  channelGrid: {
    marginBottom: 20,
  },
  actionBtn: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    backgroundColor: TEAL,
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textTransform: "none",
    marginTop: 20,
    "&:hover": {
      backgroundColor: "#04a09a",
    },
  },
  bottomSummary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    flexWrap: "wrap",
    gap: 12,
  },
  rechargeMethodLabel: {
    fontSize: "14px",
    color: "#666",
  },
  backBtn: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 10,
    fontSize: "13px",
    marginBottom: 16,
    display: "inline-block",
    cursor: "pointer",
  },
}));

const Recharge = () => {
  const classes = useStyles();
  const params = useParams();

  const URL = api.url;
  const history = useHistory();
  const [user, setUser] = useState([{ balance: 0.0 }]);
  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [loader, setLoader] = React.useState(true);
  const [isBlocked, setBlock] = useState({ open: false, msg: "" });
  const [detail, setDetail] = useState({ name: "Customer", email: "" });
  const [autoLimit, setAutoLimit] = useState({});
  const [gateway, setGateway] = useState("auto");
  const [upiSelected, setUPISelected] = useState(1);
  const [upis, setUpis] = useState([]);
  const [recharge, setRecharge] = useState();
  const [utr, setUTR] = useState("");
  const [rechargeEnabled, setRechargeEnabled] = useState(true);
  const [gatewayList, setGatewayList] = useState(DEFAULT_GATEWAY_LIST);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUser/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setUser(response.data);

          if (response.data[0].block) {
            setBlock({ ...isBlocked, open: true, msg: response[0].block });
          }

          axios.get(`${URL}/getCurrentGateway/`).then((response) => {
            const d = response.data;
            const g = d.gateway;
            const allowed = ["auto", "manual", "card", "lgpay", "watchpay", "rupeerush"];
            if (typeof d.rechargeEnabled === "boolean") setRechargeEnabled(d.rechargeEnabled);
            if (Array.isArray(d.gatewayList) && d.gatewayList.length) {
              setGatewayList(d.gatewayList);
              setGateway(d.gatewayList.includes(g) ? g : d.gatewayList[0]);
            } else {
              setGateway(allowed.includes(g) ? g : "auto");
            }
            setAutoLimit(d.limit || {});
          });
          axios
            .get(`${URL}/getShuffleUPI/${foundUser.result.id}`, {
              headers: { Authorization: AuthStr },
            })
            .then((res) => {
              setUpis(res.data);
              setLoader(false);
            });

          axios
            .get(`${URL}/getRecentRecharges/${foundUser.result.id}`, {
              headers: { Authorization: AuthStr },
            })
            .then((res) => {
              setRecharge(res.data);
            });
        })
        .catch((error) => {
          history.push("/login");
        });

    } else {
      history.push("/login");
    }

  }, []);
  const [amount, setAmount] = useState(1000);
  const handleAmount = (money) => (e) => {
    setAmount(money);
    if (gateway === "auto" && autoLimit.auto) {
      if (money > autoLimit.value) {
        setAmount(autoLimit.value);
      }
    }
  };

  const ruleClose = () => {
    setRule(false);
  };
  const openRule = () => {
    setRule(true);
  };

  const handleUTR = (e) => {
    setUTR(e.target.value);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    const num = val === "" ? 0 : parseInt(val, 10);
    const safeAmount = isNaN(num) ? 0 : Math.max(0, num);
    if (gateway === "auto" && autoLimit.auto && autoLimit.value != null) {
      setAmount(Math.min(safeAmount, autoLimit.value));
    } else {
      setAmount(safeAmount);
    }
  };
  const selectUPI = (e, val) => {
    e.preventDefault();
    setUPISelected(val);
    //setLevel(level+1);
  };

  const copy = (e, val) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${val}`);
    setDialog({ ...openDialog, open: true, body: "Copied Successfully" });
  };

  const handleLevel = (e) => {
    e.preventDefault();
    if (level === 2) {
      if (utr.length < 6 || utr.length > 12) {
        setDialog({
          ...openDialog,
          open: true,
          body: "Invalid UTR",
        });
      } else {
        if (amount < 200 || amount > 100000) {
          setDialog({
            ...openDialog,
            open: true,
            body: "Minimum recharge is 200, Maximum 1,00,000",
          });
        } else {
          //  setDialog({ ...openDialog, open: true, body: 'Recharge is paused. We are on maintenance.'});
          setLoader(true);
          var pd = {
            amount: `${amount}`,
            utr: utr,
            upi: upis[upiSelected],
            customer_name: detail.name,
            customer_email: "test@gmail.com",
            customer_mobile: `${user[0].phone}`,
            userId: user[0].id,
            redirect_url: `${URL}/upiVerifyPayment/${user[0].id}`,
          };
          const AuthStr = "Bearer ".concat(user[0].token);
          fetch(`${URL}/submitUTR/${user[0].id}/${amount}`, {
            method: "POST",
            headers: {
              Authorization: AuthStr,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pd),
          }).then((res) => {
            axios
              .get(`${URL}/getRecentRecharges/${user[0].id}`, {
                headers: { Authorization: AuthStr },
              })
              .then((res) => {
                setRecharge(res.data);
              });
            setDialog({
              open: true,
              body: "Request submitted successfuly. Please wait for 3-5 minutes.",
            });
            setLevel(0);
            setLoader(false);
          });
        }
      }
    } else {
      setLevel(level + 1);
    }
  };
  const handleBack = (e) => {
    e.preventDefault();
    setLevel(level - 1);
  };
  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };
  const [ruleDialog, setRule] = React.useState(false);
  const [level, setLevel] = React.useState(0);

  const upiFin = (e, app) => {
    e.preventDefault();

    var product = "Software development";
    if (amount === 10000) product = "React Node js Login/Signup Page";
    if (amount === 200) product = "Data Cable";
    if (amount === 500) product = "Wireless Mouse";
    if (amount === 1000) product = "Keyboard";
    if (amount === 5000) product = "React js Login/Signup Template";
    if (amount === 400) product = "Flutter Book";
    if (amount >= 15000) product = "Web Designing";
    if (amount >= 25000) product = "Web development";
    if (amount >= 30000) product = "App Development";

    //Create a Data object that is to be passed to LAUNCH method of Bolt
    if (!detail.name || detail.name.length < 2) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Please enter valid name.",
      });
    } else {
      if (amount < 200 || amount > 100000) {
        // setsabpaisa({...sabpaisa, isOpen: true})
        setDialog({
          ...openDialog,
          open: true,
          body: "Minimum recharge is 200, Maximum 1,00,000",
        });
      } else {
        //setDialog({ ...openDialog, open: true, body: 'Recharge is paused. We are on maintenance.'});
        setLoader(true);
        var pd = {
          app,
          amount: `${amount}`,
          p_info: product,
          customer_name: detail.name,
          customer_email: "test@gmail.com",
          customer_mobile: `${user[0].phone}`,
          userId: user[0].id,
          redirect_url: "https://game.toddapples.com"
        };

        fetch(`${URL}/createIMBOrder`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pd),
        })
          .then(function (a) {
            return a.json();
          })
          .then(function (json) {

            console.log(json)
            if (json["status"] === true) {
              window.location.replace(json["result"]["payment_url"]);
            }
          });
      }
    }
  };

  const upi = (e, app) => {
    e.preventDefault();

    var product = "Software development";
    if (amount === 10000) product = "React Node js Login/Signup Page";
    if (amount === 200) product = "Data Cable";
    if (amount === 500) product = "Wireless Mouse";
    if (amount === 1000) product = "Keyboard";
    if (amount === 5000) product = "React js Login/Signup Template";
    if (amount === 400) product = "Flutter Book";
    if (amount >= 15000) product = "Web Designing";
    if (amount >= 25000) product = "Web development";
    if (amount >= 30000) product = "App Development";

    //Create a Data object that is to be passed to LAUNCH method of Bolt
    if (!detail.name || detail.name.length < 2) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Please enter valid name.",
      });
    } else {
      if (amount < 200 || amount > 10000) {
        // setsabpaisa({...sabpaisa, isOpen: true})
        setDialog({
          ...openDialog,
          open: true,
          body: "Minimum recharge is 200, Maximum 10,000",
        });
      } else {
        //  setDialog({ ...openDialog, open: true, body: 'Recharge is paused. We are on maintenance.'});
        setLoader(true);
        var pd = {
          app,
          amount: `${amount}`,
          p_info: product,
          customer_name: detail.name,
          customer_email: "test@gmail.com",
          customer_mobile: `${user[0].phone}`,
          userId: user[0].id,
          redirect_url: `https://toddapple-dsftlpdfxq-el.a.run.app/upiVerifyPayment/${user[0].id}`
        };

        fetch(`${URL}/upiCreateOrderV2`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pd),
        })
          .then(function (a) {
            return a.json();
          })
          .then(function (json) {
            console.log(json)

            if (json["status"] === true) {
              window.location.replace(json["data"]["payment_url"]);
            }
          });
      }
    }
  };
  const manualQR = (e, app) => {
    e.preventDefault();
    var product = "Software development";
    if (amount === 10000) product = "React Node js Login/Signup Page";
    if (amount === 200) product = "Data Cable";
    if (amount === 500) product = "Wireless Mouse";
    if (amount === 1000) product = "Keyboard";
    if (amount === 5000) product = "React js Login/Signup Template";
    if (amount === 400) product = "Flutter Book";
    if (amount >= 15000) product = "Web Designing";
    if (amount >= 25000) product = "Web development";
    if (amount >= 30000) product = "App Development";

    //Create a Data object that is to be passed to LAUNCH method of Bolt

    if (amount < 1000 || amount > 100000) {
      // setsabpaisa({...sabpaisa, isOpen: true})
      setDialog({
        ...openDialog,
        open: true,
        body: "Minimum recharge is 1000, Maximum 1,00,000",
      });
    } else {
      //  setDialog({ ...openDialog, open: true, body: 'Recharge is paused. We are on maintenance.'});
      setLoader(true);
      var pd = {
        app,
        amount: `${amount}`,
        p_info: product,
        customer_name: "name",
        customer_email: "test@gmail.com",
        customer_mobile: `${user[0].phone}`,
        userId: user[0].id,
        redirect_url: `${URL}/upiVerifyPayment/${user[0].id}`,
      };
      const AuthStr = "Bearer ".concat(user[0].token);
      fetch(`${URL}/createTransactionQR/${user[0].id}/${amount}`, {
        method: "POST",
        headers: {
          Authorization: AuthStr,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pd),
      })
        .then(function (a) {
          return a.json();
        })
        .then(function (json) {
          setLoader(false);
          // console.log(json['link']);
          window.location.replace(json["link"]);

          // if(json['status'] === true){

          //   window.location.replace(json['data']['payment_url']);

          // }
        });
    }
  };

  const lgPay = (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (isNaN(amt) || amt < 200 || amt > 100000) {
      setDialog({ open: true, body: "Please enter a valid amount between ₹200 and ₹1,00,000." });
      return;
    }
    if (!detail.name || detail.name.length < 2) {
      setDialog({ open: true, body: "Please enter valid name." });
      return;
    }
    setLoader(true);
    const pd = {
      amount: `${amt}`,
      customer_name: detail.name,
      customer_email: "test@gmail.com",
      customer_mobile: `${user[0].phone}`,
      userId: user[0].id
    };
    const AuthStr = "Bearer ".concat(user[0].token);
    fetch(`${URL}/lgPayCreateOrder/${user[0].id}`, {
      method: "POST",
      headers: {
        Authorization: AuthStr,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pd),
    })
      .then(res => res.json())
      .then(json => {
        setLoader(false);
        if (json.code === 200 && json.payment_url) {
          window.location.replace(json.payment_url);
        } else {
          setDialog({ open: true, body: json.message || "Error creating LG Pay order" });
        }
      });
  };

  const rupeeRush = (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (isNaN(amt) || amt < 200 || amt > 100000) {
      setDialog({ open: true, body: "Please enter a valid amount between ₹200 and ₹1,00,000." });
      return;
    }
    if (!detail.name || detail.name.length < 2) {
      setDialog({ open: true, body: "Please enter valid name." });
      return;
    }
    setLoader(true);
    const pd = {
      amount: `${amt}`,
      customer_name: detail.name,
      customer_email: "test@gmail.com",
      customer_mobile: `${user[0].phone}`,
      userId: user[0].id
    };
    const AuthStr = "Bearer ".concat(user[0].token);
    fetch(`${URL}/rupeeRushCreateOrder/${user[0].id}`, {
      method: "POST",
      headers: {
        Authorization: AuthStr,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pd),
    })
      .then(res => res.json())
      .then(json => {
        setLoader(false);
        if (json.code === 200 && json.payment_url) {
          window.location.replace(json.payment_url);
        } else {
          setDialog({ open: true, body: json.message || "Error creating Rupee Rush order" });
        }
      });
  };

  const watchPay = (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (isNaN(amt) || amt < 200 || amt > 100000) {
      setDialog({ open: true, body: "Please enter a valid amount between ₹200 and ₹1,00,000." });
      return;
    }
    if (!detail.name || detail.name.length < 2) {
      setDialog({ open: true, body: "Please enter valid name." });
      return;
    }
    setLoader(true);
    const pd = {
      amount: `${amt}`,
      customer_name: detail.name,
      customer_email: "test@gmail.com",
      customer_mobile: `${user[0].phone}`,
      userId: user[0].id
    };
    const AuthStr = "Bearer ".concat(user[0].token);
    fetch(`${URL}/watchPayCreateOrder/${user[0].id}`, {
      method: "POST",
      headers: {
        Authorization: AuthStr,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pd),
    })
      .then(res => res.json())
      .then(json => {
        setLoader(false);
        if (json.code === 200 && json.payment_url) {
          window.location.replace(json.payment_url);
        } else {
          setDialog({ open: true, body: json.message || "Error creating Watch Pay order" });
        }
      });
  };

  const cardPayment = (e) => {
    e.preventDefault();
    if (!detail.name || detail.name.length < 2) {
      setDialog({ open: true, body: "Please enter valid name." });
      return;
    }
    if (amount < 200 || amount > 100000) {
      setDialog({ open: true, body: "Minimum recharge is ₹200, Maximum ₹1,00,000 for Card payment." });
      return;
    }
    setLoader(true);
    const AuthStr = "Bearer ".concat(user[0].token);
    fetch(`${URL}/cashfree/create-order/${user[0].id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: AuthStr,
      },
      body: JSON.stringify({ amount, phone: user[0].phone }),
    })
      .then((res) => res.json())
      .then((json) => {
        setLoader(false);
        if (json.payment_session_id) {
          setDialog({
            open: true,
            body: "Redirecting to secure Card payment…",
          });
          if (window.Cashfree) {
            window.Cashfree.checkout({ paymentSessionId: json.payment_session_id, returnUrl: window.location.origin + "/rechargeHistory", redirectTarget: "_self" });
          } else {
            const s = document.createElement("script");
            s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
            s.onload = () => {
              if (window.Cashfree && window.Cashfree.checkout) {
                window.Cashfree.checkout({ paymentSessionId: json.payment_session_id, returnUrl: window.location.origin + "/rechargeHistory", redirectTarget: "_self" });
              }
            };
            document.body.appendChild(s);
          }
        } else {
          setDialog({ open: true, body: json.msg || json.message || "Card payment could not be started. Please use UPI, LG Pay, Watch Pay or Rupee Rush." });
        }
      })
      .catch(() => {
        setLoader(false);
        setDialog({ open: true, body: "Card payment is temporarily unavailable. Please use UPI, LG Pay, Watch Pay or Rupee Rush." });
      });
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>

        <Dialog
          open={ruleDialog}
          onClose={ruleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{ style: { backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: 12 } }}
        >
          <DialogContent>
            <Typography align="center" style={{ fontSize: "20px", fontWeight: "bold", paddingBottom: "20px", color: "#333" }}>Payment UTR</Typography>
            <img style={{ paddingLeft: '15px' }} src={utr1} alt="mines" />
            <img style={{ paddingLeft: '15px' }} src={utr2} alt="mines" />
            <img style={{ paddingLeft: '15px' }} src={utr3} alt="mines" />
            <Typography align="left" style={{ fontSize: "16px", fontWeight: "bold", paddingBottom: "20px", paddingTop: "20px", color: "#333" }}>Copy UPI ID</Typography>
            <Typography align="left" style={{ fontSize: "15px", paddingBottom: "20px", color: "#666" }}>Open any UPI app on your phone. Pay to UPI ID you just copied. After payment copy UTR and submit here.</Typography>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isBlocked.open}
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
              backgroundColor: "black",
              opacity: "0.6",
              height: "80px",
              paddingTop: "10px",
            }}
          >
            <Typography style={{ paddingTop: "10px", color: "white" }}>
              {isBlocked.msg}
            </Typography>
          </Container>
        </Dialog>
        <Dialog
          open={loader}
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
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: "24px",
              border: "1px solid #e0e0e0",
            }}
          >
            <CircularProgress style={{ color: TEAL }} />
            <Typography style={{ paddingTop: "12px", color: "#333" }}>
              Please Wait!
            </Typography>
          </Container>
        </Dialog>

        <Dialog
          open={openDialog.open}
          onClose={dialogClose}
          PaperProps={{
            style: {
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 12,
            },
          }}
        >
          <Container>
            <Typography style={{ padding: "16px", color: "#333" }}>
              {openDialog.body}
            </Typography>
          </Container>
        </Dialog>

        <Grid container direction="row" alignItems="center" className={classes.header}>
          <Grid item xs={2}>
            <ArrowBackIosIcon style={{ fontSize: 20, color: "#fff", cursor: "pointer" }} onClick={() => history.goBack()} />
          </Grid>
          <Grid item xs={8}>
            <Typography align="center" style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>Recharge</Typography>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>

        <div className={classes.content}>
          <div className={classes.balanceSection}>
            <Typography className={classes.balanceText}>₹ {user && user[0].balance.toFixed(2)}</Typography>
            <Typography className={classes.balanceLabel}>Current Balance</Typography>
          </div>

          {!rechargeEnabled && (
            <Paper style={{ padding: 24, textAlign: "center", backgroundColor: "#f8fafc", marginTop: 16 }}>
              <Typography style={{ fontSize: 16, color: "#333" }}>Recharge is temporarily unavailable. Please try again later.</Typography>
            </Paper>
          )}

          {rechargeEnabled && (level === 1 || level === 2) && (
            <div className={classes.backBtn} onClick={(e) => handleBack(e)}>
              ← Back
            </div>
          )}

          {rechargeEnabled && (level === 0 ? (
            <div>
              {/* 1. Deposit amount */}
              <div className={classes.sectionTitle}>
                <AccountBalanceWalletIcon className={classes.sectionTitleIcon} />
                <span>Deposit amount</span>
              </div>
              <div className={classes.amountButtonsWrap}>
                {AMOUNT_OPTIONS.map((amt) => (
                  <div
                    key={amt}
                    className={Number(amount) === amt ? classes.quickBtnSelected : classes.quickBtn}
                    onClick={() => {
                      setAmount(amt);
                      if (gateway === "auto" && autoLimit.auto && autoLimit.value != null && amt > autoLimit.value) {
                        setAmount(autoLimit.value);
                      }
                    }}
                  >
                    ₹{amt >= 1000 ? (amt / 1000) + "K" : amt}
                  </div>
                ))}
              </div>
              <div className={classes.inputGroup}>
                <span className={classes.currencySymbol}>₹</span>
                <FormControl fullWidth>
                  <FilledInput
                    className={classes.amountInput}
                    value={amount}
                    type="number"
                    fullWidth
                    name="amount"
                    disableUnderline
                    placeholder="₹100.00 - ₹50,000.00"
                    onChange={handleChange}
                    inputProps={{ style: { color: "inherit" } }}
                  />
                </FormControl>
                <IconButton size="small" onClick={() => setAmount(0)} style={{ color: "#666" }} aria-label="clear">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </div>

              {gateway === "auto" && autoLimit.auto && amount > (autoLimit.value || 0) && (
                <Typography style={{ fontSize: "12px", color: "#666", marginBottom: 12 }}>
                  For recharge greater than ₹{autoLimit.value}, please make multiple transactions of ₹{autoLimit.value}.
                </Typography>
              )}

              {/* 2. Select channel */}
              <div className={classes.sectionTitle} style={{ marginTop: 8 }}>
                <EditIcon className={classes.sectionTitleIcon} />
                <span>Select channel</span>
              </div>
              <Grid container spacing={1} className={classes.channelGrid}>
                {gatewayList.map((id) => {
                  const label = typeof GATEWAY_LABELS[id] === "function" ? GATEWAY_LABELS[id](autoLimit) : GATEWAY_LABELS[id] || id;
                  const range = GATEWAY_RANGES[id] || "200 - 50K";
                  return { id, label, range };
                }).map((g) => (
                  <Grid item xs={6} key={g.id}>
                    <div
                      className={gateway === g.id ? `${classes.channelCard} ${classes.channelCardSelected}` : classes.channelCard}
                      onClick={() => setGateway(g.id)}
                    >
                      <Typography style={{ fontWeight: gateway === g.id ? 600 : 500, fontSize: "14px" }}>{g.label}</Typography>
                      <Typography style={{ fontSize: "11px", opacity: gateway === g.id ? 0.85 : 0.7, marginTop: 2 }}>Balance: {g.range}</Typography>
                    </div>
                  </Grid>
                ))}
              </Grid>

              <div className={classes.bottomSummary}>
                <Typography className={classes.rechargeMethodLabel}>
                  Recharge Method: {gatewayList.map((id) => ({
                    id,
                    label: typeof GATEWAY_LABELS[id] === "function" ? GATEWAY_LABELS[id](autoLimit) : GATEWAY_LABELS[id] || id,
                  })).find((x) => x.id === gateway)?.label || gateway}
                </Typography>
              </div>
            </div>
          ) : level === 1 ? (
            <div>
              <div className={classes.sectionTitle} style={{ marginBottom: 16 }}>
                <EditIcon className={classes.sectionTitleIcon} />
                <span>Select Payment Method</span>
              </div>

              <Paper elevation={0} style={{ borderRadius: 10, overflow: "hidden", backgroundColor: "#f5f5f5", border: "1px solid #e0e0e0" }}>
                {upis.map((item, index) => (
                  <div
                    key={index}
                    onClick={(e) => { selectUPI(e, index); setGateway("manual"); }}
                    className={upiSelected === index && gateway === "manual" ? `${classes.channelCard} ${classes.channelCardSelected}` : classes.channelCard}
                    style={{ borderRadius: 0, margin: 0, borderBottom: "1px solid #e8e8e8" }}
                  >
                    <Typography style={{ fontWeight: upiSelected === index && gateway === "manual" ? 600 : 500 }}>UPI Payment {index + 1}</Typography>
                  </div>
                ))}
                {["lgpay", "watchpay", "rupeerush"].map((gw) => (
                  <div
                    key={gw}
                    onClick={() => setGateway(gw)}
                    className={gateway === gw ? `${classes.channelCard} ${classes.channelCardSelected}` : classes.channelCard}
                    style={{ borderRadius: 0, borderBottom: "1px solid #e8e8e8" }}
                  >
                    <Typography style={{ fontWeight: gateway === gw ? 600 : 500 }}>{gw === "lgpay" ? "LG Pay" : gw === "watchpay" ? "Watch Pay" : "Rupee Rush"}</Typography>
                  </div>
                ))}
              </Paper>
            </div>
          ) : (
            <div>
              <Typography align="center" variant="h6" style={{ marginBottom: 20, color: "#333" }}>
                Confirm Payment
              </Typography>

              <Paper style={{ padding: 20, borderRadius: 10, marginBottom: 20, backgroundColor: "#f8fafc", border: "1px solid #e0e0e0" }} elevation={0}>
                <Typography style={{ fontSize: 12, color: "#666", textAlign: "center" }}>Pay to UPI ID</Typography>
                <Typography align="center" style={{ fontWeight: "bold", margin: "8px 0 12px", color: "#333" }}>
                  {upis[upiSelected]}
                </Typography>
                <Button variant="outlined" size="small" style={{ display: "block", margin: "0 auto", borderColor: TEAL, color: TEAL }} onClick={(e) => copy(e, upis[upiSelected])}>
                  Copy UPI ID
                </Button>
              </Paper>

              <div style={{ marginBottom: 20 }}>
                <Typography style={{ marginBottom: 8, color: "#666", fontSize: 13 }}>Input UTR / Reference Number</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="12-digit UTR Number"
                  value={utr}
                  onChange={handleUTR}
                  InputProps={{
                    style: { backgroundColor: "#fff", color: "#333", borderRadius: 10 },
                  }}
                />
              </div>

              <Typography variant="caption" align="center" display="block" onClick={openRule} style={{ textDecoration: "underline", cursor: "pointer", marginBottom: "20px", color: TEAL }}>
                Where to find UTR number?
              </Typography>
            </div>
          ))}

          {rechargeEnabled && (level === 0 || level === 1 || level === 2) && (
            <Button
              type="button"
              className={classes.actionBtn}
              onClick={(e) => {
                e.preventDefault();
                if (gateway === "lgpay") {
                  lgPay(e);
                } else if (gateway === "watchpay") {
                  watchPay(e);
                } else if (gateway === "rupeerush") {
                  rupeeRush(e);
                } else if (gateway === "card") {
                  cardPayment(e);
                } else if (gateway === "auto") {
                  if (autoLimit.auto) {
                    if (level === 0) {
                      manualQR(e, "qr");
                    } else if (level === 1) {
                      setLevel(2);
                    } else {
                      handleLevel(e);
                    }
                  } else {
                    upi(e, 'paytm');
                  }
                } else {
                  // Manual gateway or logic that uses level
                  if (level === 0) setLevel(1);
                  else if (level === 1) setLevel(2);
                  else handleLevel(e);
                }
              }}
            >
              {level === 2 ? "Submit UTR" : level === 0 ? "Deposit" : (gateway === "lgpay" || gateway === "watchpay" || gateway === "rupeerush" || gateway === "card") ? "Pay Now" : (gateway === "auto") ? "Pay Now" : level === 1 ? "Proceed to Pay" : "Recharge"}
            </Button>
          )}

        </div>
      </div>
    </div>
  );
};

export default Recharge;
