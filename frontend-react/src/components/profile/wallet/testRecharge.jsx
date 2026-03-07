/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";

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
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper
  
} from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useHistory } from "react-router-dom";
import * as api from "../../../api/auth";
import { makeStyles } from "@material-ui/core/styles";
import { parse } from "querystring";
const useStyles = makeStyles({
  underline: {
    "&&&:before": {
      borderBottom: "none",
    },
    "&&:after": {
      borderBottom: "none",
    },
  },
});

const TestRecharge = () => {
  let { statusParms } = useParams();
  const formRef = useRef();
  const classes = useStyles();
  const URL = api.url;
  const history = useHistory();
  const [user, setUser] = useState([{ balance: 0.0 }]);
  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [loader, setLoader] = React.useState(false);
  const [isBlocked, setBlock] = useState({ open: false, msg: "" });
  const [detail, setDetail] = useState({ name: "", email: "" });
  const [level, setLevel] = React.useState('UPI');

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
        })
        .catch((error) => {
          console.log(error);
          history.push("/login");
        });
    } else {
      history.push("/login");
    }
  }, []);
  const [amount, setAmount] = useState(500);
  const handleAmount = (money) => (e) => {
    setAmount(money);
  };
  const handleChange = (e) => {
    setAmount(parseInt(e.target.value));
  };
  const handleLevel = (level) => async (event) => {
    setLevel(level);
  };
  const handleDetail = (e) => {
    setDetail({ ...detail, [e.target.name]: e.target.value });
  };
  const handleSubmit = () => {};
  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };
  const [radioValue, setRadioValue] = React.useState('Fast Payment');

  const handleRadio = (event) => {
    setRadioValue(event.target.value);
    // if(event.target.value === 'UPI'){
     
    // }else{

    // }

  };

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  const phonePe = () => {
    if (amount < 200 || amount > 200000) {
      setDialog({
          ...openDialog,
          open: true,
          body: "Minimum recharge is 200",
        });
    }else{
      setLoader(true);
      const AuthStr = "Bearer ".concat(user[0].token)
      fetch(`${URL}/initiatePhonePePG/${user[0].id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: AuthStr,
          
        },
        body: JSON.stringify({amount,userId: user[0].id,phone: user[0].phone}),
      })
        .then(function (a) {
          return a.json();
        }).then(function (json) {
          console.log(json);
          
          window.location.replace(json['url']);

          
        });

    }

    
    
   
    
  };

  const rojpaymentz = (e) => {
    e.preventDefault();
    if (amount < 200 || amount > 200000) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Minimum recharge is 200",
      });
    }else{
      setLoader(true);
      
      formRef.current && formRef.current.submit();

    }

        

      
     
  };


  const upi = () => {
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
    if (
      !detail.name ||
      detail.name.length < 2 ||
      !detail.email ||
      !detail.email.includes("@") ||
      detail.email.length < 5
    ) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Please enter valid name & email.",
      });
    } else {
      
      if (amount < 200 || amount > 200000) {
        // setsabpaisa({...sabpaisa, isOpen: true})
        setDialog({
          ...openDialog,
          open: true,
          body: "Minimum recharge is 200",
        });
      } else {
        //setDialog({ ...openDialog, open: true, body: 'Recharge is paused. We are on maintenance.'});
        setLoader(true);
        var pd = {
          amount: `${amount}`,
          p_info: product,
          customer_name: detail.name,
          customer_email: detail.email,
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
          }).then(function (json) {
          
            
          
            if(json['status'] === true){
              
              window.location.replace(json['data']['payment_url']);
            }
            
          });
        
      }
    }
  };

  // async function displayRazorpay() {
  //   // const res = await axios.post('http://localhost:5000https://pay.toddapple.live/placeOrder3/payumoney');
  //   // console.log(res);
  //   // window.document.write(res.data);
  //   setDialog({...openDialog, open: true, body: "We are updating our plateform. Functionality like recharge, withdrawal will be temporary paused. You can place bid and earn. We are sorry for any inconvenience caused. ThankYou !"})

  //   // if (amount < 200 || !amount) {
  //   //   setDialog({ ...openDialog, open: true, body: "Minimum recharge is 200" });
  //   // } else {
  //   //   setLoader(true);
  //   //   const res = await loadScript(
  //   //     "https://checkout.razorpay.com/v1/checkout.js"
  //   //   );

  //   //   if (!res) {
  //   //     alert("Razorpay SDK failed to load. Are you online?");
  //   //     return;
  //   //   }

  //   //   // creating a new order
  //   //   const result = await axios.post(`${api.url}/orders/${amount}`);

  //   //   if (!result) {
  //   //     alert("Server error. Are you online?");
  //   //     return;
  //   //   }

  //   //   // Getting the order details back
  //   //   const { id: order_id } = result.data;
  //   //   console.log(order_id);
  //   //   const options = {
        
        
  //   //     key: "rzp_live_QB8LgUUhKjHhSS", // Enter the Key ID generated from the Dashboard
  //   //     amount: amount.toString(),
  //   //     currency: "INR",
  //   //     name: "The Gooe",
  //   //     description: "Purchase Payment",
  //   //     order_id: order_id,
  //   //     prefill:
  //   //     {
  //   //       "email": detail.email,
  //   //       "contact": user[0].phone,
  //   //     },

  //   //     handler: async function (response) {
  //   //       // console.log(response.razorpay_payment_id);
  //   //       // console.log(response.razorpay_order_id);
  //   //       // console.log(response.razorpay_signature);
  //   //       const data = {
  //   //         orderCreationId: order_id,
  //   //         razorpayPaymentId: response.razorpay_payment_id,
  //   //         razorpayOrderId: response.razorpay_order_id,
  //   //         razorpaySignature: response.razorpay_signature,
  //   //         userId: user[0].id,
  //   //         firstRecharge: user[0].firstRecharge,
  //   //         userDate: user[0].date,
  //   //         amount: amount,
  //   //         upLine: user[0].upLine[0],
  //   //       };

  //   //       const result = await axios.post(`${api.url}https://pay.toddapple.live/placeOrder3Success`, data);
  //   //       setLoader(false);
  //   //       window.location.replace("/rechargeHistory");
  //   //     },
  //   //     // prefill: {
  //   //     //     name: "Soumya Dey",
  //   //     //     email: "SoumyaDey@example.com",
  //   //     //     contact: "9999999999",
  //   //     // },
  //   //     // notes: {
  //   //     //     address: "Soumya Dey Corporate Office",
  //   //     // },
  //   //     // theme: {
  //   //     //     color: "#61dafb",
  //   //     // },
  //   //   };
  //   //   setLoader(false);

  //   //   const paymentObject = new window.Razorpay(options);
  //   //   paymentObject.open();
  //   // }
  // }

  return (
    <div>
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
            backgroundColor: "black",
            opacity: "0.6",
            height: "100px",
            paddingTop: "10px",
          }}
        >
          <CircularProgress style={{ color: "white" }} />
          <Typography style={{ paddingTop: "10px", color: "white" }}>
            Please Wait!
          </Typography>
        </Container>
      </Dialog>
      <Dialog
        open={openDialog.open}
        onClose={dialogClose}
        PaperProps={{
          style: {
            // backgroundColor: 'transparent',
            boxShadow: "none",
          },
        }}
      >
        <Container
          style={
            {
              // backgroundColor: 'black', opacity: '0.6', height: '50px'
            }
          }
        >
          <Typography style={{ padding: "10px", color: "black" }}>
            {openDialog.body}
          </Typography>
        </Container>
      </Dialog>
      <Grid
        container
        direction="row"
        justify=""
        alignItems="center"
        style={{
          paddingLeft: "20px",
          paddingTop: "15px",
          paddingBottom: "15px",
          paddingRight: "20px",
          backgroundColor: "white",
        }}
      >
        <Grid item xs={4}>
          <Link to="../profile">
            <ArrowBackIosIcon style={{ fontSize: "20px", color: "black" }} />
          </Link>
        </Grid>
        <Grid item xs={4}>
          <Typography align="center" style={{ color: "black" }}>
            Pre Order
          </Typography>
        </Grid>
      </Grid>
      <Typography
        align="center"
        style={{ padding: "20px", fontSize: "19px", color: "#00b8a9" }}
      >
        My balance ₹ {user && user[0].balance}
      </Typography>
      {
      // <Grid container justify="space-evenly" direction="row" style={{ padding: "10px" }}>
      //     <Grid item xs={6} onClick={handleLevel('UPI')}>
      //       <Container
      //         style={{
      //           width: "100%",
      //           height: "30px",
      //           border: "1px solid",
      //           borderColor: "#05c0b8",
      //           backgroundColor: level === 'UPI' ? "#05c0b8" : "white",
      //         }}
      //       >
      //         <Typography
      //           align="center"
      //           style={{
      //             fontSize: '15px',
      //             color: level === 'UPI'? "white" : "black",
      //             paddingTop: "3px",
      //           }}
      //         >
      //           UPI
      //         </Typography>
      //       </Container>
      //     </Grid>
      //     <Grid item xs={6} onClick={handleLevel('phonepe')}>
      //       <Container
      //         style={{
      //           width: "100%",
      //           height: "30px",
      //           border: "1px solid",
      //           borderColor: "#05c0b8",
      //           backgroundColor: level === 'phonepe' ? "#05c0b8" : "white",
      //         }}
      //       >
      //         <Typography
      //           align="center"
      //           style={{
      //             fontSize: '15px',
      //             color: level === 'phonepe' ? "white" : "black",
      //             paddingTop: "3px",
      //           }}
      //         >
      //            Fast Card
      //         </Typography>
      //       </Container>
      //     </Grid>
          
      //   </Grid>
      // {
        radioValue === 'UPI' ?
        <div>
<Container style={{ padding: "20px" }}>
        <FormControl fullWidth variant="filled" InputProps={{ classes }}>
          <InputLabel InputProps={{ classes }}>Enter your name</InputLabel>
          <FilledInput
            InputProps={{ classes }}
            fullWidth="true"
            name="name"
            id="filled"
            onChange={handleDetail}
            style={{ backgroundColor: "white", textUnderlineOffset: "none" }}
          />
        </FormControl>
      </Container>
      <Container style={{ padding: "20px" }}>
        <FormControl fullWidth variant="filled" InputProps={{ classes }}>
          <InputLabel InputProps={{ classes }}>Enter your email</InputLabel>
          <FilledInput
            InputProps={{ classes }}
            fullWidth="true"
            name="email"
            type="email"
            id="filled"
            onChange={handleDetail}
            style={{ backgroundColor: "white", textUnderlineOffset: "none" }}
          />
        </FormControl>
      </Container>
        </div>:<div></div>
      
       
       }
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="center"
        style={{ padding: "20px" }}
      >
        <Grid item>
          <Typography
            style={{
              fontWeight: "bold",
              paddingRight: "15px",
              paddingTop: "15px",
            }}
          >
            ₹
          </Typography>
        </Grid>
        <Grid item>
          <FormControl fullWidth variant="filled">
            <InputLabel></InputLabel>
            <FilledInput
              value={amount}
              type="number"
              fullWidth="true"
              name="amount"
              id="filled"
              onChange={handleChange}
              style={{
                backgroundColor: "#fafafa",
                textUnderlineOffset: "none",
              }}
            />
          </FormControl>
        </Grid>
      </Grid>

      <Grid
        spacing={1}
        container
        direction="row"
        justify="space-evenly"
        alignItems="center"
        style={{ padding: "15px" }}
      >
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: amount === 200 ? "#D8D8D8" : "white",
              width: "100%",
              height: "50px",
              fontSize: "15px",
              fontWeight: amount === 200 ? "bold" : "normal",
              border: "1px solid",
              borderColor: "#D8D8D8",
            }}
            onClick={handleAmount(200)}
          >
            ₹200
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: amount === 500 ? "#D8D8D8" : "white",
              width: "100%",
              height: "50px",
              fontSize: "15px",
              fontWeight: amount === 500 ? "bold" : "normal",
              border: "1px solid",
              borderColor: "#D8D8D8",
            }}
            onClick={handleAmount(500)}
          >
            ₹500
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: amount === 1000 ? "#D8D8D8" : "white",
              width: "100%",
              height: "50px",
              fontSize: "15px",
              fontWeight: amount === 1000 ? "bold" : "normal",
              border: "1px solid",
              borderColor: "#D8D8D8",
            }}
            onClick={handleAmount(1000)}
          >
            ₹1000
          </Button>
        </Grid>
      </Grid>
      <Grid
        spacing={1}
        container
        direction="row"
        justify="space-evenly"
        alignItems="center"
        style={{ padding: "15px", paddingTop: "0px" }}
      >
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: amount === 5000 ? "#D8D8D8" : "white",
              width: "100%",
              height: "50px",
              border: "1px solid",
              fontSize: "15px",
              fontWeight: amount === 5000 ? "bold" : "normal",
              borderColor: "#D8D8D8",
            }}
            onClick={handleAmount(5000)}
          >
            ₹5000
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: amount === 10000 ? "#D8D8D8" : "white",
              width: "100%",
              height: "50px",
              fontSize: "15px",
              fontWeight: amount === 10000 ? "bold" : "normal",
              border: "1px solid",
              borderColor: "#D8D8D8",
            }}
            onClick={handleAmount(10000)}
          >
            ₹10000
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: amount === 20000 ? "#D8D8D8" : "white",
              width: "100%",
              height: "50px",
              fontSize: "15px",
              fontWeight: amount === 20000 ? "bold" : "normal",
              border: "1px solid",
              borderColor: "#D8D8D8",
            }}
            onClick={handleAmount(20000)}
          >
            ₹20000
          </Button>
        </Grid>
      </Grid>

      {/* <form
        ref={formRef}
        onSubmit={(e) => payumoney(e)}
        //action="https://servider.in"
        action="https://merchant.upigateway.com/api/create_order"
        method="post"
      >
        <input type="hidden" name="key" value={paymentData.key} />
        <input type="hidden" name="client_txn_id" value={paymentData.client_txn_id} />
        <input type="hidden" name="amount" value={paymentData.amount} />
        <input type="hidden" name="p_info" value={paymentData.p_info} />
        <input type="hidden" name="customer_name" value={paymentData.customer_name} />
        <input type="hidden" name="customer_email" value={paymentData.customer_email} />
        <input type="hidden" name="customer_mobile" value={paymentData.customer_mobile} />
        <input type="hidden" name="redirect_url" value={paymentData.redirect_url} /> */}
         
      
      {/* <form action='https://thegooe.epizy.com/recharge' method="get"> */}
      <FormControl>
      
      <RadioGroup
        row
        
        aria-labelledby="demo-row-radio-buttons-group-label"
        name="row-radio-buttons-group"
        value={radioValue}
        onChange={handleRadio}
        
      >
        <FormControlLabel style={{paddingLeft: '20px',paddingRight: '10px'}} value="Fast Payment" control={<Radio />} label="Fast Payment" />
        <FormControlLabel value="UPI" control={<Radio />} label="UPI" />
        
        
      </RadioGroup>
    </FormControl>
      <Paper
        style={{
          backgroundColor: "#00b8a9",
          height: "50px",
         
          margin: '20px'
        }}
        //onClick={phonePe}
        onClick={radioValue === 'UPI' ? upi :phonePe}
      >
        <Typography align="center">
          <Button
            type="submit"
            style={{
              paddingTop: "12px",
              color: "white",
              textTransform: "none",
            }}
          >
            Submit
          </Button>
        </Typography>
      </Paper>
      <form
        ref={formRef}
        onSubmit={(e) => rojpaymentz(e)}
        //action="https://servider.in"
        action={`${URL}/rojpgSubmit`}
        method="get"
      >
        <input type="hidden" name="id" value={user[0].id} />
        <input type="hidden" name="token" value={user[0].token} />
        <input type="hidden" name="email" value='gs74340@gmail.com' />
        <input type="hidden" name="phone" value={user[0].phone} />
        <input type="hidden" name="amount" value={amount} />

        {/* <form action='https://thegooe.epizy.com/recharge' method="get"> */}
        <Container
          style={{
            backgroundColor: "#e85195",
            height: "50px",
            width: "250px",
            borderRadius: "20px",
          }}
          //onClick={payumoney}
        >
          <Typography align="center">
            <Button
              type="submit"
              style={{
                paddingTop: "12px",
                color: "white",
                textTransform: "none",
              }}
            >
              Proceed to ADD MONEY
            </Button>
          </Typography>
        </Container>
      </form>
      <Link
        to="/rechargeHistory"
        style={{ textDecoration: "none", color: "black" }}
      >
        <Paper
          style={{
            backgroundColor: "grey",
            
            height: "50px",
            
            marginLeft: '20px',
            marginRight: '20px',
            marginBottom: '100px'
          }}
        >
          <Typography align="center">
            <Button
              type="submit"
              style={{
                paddingTop: "12px",
                color: "white",
                textTransform: "none",
              }}
            >
              Historical Records
            </Button>
          </Typography>
        </Paper>
      </Link>
      {/* {
        (sabpaisa.clientCode && sabpaisa.callbackUrl && sabpaisa.transUserPassword && sabpaisa.transUserName && sabpaisa.authkey
        && sabpaisa.authiv) && sabpaisa.isOpen &&
                <PaymentInitModal clientCode={sabpaisa.clientCode}
        transUserPassword={sabpaisa.transUserPassword} transUserName={sabpaisa.transUserName} firstName={detail.name} lstName={detail.name} Email={detail.email} contactNo={user[0].phone}
        callbackUrl={sabpaisa.callbackUrl} amount={'200'} isOpen={sabpaisa.isOpen} authkey={sabpaisa.authkey} authiv={sabpaisa.authiv}
        label={"testing"} />
        } */}
    </div>
  );
};

