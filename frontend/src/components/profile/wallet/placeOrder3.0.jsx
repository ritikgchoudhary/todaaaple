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
} from "@material-ui/core";
import { useParams, Link } from "react-router-dom";
import { ArrowBackIos as ArrowBackIosNewIcon, AccountBalanceWallet as AccountBalanceWalletIcon, InfoOutlined as InfoOutlinedIcon, History as HistoryIcon } from '@material-ui/icons';
import axios from "axios";
import { useHistory } from "react-router-dom";
import Paytm from "../../../images/paytm.png";
import Gpay from "../../../images/gpay.png";
import Bhim from "../../../images/bhim.jpeg";
import Phonepe from "../../../images/phonepe.png";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#f5f7fa', // Standard light background
    minHeight: '100vh',
    paddingBottom: '100px',
    color: '#333',
    fontFamily: '"Inter", sans-serif',
  },
  header: {
    backgroundColor: '#05c0b8', // Match the teal theme
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    color: 'white',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    fontSize: '14px',
    color: '#ffffff',
    textDecoration: 'none',
  },
  balanceCard: {
    background: 'linear-gradient(135deg, #05c0b8 0%, #00d2c3 100%)', // Teal gradient
    borderRadius: '16px',
    padding: '20px',
    margin: '16px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(5, 192, 184, 0.2)',
  },
  balanceLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '8px',
    '& svg': {
      fontSize: '18px',
      marginRight: '6px',
    }
  },
  balanceValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    color: 'white',
  },
  refreshIcon: {
    marginLeft: '12px',
    fontSize: '20px',
    cursor: 'pointer',
    opacity: 0.8,
  },
  cardIcon: {
    fontSize: '36px',
    opacity: 0.5,
    color: 'white',
  },
  cardNumber: {
    fontSize: '16px',
    letterSpacing: '2px',
    opacity: 0.6,
    textAlign: 'right',
    color: 'white',
  },
  section: {
    padding: '0 16px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    color: '#333',
    '& svg': {
      fontSize: '18px',
      marginRight: '8px',
      color: '#05c0b8',
    }
  },
  categoryGrid: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  categoryItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1.5px solid #eef2f6',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    '&:hover': {
      borderColor: '#05c0b8',
    },
    '&.selected': {
      background: '#05c0b8', // Selected teal background
      borderColor: '#05c0b8',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(5, 192, 184, 0.3)',
    }
  },
  catIcon: {
    fontSize: '24px',
    marginBottom: '4px',
    display: 'block',
  },
  catLabel: {
    fontSize: '13px',
    fontWeight: 'bold',
  },
  bonusBadge: {
    backgroundColor: '#ff4d4f',
    color: 'white',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '10px',
    position: 'absolute',
    top: '-8px',
    right: '-5px',
  },
  channelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  channelItem: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1.5px solid #eef2f6',
    '&:hover': {
      borderColor: '#05c0b8',
    },
    '&.selected': {
      borderColor: '#05c0b8',
      backgroundColor: 'rgba(5, 192, 184, 0.05)',
      '& $channelName': {
        color: '#05c0b8',
      }
    }
  },
  channelName: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#333',
  },
  channelRange: {
    fontSize: '12px',
    color: '#666',
  },
  amountGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginTop: '16px',
  },
  amountItem: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    border: '1.5px solid #eef2f6',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '14px',
    '&:hover': {
      borderColor: '#05c0b8',
    },
    '&.selected': {
      backgroundColor: '#05c0b8',
      borderColor: '#05c0b8',
      color: '#fff',
    }
  },
  manualInput: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '12px 16px',
    marginTop: '16px',
    border: '1.5px solid #eef2f6',
    '&:focus-within': {
      borderColor: '#05c0b8',
    }
  },
  input: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#333',
    fontSize: '18px',
    fontWeight: 'bold',
    outline: 'none',
    width: '100%',
    '&::placeholder': {
      color: '#999',
    }
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    maxWidth: '500px', // Assuming a mobile view
    backgroundColor: '#ffffff',
    padding: '16px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 1000,
  },
  footerInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#666',
    padding: '0 4px',
  },
  depositBtn: {
    background: '#05c0b8', // Teal button
    color: 'white',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    textTransform: 'none',
    '&:hover': {
      background: '#04a8a1',
    },
    '&:disabled': {
      background: '#ccc',
    }
  },
  dialog: {
    backgroundColor: '#ffffff',
    color: '#333',
    borderRadius: '16px',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' }
  }
}));


