import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Container,
  Grid,
  FormControl,
  Button,
  FilledInput,
  InputLabel,
  Dialog,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Box,
  IconButton,
  Divider,
  Slide
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import UPI from "../Images/upi.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Paytm from "../Images/paytm.png";
import Gpay from "../Images/gpay.png";
import Bhim from "../Images/bhim.jpeg";
import Phonepe from "../Images/phonepe.png";
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay";
import { load } from "@cashfreepayments/cashfree-js";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HistoryIcon from '@mui/icons-material/History';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: 'white',
    minHeight: '100vh',
    paddingBottom: '100px',
  },
  header: {
    backgroundColor: '#05c0b8',
    padding: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  balanceCard: {
    backgroundColor: '#05c0b8',
    color: 'white',
    borderRadius: '15px',
    padding: '24px',
    margin: '16px 0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '24px',
    margin: '16px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  amountButton: {
    backgroundColor: 'white',
    border: '1px solid #05c0b8',
    color: '#05c0b8',
    padding: '16px',
    borderRadius: '10px',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#05c0b8',
      color: 'white',
    },
    '&.selected': {
      backgroundColor: '#05c0b8',
      color: 'white',
    }
  },
  amountInput: {
    backgroundColor: 'white',
    borderRadius: '10px',
    '& .MuiFilledInput-root': {
      backgroundColor: '#f5f5f5',
      '&:hover': {
        backgroundColor: '#E8E8E8',
      },
      '&.Mui-focused': {
        backgroundColor: '#f5f5f5',
      },
    },
  },
  actionButton: {
    backgroundColor: '#05c0b8',
    color: 'white',
    padding: '12px',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: '#04a8a1',
    },
  },
  historyButton: {
    backgroundColor: 'white',
    color: '#05c0b8',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #05c0b8',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '16px',
    margin: '16px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  historyItem: {
    padding: '12px',
    borderBottom: '1px solid #f5f5f5',
    '&:last-child': {
      borderBottom: 'none',
    }
  },
  statusSuccess: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusPending: {
    color: '#FFA726',
    fontWeight: 'bold',
  },
  statusFailed: {
    color: '#EF5350',
    fontWeight: 'bold',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '24px',
  },
  promotionBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#FF4B4B',
    color: 'white',
    borderRadius: '10px',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    animation: '$pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' }
  }
}));