export default TestRecharge;

// const worldLine = (e) => {
//   e.preventDefault();
//   var product = "Men Cloth Purchase";
//   if (amount === 200) product = "Night Lower";
//   if (amount === 1000) product = "Lower tshirt";
//   if (amount === 2000) product = "Track Suite";
//   if (amount >= 5000) product = "Bulk Men Cloth ";

//   //Create a Data object that is to be passed to LAUNCH method of Bolt
//   if (
//     !detail.name ||
//     detail.name.length < 2 ||
//     !detail.email ||
//     !detail.email.includes("@") ||
//     detail.email.length < 5
//   ) {
//     setDialog({
//       ...openDialog,
//       open: true,
//       body: "Please enter valid name & email.",
//     });
//   } else {
//     if (amount < 200 || amount > 200000) {
//       setDialog({
//         ...openDialog,
//         open: true,
//         body: "Minimum recharge is 200",
//       });
//     } else {
//       //setDialog({ ...openDialog, open: true, body: 'Recharge is paused. We are on maintenance.'});
//       var pd = {
//         txnid: "",
//         amount: amount,
//         firstname: detail.name,
//         email: detail.email,
//         phone: user[0].phone,
//         productinfo: product,
//         surl: `${URL}https://pay.toddapple.live/placeOrder3/payumoney/response/${user[0].id}`,
//         hash: "",
//       };