const PlaceOrder3 = () => {
  const classes = useStyles();
  const formRef = useRef();
  let cashfree;
  // var initializeSDK = async function () {          
  //     cashfree = await load({
  //         mode: "production"
  //     });
  // }
  // initializeSDK();
  const params = useParams();
  const history = useHistory();

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
  const [paymentCategory, setPaymentCategory] = useState('Online');
  const [selectedChannel, setSelectedChannel] = useState('Watch Pay');
  const [selectedAmount, setSelectedAmount] = useState(300);

  const amountsINR = [300, 500, 800, 1000, 2000, 3000, 5000, 10000, 20000, 30000, 40000, 50000];
  const amountsUSDT = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

  const channels = {
    'Online': [
      { name: 'Watch Pay', range: '300 - 50K' },
      { name: 'watchpay', range: '300 - 50K' },
      { name: '101-pay', range: '300 - 50K' },
      { name: 'LG PAY', range: '300 - 50K' }
    ],
    'QR': [
      { name: 'Scan Pay', range: '100 - 20K' },
      { name: 'UPI QR', range: '100 - 20K' }
    ],
    'USDT': [
      { name: 'Crypto Pay', range: '10 - 100K' }
    ]
  };

  const currentAmounts = paymentCategory === 'USDT' ? amountsUSDT : amountsINR;

  const handleAmountSelect = (val) => {
    setSelectedAmount(val);
    if (paymentCategory === 'USDT') {
      setAmount(val * USDT_TO_INR_RATE);
    } else {
      setAmount(val);
    }
  };

  const handleDeposit = (e) => {
    if (selectedChannel === 'Watch Pay') watchPay(e);
    else if (selectedChannel === 'Rupee Rush') rushPay(e);
    else if (selectedChannel === 'LG PAY') lgPay(e);
    else if (paymentCategory === 'USDT') usdtPayment(e);
    else rushPay(e); // Fallback
  };
  const [value, setValue] = useState("");
  const [isBlocked, setBlock] = useState({ open: false, msg: "" });
  const [paymentData, setPaymentData] = useState({ data: {} })
  const [amount, setAmount] = useState(500);
  const [usdtWalletAddress, setUsdtWalletAddress] = useState('');
  const [activeTab, setActiveTab] = useState('INR'); // INR or USDT
  const USDT_TO_INR_RATE = 95;

  const handleAmount = (money) => (e) => {
    setAmount(money);
  };

  const getUSDTAmount = () => {
    return Math.ceil(amount / USDT_TO_INR_RATE);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset to default amount when switching tabs
    if (tab === 'INR') {
      setAmount(500);
    } else {
      setAmount(900); // Default for USDT tab (≈$10)
    }
  };

  const handleUSDAmount = (usdValue) => (e) => {
    setAmount(usdValue * USDT_TO_INR_RATE);
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
        setNotice({ open: true });
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
    history.goBack()
  }
  const payApp = (e, value) => {
    e.preventDefault();
    window.location.replace(value);
    setqrDialog({ open: false })


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
            if (result.error) {
              setLoader(false);
              console.log("User has closed the popup or there is some payment error, Check for Payment Status");
              console.log(result.error);
            }
            if (result.redirect) {
              setLoader(false);
              history.push("/rechargeHistory");
            }
            if (result.paymentDetails) {
              history.push("/rechargeHistory");

            }
          });
        });
    }
  };
  // const razropay = () => {
  //   setLoader(true)
  //   const AuthStr = "Bearer ".concat(user[0].token);
  //   fetch(`${URL}/razarpay/create-order/${user[0].id}`, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //       Authorization: AuthStr,
  //     },
  //     body:  JSON.stringify({
  //       amount,
  //     },)
  //   })
  //     .then(function (a) {
  //         return a.json();
  //       })
  //       .then(function (json) {
  //         setLoader(false)

  //       RazorpayOrderOptions = {
  //         key: "rzp_live_fJzOc7KpYoTdkk",
  //         amount: json.amount, // Amount in paise
  //         currency: "INR",
  //         name: "Gravity Technologies",
  //         description: "",
  //         order_id: json.id, // Generate order_id on server
  //         handler: function (response) {
  //           setLoader(true)
  //           fetch(`${URL}/razarpay/verify/${user[0].id}`, {
  //             method: 'POST',
  //             headers: {
  //               'Content-Type': 'application/json',
  //               Authorization: AuthStr,
  //             },
  //             body: JSON.stringify({
  //               razorpay_order_id: response.razorpay_order_id,
  //               razorpay_payment_id: response.razorpay_payment_id,
  //               razorpay_signature: response.razorpay_signature
  //             })
  //           }).then(res => res.json())
  //             .then(data => {
  //               setLoader(false)
  //               if (data === 'ok') {
  //                 history.push('/rechargeHistory');
  //               } else {
  //                 history.push('/rechargeHistory');
  //               }
  //             }).catch(error => {
  //               setLoader(false)
  //               console.error('Error:', error);
  //               alert('Error verifying payment');
  //             });
  //         },
  //         prefill: {


  //           contact: `${user[0].phone}`,
  //         },
  //         theme: {
  //           color: "#00b8a9",
  //         },
  //       };

  //       const razorpayInstance = new Razorpay(RazorpayOrderOptions);
  //       razorpayInstance.open();
  //     }).catch();

  // };

  const payLogic = (e) => {
    e.preventDefault();
    if (amount < 2000) {
      rushPay(e)
    } else {
      // if(gateway === "Cashfree")
      //   cashfreePg(e);

      // if(gateway === "Razorpay")
      //   razropay();

      // if(gateway === "Phonepe")
      //   phonePe(e)

      // if(gateway === "Paygic")
      rushPay(e)

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
          redirect_url: `${URL}/upiVerifyPayment/${user[0].id}`
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

  const rushPay = (e) => {
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
        body: "Minimum recharge is 1000, Maximum 1,00,000",
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
      fetch(`${URL}/rupeeRushCreateOrder/${user[0].id}`, {
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
          //console.log(json)
          // setValue({gpay: json['gpay'],phonepe: json['phonePe'],paytm: json['paytm'],bhim: json['intent']});
          // setqrDialog({open: true})
          window.location.replace(json['payment_url']);
          setLoader(false)
        });
    }

  };
  const watchPay = (e) => {
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
        body: "Minimum recharge is 1000, Maximum 1,00,000",
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
      fetch(`${URL}/watchPayCreateOrder/${user[0].id}`, {
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
          //console.log(json)
          // setValue({gpay: json['gpay'],phonepe: json['phonePe'],paytm: json['paytm'],bhim: json['intent']});
          // setqrDialog({open: true})
          window.location.replace(json['payment_url']);
          setLoader(false)
        });
    }

  };
  const lgPay = (e) => {
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
        body: "Minimum recharge is 1000, Maximum 1,00,000",
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
      fetch(`${URL}/lgPayCreateOrder/${user[0].id}`, {
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
          //console.log(json)
          // setValue({gpay: json['gpay'],phonepe: json['phonePe'],paytm: json['paytm'],bhim: json['intent']});
          // setqrDialog({open: true})
          window.location.replace(json['payment_url']);
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

  const usdtPayment = (e) => {
    e.preventDefault();

    const usdAmount = getUSDTAmount();

    if (usdAmount < 10 || usdAmount > 10000) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Minimum USDT payment is $10, Maximum $10,000",
      });
    } else {
      setLoader(true);
      const AuthStr = "Bearer ".concat(user[0].token);

      var pd = {
        amount: usdAmount,
        amountINR: amount,
        currency: 'USDT',
        customer_name: 'Customer',
        customer_email: "gravitytechnologies.online@gmail.com",
        customer_mobile: `${user[0].phone}`,
        userId: user[0].id,
        rate: USDT_TO_INR_RATE
      };

      fetch(`${URL}/createCryptoUpayOrder/${user[0].id}`, {
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

          setLoader(false);
        })
        .catch((error) => {
          console.error('USDT Payment Error:', error);
          setDialog({
            ...openDialog,
            open: true,
            body: "Failed to process USDT payment. Please try again.",
          });
          setLoader(false);
        });
    }
  };

  if (loader) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f7fa' }}>
        <CircularProgress style={{ color: '#05c0b8' }} />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {/* Header */}
      <div className={classes.header}>
        <IconButton onClick={goBack} style={{ color: 'white', padding: 8 }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography className={classes.headerTitle}>Deposit</Typography>
        <Link to="/rechargeHistory" className={classes.headerRight}>
          Deposit history
        </Link>
      </div>

      {/* Balance Card */}
      <div className={classes.balanceCard}>
        <div className={classes.balanceLabel}>
          <Box style={{ marginRight: 8, transform: 'rotate(-20deg)' }}>🎁</Box>
          Balance
        </div>
        <div className={classes.balanceValue}>
          ₹{user[0]?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          <Box className={classes.refreshIcon} onClick={() => window.location.reload()}>
            🔄
          </Box>
        </div>
        <Grid container alignItems="flex-end">
          <Grid item xs={6}>
            <Box className={classes.cardIcon}>💳</Box>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.cardNumber}>**** ****</div>
          </Grid>
        </Grid>
      </div>

      {/* Category Tabs */}
      <div className={classes.section}>
        <div className={classes.sectionTitle}>
          <Box style={{ marginRight: 8 }}>💳</Box>
          Select channel
        </div>
        <div className={classes.categoryGrid}>
          <div
            className={`${classes.categoryItem} ${paymentCategory === 'Online' ? 'selected' : ''}`}
            onClick={() => { setPaymentCategory('Online'); setAmount(300); setSelectedAmount(300); setSelectedChannel('Watch Pay'); }}
          >
            <span className={classes.catIcon}>📱</span>
            <Typography className={classes.catLabel}>Online Pay</Typography>
          </div>
          <div
            className={`${classes.categoryItem} ${paymentCategory === 'QR' ? 'selected' : ''}`}
            onClick={() => { setPaymentCategory('QR'); setAmount(300); setSelectedAmount(300); setSelectedChannel('Scan Pay'); }}
          >
            <span className={classes.catIcon}>📷</span>
            <Typography className={classes.catLabel}>QR Pay</Typography>
          </div>
          <div
            className={`${classes.categoryItem} ${paymentCategory === 'USDT' ? 'selected' : ''}`}
            onClick={() => { setPaymentCategory('USDT'); setAmount(900); setSelectedAmount(10); setSelectedChannel('Crypto Pay'); }}
          >
            <Box className={classes.bonusBadge}>+2%</Box>
            <span className={classes.catIcon}>🪙</span>
            <Typography className={classes.catLabel}>USDT</Typography>
          </div>
        </div>
      </div>

      {/* Channels Grid */}
      <div className={classes.section}>
        <div className={classes.channelGrid}>
          {channels[paymentCategory].map((ch) => (
            <div
              key={ch.name}
              className={`${classes.channelItem} ${selectedChannel === ch.name ? 'selected' : ''}`}
              onClick={() => setSelectedChannel(ch.name)}
            >
              <div className={classes.channelName}>{ch.name}</div>
              <div className={classes.channelRange}>Range: {ch.range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Amount Grid */}
      <div className={classes.section}>
        <div className={classes.sectionTitle}>
          <Box style={{ marginRight: 8 }}>💰</Box>
          Deposit amount
        </div>
        <div className={classes.amountGrid}>
          {currentAmounts.map((amt) => (
            <div
              key={amt}
              className={`${classes.amountItem} ${selectedAmount === amt ? 'selected' : ''}`}
              onClick={() => handleAmountSelect(amt)}
            >
              {paymentCategory === 'USDT' ? '$' : '₹'} {amt < 1000 ? amt : (amt / 1000) + 'K'}
            </div>
          ))}
        </div>

        {/* Manual Input */}
        <div className={classes.manualInput}>
          <Box style={{ marginRight: 12, fontWeight: 'bold', color: '#05c0b8', fontSize: '18px' }}>
            {paymentCategory === 'USDT' ? '$' : '₹'}
          </Box>
          <input
            className={classes.input}
            type="number"
            value={paymentCategory === 'USDT' ? selectedAmount : amount}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (paymentCategory === 'USDT') {
                setSelectedAmount(val);
                setAmount(val * USDT_TO_INR_RATE);
              } else {
                setAmount(val);
                setSelectedAmount(val);
              }
            }}
            placeholder="Enter amount"
          />
          <IconButton size="small" style={{ color: '#999' }} onClick={() => { setAmount(0); setSelectedAmount(0); }}>
            <Box>✕</Box>
          </IconButton>
        </div>
      </div>

      {/* Footer */}
      <div className={classes.footer}>
        <div className={classes.footerInfo}>
          <div>Recharge Method:</div>
          <div>{selectedChannel}</div>
        </div>
        <Button
          className={classes.depositBtn}
          onClick={handleDeposit}
        >
          Deposit {paymentCategory === 'USDT' ? `$${selectedAmount}` : `₹${amount}`}
        </Button>
      </div>

      <Dialog open={openDialog.open} onClose={dialogClose}>
        <Box p={3} className={classes.dialog}>
          <Typography variant="h6" color="secondary" gutterBottom>Error</Typography>
          <Typography variant="body1">{openDialog.body}</Typography>
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={dialogClose} color="primary">OK</Button>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
};

export default PlaceOrder3;
