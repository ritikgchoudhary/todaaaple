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
  Paper,
  TextField,
  List,
  ListItem,
  DialogContent,
  ImageListItem,
  ImageList
} from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import UPI from "../../../assets/images/upi.png";
import Paytm from "../../../assets/images/paytm.png";
import Gpay from "../../../assets/images/gpay.png";
import Bhim from "../../../assets/images/bhim.jpeg";
import WhatsApp from "../../../assets/images/whatsapp.png";
import * as api from "../../../api/auth";
import Phonepe from "../../../assets/images/phonepe.png";
import utr1 from "../../../assets/images/utr1.png";
import utr2 from "../../../assets/images/utr2.png";
import utr3 from "../../../assets/images/utr3.png";

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

const Recharge = () => {
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
          setGateway(response.data.gateway);
          setAutoLimit(response.data.limit);
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
    setUTR(parseInt(e.target.value));
  };

  const handleChange = (e) => {
    setAmount(parseInt(e.target.value));
    if (gateway === "auto" && autoLimit.auto) {
      if (e.target.value > autoLimit.value) {
        setAmount(autoLimit.value);
      }
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
    if (level + 1 === 2) {
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

  return (
    <div style={{ backgroundColor: "#fafafa" }}>
       <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        
      >
       
        <DialogContent>
        <Typography align="center" style={{ fontSize: '20px',fontWeight: 'bold',paddingBottom: '20px'}}>Payment UTR</Typography>
        <img style={{ paddingLeft: '15px'}} src={utr1} alt="mines"/>
        <img style={{ paddingLeft: '15px'}} src={utr2} alt="mines"/>
        <img style={{ paddingLeft: '15px'}} src={utr3} alt="mines"/>
          <Typography align="left" style={{ fontSize: '16px',fontWeight: 'bold',paddingBottom: '20px',paddingTop: '20px'}}>Copy UPI ID </Typography>
          <Typography align="left" style={{ fontSize: '15px',paddingBottom: '20px'}}>Open any UPI app on your phone. Pay to upi ID you just copied. After paymont copy utr and submit here.</Typography>
           </DialogContent>
        {/* <DialogActions>
          <Button onClick={ruleClose} color="primary" >
            OK
          </Button>
         
        </DialogActions> */}
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
          <ArrowBackIosIcon
            onClick={history.goBack}
            style={{ fontSize: "20px", color: "black" }}
          />
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
        My balance ₹ {user && user[0].balance.toFixed(2)}
      </Typography>
      {level === 1 || level === 2 ? (
        <Container
          disableGutters="true"
          style={{ width: "50px", backgroundColor: "black" }}
          onClick={(e) => handleBack(e)}
        >
          <Typography
            align="center"
            style={{ fontSize: "12px", color: "white" }}
          >
            Back
          </Typography>
        </Container>
      ) : (
        <div></div>
      )}

      {level === 0 ? (
        gateway === "auto" ? (
          autoLimit.auto ? (
            <div>
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
                      backgroundColor: amount === 800 ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      fontSize: "15px",
                      fontWeight: amount === 800 ? "bold" : "normal",
                      border: "1px solid",
                      borderColor: "#D8D8D8",
                    }}
                    onClick={handleAmount(800)}
                  >
                    ₹800
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
                      backgroundColor: amount === 1000 ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      border: "1px solid",
                      fontSize: "15px",
                      fontWeight: amount === 1000 ? "bold" : "normal",
                      borderColor: "#D8D8D8",
                    }}
                    onClick={handleAmount(1000)}
                  >
                    ₹1000
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    style={{
                      backgroundColor: amount === 1500 ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      fontSize: "15px",
                      fontWeight: amount === 1500 ? "bold" : "normal",
                      border: "1px solid",
                      borderColor: "#D8D8D8",
                    }}
                    onClick={handleAmount(1500)}
                  >
                    ₹1500
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    style={{
                      backgroundColor:
                        amount === autoLimit.value ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      fontSize: "15px",
                      fontWeight:
                        amount === autoLimit.value ? "bold" : "normal",
                      border: "1px solid",
                      borderColor: "#D8D8D8",
                    }}
                    onClick={handleAmount(autoLimit.value)}
                  >
                    ₹{autoLimit.value}
                  </Button>
                </Grid>
              </Grid>
              <Typography
                align="center"
                style={{ fontSize: "11px", padding: "20px" }}
              >
                For recharge amount greater than {autoLimit.value} do recharge
                with multiple transaction. For ex. - {autoLimit.value * 5}{" "}
                recharge ? Do {autoLimit.value} x 5 payments
              </Typography>
              <Typography
                align="center"
                style={{
                  fontSize: "11px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  paddingBottom: "20px",
                }}
              >
                {autoLimit.value} से अधिक राशि के रिचार्ज के लिए एकाधिक लेनदेन
                के साथ रिचार्ज करें। For ex. - {autoLimit.value * 5} का रिचार्ज?{" "}
                {autoLimit.value} x 5 भुगतान करें
              </Typography>
            </div>
          ) : (
            <div>
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
                      backgroundColor: amount === 2000 ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      fontSize: "15px",
                      fontWeight: amount === 2000 ? "bold" : "normal",
                      border: "1px solid",
                      borderColor: "#D8D8D8",
                    }}
                    onClick={handleAmount(2000)}
                  >
                    ₹2000
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    style={{
                      backgroundColor: amount === 5000 ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      fontSize: "15px",
                      fontWeight: amount === 5000 ? "bold" : "normal",
                      border: "1px solid",
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
                      backgroundColor: amount === 8000 ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      fontSize: "15px",
                      fontWeight: amount === 8000 ? "bold" : "normal",
                      border: "1px solid",
                      borderColor: "#D8D8D8",
                    }}
                    onClick={handleAmount(8000)}
                  >
                    ₹8000
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
                      backgroundColor: amount === 10000 ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      border: "1px solid",
                      fontSize: "15px",
                      fontWeight: amount === 10000 ? "bold" : "normal",
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
                      backgroundColor: amount === 15000 ? "#D8D8D8" : "white",
                      width: "100%",
                      height: "50px",
                      fontSize: "15px",
                      fontWeight: amount === 15000 ? "bold" : "normal",
                      border: "1px solid",
                      borderColor: "#D8D8D8",
                    }}
                    onClick={handleAmount(15000)}
                  >
                    ₹15000
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
            </div>
          )
        ) : (
          <div>
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
              <Grid item xs={4}>
                <Button
                  style={{
                    backgroundColor: amount === 5000 ? "#D8D8D8" : "white",
                    width: "100%",
                    height: "50px",
                    fontSize: "15px",
                    fontWeight: amount === 5000 ? "bold" : "normal",
                    border: "1px solid",
                    borderColor: "#D8D8D8",
                  }}
                  onClick={handleAmount(5000)}
                >
                  ₹5000
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
                    backgroundColor: amount === 8000 ? "#D8D8D8" : "white",
                    width: "100%",
                    height: "50px",
                    border: "1px solid",
                    fontSize: "15px",
                    fontWeight: amount === 8000 ? "bold" : "normal",
                    borderColor: "#D8D8D8",
                  }}
                  onClick={handleAmount(8000)}
                >
                  ₹8000
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
              <Grid item xs={4}>
                <Button
                  style={{
                    backgroundColor: amount === 30000 ? "#D8D8D8" : "white",
                    width: "100%",
                    height: "50px",
                    fontSize: "15px",
                    fontWeight: amount === 30000 ? "bold" : "normal",
                    border: "1px solid",
                    borderColor: "#D8D8D8",
                  }}
                  onClick={handleAmount(30000)}
                >
                  ₹30000
                </Button>
              </Grid>
            </Grid>
          </div>
        )
      ) : (
        <div></div>
      )}
      {level === 1 ? (
        <div>
          <Paper style={{ margin: "20px", padding: "10px" }}>
            <Grid container direction="row" style={{ padding: "10px" }}>
              <Grid item xs={4} onClick={(e) => selectUPI(e, 0)}>
                <Container
                  style={{
                    width: "100%",
                    height: "30px",
                    border: "1px solid",
                    borderColor: "#05c0b8",
                    backgroundColor: upiSelected === 0 ? "#05c0b8" : "white",
                  }}
                >
                  <Typography
                    align="center"
                    style={{
                      color: upiSelected === 0 ? "white" : "black",
                      paddingTop: "3px",
                    }}
                  >
                    UPI 1
                  </Typography>
                </Container>
              </Grid>
              <Grid item xs={4} onClick={(e) => selectUPI(e, 1)}>
                <Container
                  style={{
                    width: "100%",
                    height: "30px",
                    border: "1px solid",
                    borderColor: "#05c0b8",
                    backgroundColor: upiSelected === 1 ? "#05c0b8" : "white",
                  }}
                >
                  <Typography
                    align="center"
                    style={{
                      color: upiSelected === 1 ? "white" : "black",
                      paddingTop: "3px",
                    }}
                  >
                    UPI 2
                  </Typography>
                </Container>
              </Grid>
              <Grid item xs={4} onClick={(e) => selectUPI(e, 2)}>
                <Container
                  style={{
                    width: "100%",
                    height: "30px",
                    border: "1px solid",
                    borderColor: "#05c0b8",
                    backgroundColor: upiSelected === 2 ? "#05c0b8" : "white",
                  }}
                >
                  <Typography
                    align="center"
                    style={{
                      color: upiSelected === 2 ? "white" : "black",
                      paddingTop: "3px",
                    }}
                  >
                    UPI 3
                  </Typography>
                </Container>
              </Grid>
            </Grid>
            <Typography
              align="center"
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              Pay to this UPI👇
            </Typography>
            <Typography align="center">
            <Grid
              container
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={9}>
                <Paper style={{ backgroundColor: "#05c0b8", margin: "5px" }}>
                  <Typography
                    align="center"
                    style={{
                      color: "white",
                      fontSize: "15px",
                      fontWeight: "bold",
                      padding: "5px",
                    }}
                  >
                    {upis && upis[upiSelected] && upis[upiSelected].upi}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  style={{
                    color: "green",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                  onClick={(e) => copy(e, upis[upiSelected].upi)}
                >
                  Copy
                </Typography>
              </Grid>
            </Grid>
            </Typography>
            <Typography
              align="center"
              style={{ fontSize: "12px", fontWeight: "bold" }}
            >
              Amount: ₹{amount}
            </Typography>
            <Container style={{ paddingTop: "10px", marginTop: "10px" }}>
              <Typography
                variant="h6"
                align="center"
                style={{ paddingTop: "10px", fontSize: "14px" }}
              >
                Pay Through
              </Typography>
              {/* <a href="upi://"> */}
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item>
                  <img src={Paytm} alt="paytm" style={{ height: "45px" }} />
                </Grid>
                <Grid item>
                  <img src={Phonepe} alt="" style={{ height: "45px" }} />
                </Grid>
                <Grid item>
                  <img src={Gpay} alt="" style={{ height: "45px" }} />
                </Grid>
                <Grid item>
                  <img src={Bhim} alt="" style={{ height: "45px" }} />
                </Grid>
              </Grid>
              {/* </a> */}
            </Container>

            <Paper style={{ marginLeft: "20px", marginRight: "20px", marginTop: '10px'}}>
            <TextField
              type="number"
              id="outlined-basic"
              fullWidth
              label="UTR"
              variant="outlined"
              onChange={handleUTR}
            />
          </Paper>
          <Container style={{height: '20px'}}></Container>
            <a
              href="https://wa.me/+917610798677/?text=Payment_Issue"
              style={{ textDecoration: "none", color: "black" }}
            >
             
              <Grid container direction="row" alignItems="center" justifyContent="center">
                    {" "}
                    <Grid item>
                      <Typography align="center" style={{fontSize: '12px'}}>For payment related issues click here</Typography>
                    </Grid>
                    <Grid>
                      <img src={WhatsApp} height={25} style={{paddingLeft: '10px'}}/>
                    </Grid>
                  </Grid>
            </a>
            <Typography align="center"><Button
                onClick={openRule}
                style={{
                  
                  color: "black",
                  textTransform: "none",
                }}
              >How To Pay ?
                </Button></Typography>
            
          
          </Paper>
        </div>
      ) : (
        <div></div>
      )}
      {level === 2 ? (
        <div>
          <Paper
            style={{
              margin: "20px",
              padding: "20px",
              backgroundColor: "green",
            }}
          >
            {" "}
            <a
              href="https://wa.me/+917610798677/?text=Payment_Issue"
              style={{ textDecoration: "none", color: "black" }}
            >
              <Typography style={{ color: "white", fontSize: "13px" }}>
                For payment related issues click here
              </Typography>
            </a>
          </Paper>
          <Typography
            align="center"
            style={{ fontSize: "12px", paddingBottom: "10px" }}
          >
            Unique Transaction Reference (6 - 12 Digit Number)
          </Typography>
          <Paper style={{ marginLeft: "20px", marginRight: "20px" }}>
            <TextField
              type="number"
              id="outlined-basic"
              fullWidth
              label="UTR"
              variant="outlined"
              onChange={handleUTR}
            />
          </Paper>
          <Typography align="center" style={{ padding: "15px" }}>
            Amount: ₹{amount}
          </Typography>
          <ImageList
            cols={3}
            style={{ paddingLeft: "10px", paddingRight: "10px" }}
            gap={8}
          >
            <ImageListItem>
              <img src={utr1}></img>
            </ImageListItem>
            <ImageListItem>
              <img src={utr2}></img>
            </ImageListItem>
            <ImageListItem>
              <img src={utr3}></img>
            </ImageListItem>
          </ImageList>
        </div>
      ) : (
        <div></div>
      )}
      {/* {
      amount > 200 ? (
        level === 0 ? (
          <Paper
            style={{
              backgroundColor: "white",
              height: "50px",

              margin: "20px",
            }}
            // onClick={((e) => navigateQR(e))}
            onClick={(e) => manualQR(e, "paytm")}
          >
            <Typography align="center">
              <Button
                type="submit"
                style={{
                  paddingTop: "12px",
                  color: "black",
                  textTransform: "none",
                }}
              >
                {level !== 1 ? (
                  <Grid container direction="row">
                    {" "}
                    <Grid item>
                      <Typography align="center">Pay with Paytm App</Typography>
                    </Grid>
                    <Grid>
                      <img src={Paytm} height={25} />
                    </Grid>
                  </Grid>
                ) : (
                  "Submit"
                )}
              </Button>
            </Typography>
          </Paper>
        ) : (
          <div></div>
        )
      ) : (
        <div></div>
      )
    } */}
      <Paper
        style={{
          backgroundColor: "#00b8a9",
          height: "50px",

          margin: "20px",
        }}
        // onClick={((e) => navigateQR(e))}
        onClick={(e) =>
          level === 0
            ? gateway === "auto"
              ? upi(e,'')
              : amount <= 10000
              ? upi(e,'')
              : upi(e,'')
              :upi(e,'')
          //handleLevel(e)
          // upiFin(e,'')
            //   : amount >= 30000 ? handleLevel(e) : manualQR(e)
            // : handleLevel(e)
        }
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
            {level !== 1? (
              amount < 100000 ? (
                <Grid container direction="row" align="center">
                {" "}
                <Grid item>
                  <Typography align="center">Pay on any UPI App </Typography>
                </Grid>
                <Grid>
                  <img
                    src={UPI}
                    height={15}
                    style={{ paddingTop: "5px", paddingLeft: "3px" }}
                  />
                </Grid>
              </Grid>
              ) : (
                <Grid container direction="row" align="center">
                  {" "}
                  <Grid item>
                    <Typography align="center">Pay on UPI ID </Typography>
                  </Grid>
                  <Grid>
                    <img
                      src={UPI}
                      height={15}
                      style={{ paddingTop: "5px", paddingLeft: "3px" }}
                    />
                  </Grid>
                </Grid>
              )
            ) : (
              "Submit"
            )}
          </Button>
        </Typography>
      </Paper>

      <Link
        to={`/rechargeHistory`}
        style={{ textDecoration: "none", color: "black" }}
      >
        <Paper
          style={{
            backgroundColor: "grey",

            height: "50px",

            marginLeft: "20px",
            marginRight: "20px",
            marginBottom: "20px",
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
              All Recharge History
            </Button>
          </Typography>
        </Paper>
      </Link>
      <Paper
        style={{
          marginLeft: "20px",
          marginRight: "20px",
          marginBottom: "20px",
          padding: "10px",
        }}
      >
        <Typography
          align="center"
          style={{ fontSize: "12px", fontWeight: "bold" }}
        >
          Recent Recharge Request
        </Typography>
        {recharge &&
          recharge.map((record) => (
            <List component="nav" aria-label="main mailbox folders">
              <ListItem>
                <Grid container direction="row">
                  <Grid item xs={5}>
                    {record.utr ? (
                      <Typography style={{ fontSize: "10px" }}>
                        UTR - {record.utr}
                      </Typography>
                    ) : (
                      <div></div>
                    )}

                    <Typography style={{ fontSize: "10px" }}>
                      {new Date(
                        record.createDate ? record.createDate : record.date
                      ).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      style={{ fontWeight: "bold", fontSize: "15px" }}
                    >
                      ₹{record.amount}
                    </Typography>
                    {record && record.type === "Bonus" ? (
                      <Typography style={{ fontWeight: "bold" }}>
                        Bonus
                      </Typography>
                    ) : (
                      <div></div>
                    )}
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      style={{
                        color:
                          record.status === "expired"
                            ? "red"
                            : record.status === "success"
                            ? "green"
                            : "orange",
                        fontWeight: "bold",
                        fontSize: "15px",
                      }}
                    >
                      {record.status.toUpperCase()}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          ))}
      </Paper>
      {level === 1 || level === 2 ? (
        <Container
          disableGutters={true}
          style={{ paddingLeft: "20px", paddingRight: "20px" }}
        >
          <Typography variant="h6">Tips</Typography>
          <Typography variant="p">
            100% Safe & Secure. You paid amount then it will credited to your
            wallet guaranteed.
          </Typography>
          <Typography style={{ fontSize: "10px" }}>
            Open any UPI apps like Paytm, GooglePay, PhonePe and click on pay to
            contacts or mobile number and pay on above given number.
          </Typography>
          <Typography style={{ fontSize: "10px" }}>
            Make sure to pay exactly same amount you selected here. Otherwise
            your recharge will not apply.
          </Typography>
          <Typography style={{ fontSize: "10px" }}>
            Make sure to pay to latest account listed above. Payment made to
            previous or old account is not valid and your recharge will not
            apply.
          </Typography>
          <Typography style={{ fontSize: "10px" }}>
            After payment, come back and your recharge should be processed in
            under 60 seconds.
          </Typography>
        </Container>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Recharge;