//       //Data to be Sent to API to generate hash.
//       let data = {
//         email: pd.email,
//         amount: pd.amount,
//         phone: pd.phone,
//         userId: user[0].id,
//       };

//       //API call to get the Hash value
//       fetch(`${URL}https://pay.toddapple.live/placeOrder3/worldLine`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       })
//         .then(function (a) {
//           return a.json();
//         })
//         .then(function (json) {
//           pd.hash = json["hash"];
//           pd.txnid = json["txnId"];
//           console.log(pd.hash);
//           console.log(pd.txnid);

//           var handleResponse = () => {

//           }

//           var configJson = {
//             'tarCall': false,
//             'features': {
//                 'showPGResponseMsg': true,
//                 'enableAbortResponse': true,
//                 'enableExpressPay': true,
//                 'enableNewWindowFlow': false    //for hybrid applications please disable this by passing false
//             },
//             'consumerData': {
//                 'deviceId': 'WEBSH1',	//possible values 'WEBSH1' or 'WEBSH2'
//                 'token': pd.hash,
//                 'returnUrl': pd.surl,    //merchant response page URL
//                 'responseHandler': handleResponse,
//                 'paymentMode': 'all',
//                 'merchantLogoUrl': 'https://www.paynimo.com/CompanyDocs/company-logo-vertical-light.png',  //provided merchant logo will be displayed
//                 'merchantId': 'T717260',
//                 'currency': 'INR',
//                 'consumerId': `${user[0].id}`,
//                 'consumerMobileNo': `${user[0].phone}`,
//                 'consumerEmailId': pd.email,
//                 'txnId': pd.txnid,   //Unique merchant transaction ID
//                 'items': [{
//                     'itemId': 'test',
//                     'amount': '10',
//                     'comAmt': '0'
//                 }],
//                 'customStyle': {
//                     'PRIMARY_COLOR_CODE': '#45beaa',   //merchant primary color code
//                     'SECONDARY_COLOR_CODE': '#FFFFFF',   //provide merchant's suitable color code
//                     'BUTTON_COLOR_CODE_1': '#2d8c8c',   //merchant's button background color code
//                     'BUTTON_COLOR_CODE_2': '#FFFFFF'   //provide merchant's suitable color code for button text
//                 }
//             }
//         };