const PlaceOrder3 = () => {
  const classes = useStyles();
  const formRef = useRef();
  let cashfree;
  var initializeSDK = async function () {          
      cashfree = await load({
          mode: "production"
      });
  }
  initializeSDK();
    const params = useParams();
    const history = useNavigate();
    const { error, isLoading, Razorpay } = useRazorpay();
  const [user, setUser] = useState([{ balance: 0.0 }]);
  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [loader, setLoader] = React.useState(true);
  const [level, setLevel] = React.useState(0);
  const [autoLimit, setAutoLimit] = useState({});
  const [gateway, setGateway] = useState("auto");
  const [recharge, setRecharge] = useState();
  const localUrl = "http://localhost:4001"
  const liveURL = "https://vgaserver3-147401630703.asia-south1.run.app";
  const URL = liveURL;
  const [notice, setNotice] = useState({ open: false, notice: {} });
  const [qrDialog, setqrDialog] = React.useState({ open: false });
  const [value, setValue] = useState("");
  const [isBlocked, setBlock] = useState({ open: false, msg: "" });
  const [paymentData, setPaymentData] = useState({data: {}})
  const [amount, setAmount] = useState(500);

  const handleAmount = (money) => (e) => {
    setAmount(money);
  };
    const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };
  const qrClose = () => {
    setqrDialog({ ...qrDialog, open: false });
  };
  const handleChange = (e) => {
    setAmount(parseInt(e.target.value));
  };

  const phonePe = (e) => {
    e.preventDefault();
    if (amount < 1 || amount > 200000) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Minimum recharge is 2000",
      });
    } else {
      setLoader(true);
      const AuthStr = "Bearer ".concat(user[0].token);
      fetch(`${URL}/initiatePhonePePG/${user[0].id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: AuthStr,
        },
        body: JSON.stringify({
          amount,
          userId: user[0].id,
          phone: user[0].phone,
        }),
      })
        .then(function (a) {
          return a.json();
        })
        .then(function (json) {
          console.log(json)
        });
    }
  };
     
  useEffect(() => {
    const AuthStr = "Bearer ".concat(params.token);
    axios
      .get(`${URL}/getUser/${params.id}`, {
        headers: { Authorization: AuthStr },
      })
      .then((response) => {
        setUser(response.data);
        setNotice({ open: true});
        setLoader(false);
        axios
        .get(`${URL}/getCurrentGateway`,)
        .then((response) => {
          
         setGateway(response.data.gateway)
        })
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const dialogCloseNotice = () => {
    setNotice({ ...notice, open: false });
  };
  const goBack = (e) => {
    e.preventDefault();
    history(-1)
  }
  const payApp = (e,value) => {
    e.preventDefault();
    window.location.replace(value);
    setqrDialog({open: false})
    
    
  }
  const cashfreePg = (e) => {
    e.preventDefault();
    if (amount < 2000 || amount > 200000) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Minimum recharge is 2000",
      });
    } else {
      setLoader(true);
      const AuthStr = "Bearer ".concat(user[0].token);
      fetch(`${URL}/cashfree/create-order/${user[0].id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: AuthStr,
        },
        body: JSON.stringify({
          amount,
          
          phone: user[0].phone,
        }),
      })
        .then(function (a) {
          return a.json();
        })
        .then(function (json) {

          let checkoutOptions = {
            paymentSessionId: json['payment_session_id'],
            redirectTarget: "_modal"
        };
        
        cashfree.checkout(checkoutOptions).then((result) => {
            if(result.error){
                setLoader(false);
                console.log("User has closed the popup or there is some payment error, Check for Payment Status");
                console.log(result.error);
            }
            if(result.redirect){
              setLoader(false);
              window.location.replace("https://toddapple.live/rechargeHistory");
            }
            if(result.paymentDetails){
              window.location.replace("https://toddapple.live/rechargeHistory");
        
            }
        });
        });
    }
  };
  const razropay = () => {
    setLoader(true)
    const AuthStr = "Bearer ".concat(user[0].token);
    fetch(`${URL}/razarpay/create-order/${user[0].id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: AuthStr,
      },
      body:  JSON.stringify({
        amount,
      },)
    })
      .then(function (a) {
          return a.json();
        })
        .then(function (json) {
          setLoader(false)
        
        RazorpayOrderOptions = {
          key: "rzp_live_fJzOc7KpYoTdkk",
          amount: json.amount, // Amount in paise
          currency: "INR",
          name: "Gravity Technologies",
          description: "",
          order_id: json.id, // Generate order_id on server
          handler: function (response) {
            setLoader(true)
            fetch(`${URL}/razarpay/verify/${user[0].id}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: AuthStr,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            }).then(res => res.json())
              .then(data => {
                setLoader(false)
                if (data === 'ok') {
                  window.location.href = 'https://toddapple.live/rechargeHistory';
                } else {
                  window.location.href = 'https://toddapple.live/rechargeHistory';
                }
              }).catch(error => {
                setLoader(false)
                console.error('Error:', error);
                alert('Error verifying payment');
              });
          },
          prefill: {
            
           
            contact: `${user[0].phone}`,
          },
          theme: {
            color: "#00b8a9",
          },
        };
    
        const razorpayInstance = new Razorpay(RazorpayOrderOptions);
        razorpayInstance.open();
      }).catch();
    
  };

  const payLogic = (e) => {
    e.preventDefault();
    
    // Priority 1: Use Paygic (UPI) for all amounts
    if(gateway === "Paygic" || !gateway || gateway === "auto"){
      paygic(e);
    }
    // Fallback to other gateways if specified
    else if(amount < 2000){
      upi(e);
    }else{
      if(gateway === "Cashfree")
        cashfreePg(e);
      
      if(gateway === "Razorpay")
        razropay();

      if(gateway === "Phonepe")
        phonePe(e)
     
    }
  }

  const upi = (e) => {
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

    if (amount < 200 || amount > 10000) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Minimum recharge is 200, Maximum 10,000",
      });
    } else {
      setLoader(true);
      var pd = {
        
        amount: `${amount}`,
        p_info: product,
        customer_name: 'Name',
        customer_email: "test@gmail.com",
        customer_mobile: `${user[0].phone}`,
        userId: user[0].id,
        redirect_url: `${URL}/upiVerifyPayment/${user[0].id}`
      };

      fetch(`${URL}/upiCreateOrder`, {
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
 
  };
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

    if (false) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Please enter valid name.",
      });
    } else {
      if (amount < 7000 || amount > 100000) {
        setDialog({
          ...openDialog,
          open: true,
          body: "Minimum recharge is 200, Maximum 1,00,000",
        });
      } else {
        setLoader(true);
        var pd = {
          app,
          amount: `${amount}`,
          p_info: product,
          customer_name: "detail.name",
          customer_email: "test@gmail.com",
          customer_mobile: `${user[0].phone}`,
          userId: user[0].id,
          redirect_url: "https://toddapple.live"
        };

        fetch(`${URL}/createUPIPointOrder`, {
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
            if (json["msg"] === "success") {
              window.location.replace(json["data"]["url"]);
            }
          });
      }
    }
  };

  const paygic = (e) => {
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

    if (amount < 200 || amount > 100000) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Minimum recharge is 200, Maximum 1,00,000",
      });
    } else {
      setLoader(true);
      var pd = {
        
        amount: `${amount}`,
        p_info: product,
        customer_name: 'Customer',
        customer_email: "gravitytechnologies.online@gmail.com",
        customer_mobile: `${user[0].phone}`,
        userId: user[0].id,
        redirect_url: `${URL}/upiVerifyPayment/${user[0].id}`
      };
      const AuthStr = "Bearer ".concat(user[0].token);
      fetch(`${URL}/v2/createUPIintent/${user[0].id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: AuthStr,

        },
        body: JSON.stringify(pd),
      })
        .then(function (a) {
          return a.json();
        })
        .then(function (json) {
          
          setValue({gpay: json['gpay'],phonepe: json['phonePe'],paytm: json['paytm'],bhim: json['intent']});
          setqrDialog({open: true})
          setLoader(false)
        });
    }
 
  };

  const paycial = (e) => {
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

    if (amount < 200 || amount > 100000) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Minimum recharge is 200, Maximum 1,00,000",
      });
    } else {
      setLoader(true);
      var pd = {
        
        amount: amount,
        p_info: product,
        customer_name: 'Customer',
        customer_email: "gravitytechnologies.online@gmail.com",
        customer_mobile: `${user[0].phone}`,
        userId: user[0].id,
        redirect_url: `${URL}/upiVerifyPayment/${user[0].id}`
      };
      const AuthStr = "Bearer ".concat(user[0].token);
      fetch(`${URL}/paycialCreateOrder/${user[0].id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: AuthStr,

        },
        body: JSON.stringify(pd),
      })
        .then(function (a) {
          return a.json();
        })
        .then(function (json) {
          
          window.location.replace(json['url']);
          setLoader(false)
        });
    }
 
  };

  return (
    <div className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <IconButton onClick={goBack} style={{ color: 'white' }}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="h6" align="center" style={{ color: 'white', fontWeight: 500 }}>
              Deposit Money
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Container maxWidth="sm">
        {/* Balance Card */}
        <Slide in={true} direction="down">
          <Paper className={classes.balanceCard}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalanceWalletIcon />
                  <Typography variant="subtitle1" style={{ marginLeft: 8 }}>
                    Available Balance
                  </Typography>
                </Box>
                <Typography variant="h4" style={{ fontWeight: 'bold' }}>
                  ₹ {user?.[0]?.balance?.toFixed(2) || '0'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Slide>

        {/* Amount Input Card */}
        <Paper className={classes.amountCard}>
          <Typography variant="subtitle1" style={{ color: '#05c0b8', marginBottom: 16 }}>
            Enter Amount
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <Typography variant="h6" style={{ color: '#05c0b8' }}>₹</Typography>
            </Grid>
            <Grid item xs={10}>
              <FormControl fullWidth variant="filled">
                <FilledInput
                  value={amount}
                  type="number"
                  onChange={handleChange}
                  className={classes.amountInput}
                />
              </FormControl>
            </Grid>
          </Grid>

          {/* Quick Amount Buttons */}
          <Box mt={3}>
            <Typography variant="subtitle2" style={{ color: '#05c0b8', marginBottom: 12 }}>
              Quick Select
            </Typography>
            <Grid container spacing={2}>
              {[200, 500, 1000, 2000, 5000, 8000, 10000, 15000, 20000].map((value) => (
                <Grid item xs={4} key={value}>
                  <Button
                    fullWidth
                    className={`${classes.amountButton} ${amount === value ? 'selected' : ''}`}
                    onClick={handleAmount(value)}
                  >
                    ₹{value}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Payment Info */}
          <Box mt={3}>
            <Box display="flex" alignItems="center" mb={1}>
              <InfoOutlinedIcon style={{ color: '#05c0b8', marginRight: 8 }} />
              <Typography variant="subtitle2" style={{ color: '#05c0b8' }}>
                Payment Information
              </Typography>
            </Box>
            <Typography variant="body2" style={{ color: '#666' }}>
              • Minimum deposit: ₹200
            </Typography>
            <Typography variant="body2" style={{ color: '#666' }}>
              • Maximum deposit: ₹50,000
            </Typography>
            <Typography variant="body2" style={{ color: '#666' }}>
              • Instant credit after successful payment
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box mt={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={payLogic}
              className={classes.actionButton}
            >
              Pay Now
            </Button>
            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="https://winkaro.online/rechargeHistory"
              className={classes.historyButton}
              startIcon={<HistoryIcon />}
              style={{ marginTop: 12 }}
            >
              View History
            </Button>
          </Box>
        </Paper>

        {/* Recent Transactions */}
        <Paper className={classes.historyCard}>
          <Typography variant="subtitle1" style={{ color: '#05c0b8', marginBottom: 16 }}>
            Recent Transactions
          </Typography>
          {recharge && recharge.map((record, index) => (
            <ListItem key={index} className={classes.historyItem}>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <Typography variant="body2" style={{ color: '#666' }}>
                    {record.utr ? `UTR: ${record.utr}` : 'No UTR'}
                  </Typography>
                  <Typography variant="caption" style={{ color: '#999' }}>
                    {new Date(record.createDate || record.date).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="subtitle1" style={{ color: '#05c0b8', fontWeight: 'bold' }}>
                    ₹{record.amount}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    className={
                      record.status === 'success' ? classes.statusSuccess :
                      record.status === 'pending' ? classes.statusPending :
                      classes.statusFailed
                    }
                  >
                    {record.status.toUpperCase()}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </Paper>
      </Container>

      {/* QR Dialog */}
      <Dialog
        open={qrDialog.open}
        onClose={qrClose}
        PaperProps={{
          className: classes.dialog
        }}
      >
        <Container
          style={
            { 
              paddingBottom: "30px",
               paddingTop: "15px",
            }
          }
        >
          <Typography variant="h6" align="center" style={{ paddingTop: "10px",fontSize: '22px'}}>
          Amount ₹<b>{amount}</b>
        </Typography>
          <Typography variant="h6" align="center" style={{ paddingTop: "30px",paddingBottom: "15px",fontSize: '20px'}}>
          Pay Through
        </Typography>
        <Grid container direction="row"  justifyContent="space-between">
          <Grid item style={{justifyItems: 'center',width: '120px'}} onClick={(e) => payApp(e,value.paytm)}>
          <Typography align="center"> <img src={Paytm} alt="paytm" style={{ width: "70px" }} /></Typography>
          </Grid>
          <Grid item style={{justifyItems: 'center',width: '120px'}} onClick={(e) => payApp(e,value.phonepe)}>
          <Typography align="center"><img src={Phonepe} alt="" style={{ width: "70px" }} /></Typography>
          </Grid>
         
          </Grid>
          <Grid container direction="row"  justifyContent="space-between" style={{paddingTop: '15px'}}>
          
          <Grid item style={{justifyItems: 'center',width: '120px'}} onClick={(e) => payApp(e,value.gpay)}>
          <Typography align="center"><img src={Gpay} alt="" style={{ width: "90px" }} /></Typography>
          </Grid>
          <Grid item style={{justifyItems: 'center',width: '120px'}} onClick={(e) => payApp(e,value.bhim)}>
            <Typography align="center"><img src={Bhim} alt="" style={{ width: "90px" }} /></Typography>
          </Grid>
          </Grid>
        </Container>
      </Dialog>

      {/* Notice Dialog */}
       <Dialog
        open={notice.open}
        onClose={dialogCloseNotice}
        PaperProps={{
          className: classes.dialog
        }}
      >
        <Container
          style={
            {
              backgroundColor: "#05c0b8"
            }
          }
        >
          <Typography
          align="center"
            style={{
              paddingTop: '10px',
                color: "white",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            💰 - First Deposit Offer - 💰
          </Typography>

          <Typography
          align="start"
            style={{
              paddingTop: '10px',
                color: "white",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            ⭐️ Get 10% extra on first Deposit
          </Typography>
          <Typography
          align="start"
            style={{
              paddingTop: '5px',
                color: "white",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            ⭐️⭐️ Get 3% extra on every Deposit
          </Typography>
          <Typography
          align="start"
            style={{
              paddingTop: '5px',
                color: "white",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            ⭐️⭐️⭐️ Eg Get 22,000 on 20,000 firstDeposit
          </Typography>
          <Typography
          align="start"
            style={{
              paddingTop: '5px',
                color: "white",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            ⭐️⭐️⭐️ Eg Get 10,300 on 10,000 every Deposit
          </Typography>
          <a href="https://t.me/earningsource111">
          <Typography
          align="center"
            style={{
              paddingTop: '20px',
                color: "white",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            👉 Telegram 🔗 
          </Typography></a>
          <a href="https://whatsapp.com/channel/0029VaqXwZ1DOQIQesUykz12">
          <Typography
          align="center"
            style={{
              paddingTop: '5px',
                color: "white",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
            👉 Whatsapp 🔗 
          </Typography>
          </a>
          
          <Typography
          align="center"
            style={{
              paddingTop: '5px',
              paddingBottom: '20px',
                color: "white",
              fontSize: "17px",
              fontWeight: "bold",
            }}
          >
           ⭐️ Start Earning High Today ⭐️
          </Typography>
          <Typography align="center">
          <Button onClick={dialogCloseNotice} style={{backgroundColor: 'white',color: '#05c0b8',marginBottom: '20px'}}>Confirm</Button>

          </Typography>

          
        </Container>
      </Dialog>

      {/* Blocked Dialog */}
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

      {/* Loader Dialog */}
      <Dialog
        open={loader}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <Box style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <CircularProgress style={{ color: 'white' }} />
          <Typography style={{ color: 'white', marginTop: '10px' }}>
            Processing...
          </Typography>
        </Box>
      </Dialog>

      {/* Message Dialog */}
      <Dialog
        open={openDialog.open}
        onClose={dialogClose}
        PaperProps={{
          className: classes.dialog
        }}
      >
        <Typography style={{ color: '#05c0b8', padding: '16px' }}>
          {openDialog.body}
        </Typography>
      </Dialog>
    </div>
  );
};

export default PlaceOrder3;