//         window.pnCheckout(configJson);
//         // if(configJson.features.enableNewWindowFlow){
//         //     pnCheckoutShared.openNewWindow();
//         // }

//           // setPayment({
//           //   ...paymentData,
//           //   key: pd.key,
//           //   txnid: pd.txnid,
//           //   amount: pd.amount,
//           //   firstname: pd.firstname,
//           //   email: pd.email,
//           //   phone: pd.phone,
//           //   productinfo: pd.productinfo,
//           //   hash: pd.hash,
//           //   surl: pd.surl,
//           //   furl: pd.furl,
//           // });

//         //   if (paymentData.hash.length !== 0) {
//         //     setLoader(true);
//         //     formRef.current && formRef.current.submit();
//         //   }
//         });
//     }
//   }
// };

// useEffect(() => {
//   if (statusParms === "success") {
//     history.push("/rechargeHistory");
//   }
// }, []);

// const asanPay = (e) => {
//   e.preventDefault();
//   var product = "Men Cloth Purchase";
//   if (amount === 200) product = "Night Lower";
//   if (amount === 1000) product = "Lower tshirt";
//   if (amount === 2000) product = "Track Suite";
//   if (amount >= 5000) product = "Bulk Men Cloth ";

//   if (
//         !detail.name ||
//         detail.name.length < 2 ||
//         !detail.email ||
//         !detail.email.includes("@") ||
//         detail.email.length < 5
//       ) {
//         setDialog({
//           ...openDialog,
//           open: true,
//           body: "Please enter valid name & email.",
//         });
//       }else{

//         if (amount < 200 || amount > 200000) {
//                 setDialog({
//                   ...openDialog,
//                   open: true,
//                   body: "Minimum recharge is 200",
//                 });
//               } else {

//       //Data to be Sent to API to generate hash.
//       var pd = {
//             AMOUNT: `${amount * 100}`,
//             APP_ID: '6206220225081120',
//             CURRENCY_CODE: '356',
//             CUST_EMAIL: detail.email,
//             CUST_NAME: detail.name,
//             CUST_PHONE: `${user[0].phone}`,
//             ORDER_ID: "123456",
//             PRODUCT_DESC: product,
//             RETURN_URL: `${URL}/asanPayResponse`,
//             TXNTYPE: 'SALE',
//             HASH: "",
//           };

//       //API call to get the Hash value
//       fetch(`${URL}https://pay.toddapple.live/placeOrder3/asanPay`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(pd),
//       })
//         .then(function (a) {
//           return a.json();
//         })
//         .then(function (json) {
//           pd.HASH = json["HASH"];
//           // pd.ORDER_ID = json["ORDER_ID"];
//           console.log(pd.HASH);

//           setAsanData({
//             ...asanData,
//             AMOUNT: amount * 100,
//             APP_ID: '6206220225081120',
//             CURRENCY_CODE: 356,
//             CUST_EMAIL: detail.email,
//             CUST_NAME: detail.name,
//             CUST_PHONE: `${user[0].phone}`,
//             ORDER_ID: "98765432108642",
//             PRODUCT_DESC: product,
//             RETURN_URL: `${URL}/asanPayResponse`,
//             TXNTYPE: 'SALE',
//             HASH: pd.HASH
//           });
//           console.log(asanData);
//           if(asanData.HASH.length !== 0){
//             console.log('done populating')
//             // setLoader(true);
//             // formRef.current && formRef.current.submit();
//           }

//         });

//               }

//       }

// }

//   function collectRequestData(request, callback) {
//     const FORM_URLENCODED = 'application/x-www-form-urlencoded';
//     if (request.headers['content-type'] === FORM_URLENCODED) {
//         let body = '';
//         request.on('data', chunk => {
//             body += chunk.toString();
//         });
//         request.on('end', () => {
//             callback(parse(body));
//         });
//     } else {
//         callback(null);
//     }
// }

// const payumoney = (e) => {
//   e.preventDefault();
//   var product = "Men Cloth Purchase";
//   if (amount === 200) product = "Night Lower";
//   if (amount === 1000) product = "Lower tshirt";
//   if (amount === 2000) product = "Track Suite";
//   if (amount >= 5000) product = "Bulk Men Cloth ";

//   //Create a Data object that is to be passed to LAUNCH method of Bolt
//   if (
//     !detail.name ||
//     detail.name.length < 2 ||
//     !detail.email ||
//     !detail.email.includes("@") ||
//     detail.email.length < 5
//   ) {
//     setDialog({
//       ...openDialog,
//       open: true,
//       body: "Please enter valid name & email.",
//     });
//   } else {
//     if (amount < 200 || amount > 200000) {
//       setDialog({
//         ...openDialog,
//         open: true,
//         body: "Minimum recharge is 200",
//       });
//     } else {
//       //setDialog({ ...openDialog, open: true, body: 'Recharge is paused. We are on maintenance.'});
//       var pd = {
//         txnid: "",
//         key: "bKuywh",
//         amount: amount,
//         firstname: detail.name,
//         email: detail.email,
//         phone: user[0].phone,
//         productinfo: product,
//         surl: `${URL}https://pay.toddapple.live/placeOrder3/payumoney/response/${user[0].id}`,
//         furl: `${URL}https://pay.toddapple.live/placeOrder3/fail`,
//         hash: "",
//       };

//       //Data to be Sent to API to generate hash.
//       let data = {
//         email: pd.email,
//         amount: pd.amount,
//         productinfo: pd.productinfo,
//         firstname: pd.firstname,
//       };

//       //API call to get the Hash value
//       fetch(`${URL}https://pay.toddapple.live/placeOrder3/payumoney`, {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       })
//         .then(function (a) {
//           return a.json();
//         })
//         .then(function (json) {
//           pd.hash = json["hash"];
//           pd.txnid = json["txnid"];
//           setPayment({
//             ...paymentData,
//             key: pd.key,
//             txnid: pd.txnid,
//             amount: pd.amount,
//             firstname: pd.firstname,
//             email: pd.email,
//             phone: pd.phone,
//             productinfo: pd.productinfo,
//             hash: pd.hash,
//             surl: pd.surl,
//             furl: pd.furl,
//           });

//           if (paymentData.hash.length !== 0) {
//             setLoader(true);
//             formRef.current && formRef.current.submit();
//           }
//         });
//     }
//   }
// };

// const upiPayMethod = (e) => {
//   e.preventDefault();
//   var product = "Men Cloth Purchase";
//   if (amount === 200) product = "Night Lower";
//   if (amount === 1000) product = "Lower tshirt";
//   if (amount === 2000) product = "Track Suite";
//   if (amount >= 5000) product = "Bulk Men Cloth ";

//   if (
//     !detail.name ||
//     detail.name.length < 2 ||
//     !detail.email ||
//     !detail.email.includes("@") ||
//     detail.email.length < 5
//   ) {
//     setDialog({
//       ...openDialog,
//       open: true,
//       body: "Please enter valid name & email.",
//     });
//   } else {
//     if (amount < 200 || amount > 200000) {
//       setDialog({
//         ...openDialog,
//         open: true,
//         body: "Minimum recharge is 200",
//       });
//     } else {
//       const txnId = crypto.randomBytes(16).toString("hex");
//       setupiPay({

//         mid: "0142194534617",
//         orderId: '123456678',
//         email: detail.email,
//         amount: '10',
//         purpose: product,
//       });
//       console.log(upiPay);
//       if (upiPay.mid.length !== 0) {
//                     // setLoader(true);
//                     formRef.current && formRef.current.submit();
//                   }

//     }
//   }

// }

// const cashfree = () => {
//   var product = "Mens Cloth Purchase";
//   if (amount === 200) product = "Night Lower";
//   if (amount === 1000) product = "Lower tshirt";
//   if (amount === 2000) product = "Track Suite";
//   if (amount >= 5000) product = "Bulk Mens Cloth ";

//   //Create a Data object that is to be passed to LAUNCH method of Bolt
//   if (
//     !detail.name ||
//     detail.name.length < 2 ||
//     !detail.email ||
//     !detail.email.includes("@") ||
//     detail.email.length < 5
//   ) {
//     setDialog({
//       ...openDialog,
//       open: true,
//       body: "Please enter valid name & email.",
//     });
//   } else {
//     if (amount < 200 || amount > 200000) {
//       setDialog({
//         ...openDialog,
//         open: true,
//         body: "Minimum recharge is 200",
//       });
//     } else {
//       setDialog({
//         ...openDialog,
//         open: true,
//         body: "Recharge is paused. We are on maintenance.",
//       });

//       // // Data to be Sent to API to generate hash.
//       // let data = {
//       //     'email': detail.email,
//       //     'amount': amount,
//       //     'returnUrl':`https://server.toddapple.livehttps://pay.toddapple.live/placeOrder3/return/${user[0].id}`,
//       //     'name': detail.name,
//       //     'phone':user[0].phone,
//       //     'orderNote':product
//       // }
//       // fetch(`${URL}https://pay.toddapple.live/placeOrder3/cashfree`, {
//       //     method: 'POST',
//       //     headers: {
//       //         'Accept': 'application/json',
//       //         'Content-Type': 'application/json'
//       //     },
//       //     body: JSON.stringify(data)
//       // })
//       // .then(function (a) {
//       //     return a.json();

//       // })
//       // .then(function (json) {
//       //   var furl = 'https://www.cashfree.com/checkout/post/submit';
//       //   if(furl){
//       //     var form = document.createElement("form");
//       //     form.setAttribute("method", "post");
//       //     form.setAttribute("name", "frm1");
//       //     form.setAttribute("action", furl);
//       //     var dataPost = json.request;
//       //     for(const key in dataPost){
//       //       var input = document.createElement('input');
//       //       input.setAttribute('type', 'hidden');
//       //       input.setAttribute('value', dataPost[key]);
//       //       input.setAttribute('name', key);
//       //       form.appendChild(input);
//       //     }
//       //     document.body.appendChild(form);
//       //     setTimeout(() => {
//       //       form.submit();
//       //     }, 2000);

//       //   }

//       // });
//     }
//   }
// };
