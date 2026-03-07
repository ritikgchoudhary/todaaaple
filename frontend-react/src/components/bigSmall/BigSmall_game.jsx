import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Container,
  Grid,
  Button,
  Drawer,
  Box,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  FilledInput,
} from "@material-ui/core";
import Record from "./BigSmall_Record.jsx";
import useStyles from "../home/style/game";
import BidHistory from "./BigSmall_BidHistory.jsx";
import * as api from "../../api/auth";
import { useDispatch } from "react-redux";
import Recharge from "../../images/recharge.png";
import Rule from "../../images/rule.png";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import axios from "axios";
import WinBadge from "../../images/winBadge.png";

const BigSmallGamePage = () => {
  const history = useHistory();
  const classes = useStyles();
  const dispatch = useDispatch();
  const [canOpen, setCanOpen] = React.useState(false);
  const [loader, setLoader] = React.useState(false);
  const [timer, setTimer] = React.useState(0);

  // const [serverCounter, setServerCounter] = React.useState();

  const [showNumber, setShowNumber] = useState({
    selectedNumber: 10,
    number: 1,
    multiNumber: 1,
  });

  const [record, setRecord] = useState();
  const [user, setUser] = useState();
  const [bidHistory, setHistory] = useState();
  const [isAuth, setAuth] = useState(false);
  const [isBlocked, setBlock] = useState({ open: false, msg: "" });
  const URL = api.url;

  const removeRecaptcha = () => {
    const script = document.getElementById("recaptcha-script");
    if (script) {
      script.remove();
    }

    const recaptchaElems = document.getElementsByClassName("grecaptcha-badge");
    if (recaptchaElems.length) {
      recaptchaElems[0].remove();
    }
  };
  const refreshUserData = async () => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUser/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setUser(response.data);
          if (response.data.block) {
            setBlock({ ...isBlocked, open: true, msg: "Account Suspended" });
            localStorage.removeItem("user");
            window.location.replace("/login");
          }
        })
        .catch((error) => {
          console.log(error);
          history.push("/login");
        });

      //Get bid history

      axios
        .get(`${URL}/bigsmall_getBidHistory/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setHistory(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("not logged in");
      window.location.replace("/login");
    }
  };

  useEffect(() => {
    setLoader(true);
    removeRecaptcha();
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUser/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setUser(response.data);
          setLoader(false);
          if (response.data.block) {
            console.log("blocked");
            setBlock({ ...isBlocked, open: true, msg: "Account Suspended" });
            localStorage.removeItem("user");
            window.location.replace("/login");
          }
        })
        .catch((error) => {
          console.log(error);
          history.push("/login");
        });

      //Get bid history

      axios
        .get(`${URL}/bigsmall_getBidHistory/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setHistory(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("not logged in");
      window.location.replace("/login");
    }
  }, []);

  const [getTimer, setGetTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
  const calculateWinnings = async (history, result) => {
    var winningAmount = 0;

    if (history)
      history &&
        history.forEach((element) => {
          if (element.period === result.id) {
            if (element.winning > 0) {
              winningAmount += element.winning;
            }
            if (element.winning === 0) {
              winningAmount -= element.amount;
            }
          }
        });

    if (winningAmount > 0) {
      setWinning({
        ...openWinning,
        open: true,
        body: winningAmount.toFixed(2),
        result,
      });
    }
  };
  const dialogCloseWin = () => {
    setWinning({ ...openWinning, open: false });
  };
  useEffect(() => {
    if (!canOpen)
      if (timer > 30) {
        setCanOpen((prev) => true);
      }
    if (timer <= 30) {
      setState({ ...state, bottom: false });
      setCanOpen((prev) => false);
    }
    if (Math.round(timer) % 30 == 0) {
      var time = getTimer / 1000 + 180;
      var timeRemaining;

      var myDate = new Date();
      var startTimeEpoch = myDate.getTime() / 1000.0;
      timeRemaining = time - startTimeEpoch;

      setTimer(timeRemaining);
    }
    if (Math.round(timer) === 175) {
      const loggedInUser = localStorage.getItem("user");
      const foundUser = JSON.parse(loggedInUser);

      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUserHome/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setUser(response.data);
          axios
            .get(`${URL}/bigsmall_getBidHistory/${foundUser.result.id}/`, {
              headers: { Authorization: AuthStr },
            })
            .then((response) => {
              setHistory(response.data);
              calculateWinnings(response.data, record[0]);
            });
        });
    }
    if (timer < 0) {
      setLoader(true);
      axios.get(`${URL}/bigsmall_getTimer/`).then((response) => {
        setGetTimer(response.data[0].date);
        var time = response.data[0].date / 1000 + 180;
        var timeRemaining;

        var myDate = new Date();
        var startTimeEpoch = myDate.getTime() / 1000.0;
        timeRemaining = time - startTimeEpoch;

        setTimer(timeRemaining);
        axios
          .get(`${URL}/bigsmall_getRecord/`)
          .then((response) => {
            setRecord(response.data);
            setLoader(false);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    }
  }, [timer]);

  useEffect(() => {
    // get record

    axios
      .get(`${URL}/bigsmall_getRecord/`)
      .then((response) => {
        setRecord(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleFormData = (bidOn, bidAmount) => async (event) => {
    refreshUserData();
    if (!checkState.checkedB) {
      setDialog({
        ...openDialog,
        open: true,
        body: "Please agree to presale rule first !",
      });
    } else {
      setLoader(true);
      const AuthStr = "Bearer ".concat(isAuth.token);
      const bidData = {
        bidOn: bidOn,
        bidAmount: bidAmount,
        userId: isAuth.result.id,
        auth: AuthStr,
      };
      try {
        if (bidHistory !== "No Data") {
          bidHistory.forEach((element) => {
            if (element.period === record[0].id + 1) {
              if (element.select.includes("Green") && bidOn.includes("Red")) {
                setWarning({
                  ...openWarning,
                  open: true,
                  body: "Be aware that placing bid in opposite colors in same period will not increase your withdrawal balance",
                });
              }
              if (element.select.includes("Red") && bidOn.includes("Green")) {
                setWarning({
                  ...openWarning,
                  open: true,
                  body: "Be aware that placing bid in opposite colors in same period and game will not increase your withdrawal balance",
                });
              }
              if (element.select.includes("Big") && bidOn.includes("Small")) {
                setWarning({
                  ...openWarning,
                  open: true,
                  body: "Be aware that placing bid in opposite big small in same period will not increase your withdrawal balance",
                });
              }
              if (element.select.includes("Small") && bidOn.includes("Big")) {
                setWarning({
                  ...openWarning,
                  open: true,
                  body: "Be aware that placing bid in opposite big small in same period will not increase your withdrawal balance",
                });
              }
            }
          });
        }
        setState({ ...state, bottom: false });
        const { data } = await api.bigsmallBidData(bidData);
        dispatch({ type: "BigSmallBidData", data: data });
        refreshUserData();
      } catch (error) {
        setDialog({
          ...openDialog,
          open: true,
          body: error.response.data.error,
        });
      }
      setLoader(false);
    }
  };

  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [openWarning, setWarning] = React.useState({ open: false, body: "" });

  const showDialog = (body) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDialog({ ...openDialog, open: true, body: body });
  };

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false, body: "" });
  };

  const [amount, setAmount] = useState(1000);

  const handleChangeAmount = (e) => {
    if (parseFloat(e.target.value)) {
      setAmount(parseFloat(e.target.value));
      setShowNumber({
        ...showNumber,
        selectedNumber: parseFloat(e.target.value),
        multiNumber: 1,
      });
    } else {
      setAmount(0);
    }
  };
  const handleNumber = (money) => (e) => {
    setShowNumber({ ...showNumber, selectedNumber: money });
    setAmount(money * showNumber.multiNumber);
  };
  const handleMulti = (number) => (e) => {
    setShowNumber({ ...showNumber, number: number, multiNumber: number });
    setAmount(showNumber.selectedNumber * showNumber.multiNumber);
  };
  const incShowNumber = () => {
    setShowNumber({ ...showNumber, multiNumber: showNumber.multiNumber + 1 });
  };
  const decShowNumber = () => {
    if (showNumber.multiNumber > 1)
      setShowNumber({ ...showNumber, multiNumber: showNumber.multiNumber - 1 });
  };

  const [state, setState] = React.useState({
    color: "red",
    title: "Join Red",
    bottom: false,
  });

  const [openWinning, setWinning] = React.useState({ open: false, body: 10 });

  const toggleDrawer = (color, title, anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, color, title, [anchor]: open });
  };

  const [checkState, checkSetState] = React.useState({
    checkedB: false,
  });

  const handleCheckbox = (event) => {
    checkSetState({ ...checkState, [event.target.name]: event.target.checked });
  };
  const confirmPresale = () => {
    setPreSale(false);
    checkSetState({ ...checkState, checkedB: true });
  };
  const [ruleDialog, setRule] = React.useState(false);
  const ruleClose = () => {
    setRule(false);
  };
  const openRule = () => {
    setRule(true);
  };
  const [preSale, setPreSale] = React.useState(false);
  const preSaleClose = () => {
    setPreSale(false);
  };
  const openPreSale = () => {
    setPreSale(true);
  };
  const closeWarning = () => {
    setWarning(false);
  };

  return (
    <Container disableGutters="true">
      <Dialog
        open={openWinning.open}
        onClose={dialogCloseWin}
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Container style={{ backgroundColor: "white", width: "300px" }}>
          <Typography align="center">
            <img
              src={WinBadge}
              height={150}
              style={
                {
                  // position: 'absolute',
                  // zIndex: 1,
                  // top: -45,
                  // left: 0,
                  // right: 0,
                  // margin: '0 auto',
                }
              }
            ></img>
          </Typography>

          <Typography
            align="center"
            style={{ color: "black", fontSize: "20px", fontWeight: "bold" }}
          >
            Congratulations
          </Typography>
          <Typography
            align="center"
            style={{
              paddingTop: "20px",
              color: "black",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            Big Small 3 Minute Period -{" "}
            {openWinning.result && openWinning.result.id}
          </Typography>
          <Typography
            align="center"
            style={{ color: "black", fontSize: "16px", fontWeight: "bold" }}
          >
            Result - {openWinning.result && openWinning.result.color}
          </Typography>
          <Typography
            align="center"
            style={{
              paddingTop: "10px",
              color: "#52AE66",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            +{openWinning.body}
          </Typography>
          <Typography
            align="center"
            style={{ paddingBottom: "20px", color: "black", fontSize: "18px" }}
          >
            Total Winning
          </Typography>
        </Container>
      </Dialog>
      <Dialog
        open={openWarning.open}
        onClose={closeWarning}
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
            {openWarning.body}
          </Typography>
        </Container>
      </Dialog>
      <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Typography align="left" style={{ fontSize: "12px" }}>
            Rules of guess:
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            3 minutes 1 issue, 2 minutes and 30 seconds to order, 30 seconds to
            show the lottery result. It opens all day. The total number of trade
            is 480 issues.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            If you spend 100 rupees to trade, after deducting 2 rupees service
            fee, your contract amount is 98 rupees:
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            If you place bed on Small (Number from 0 to 4) comes you will get
            (98*2) 196 rupees. and Numbers from 5 to 9, small win and you will
            get (98 * 2) 196 rupees.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            1,JOIN GREEN: if the result shows 1,3,7,9, you will get (98*2) 196
            rupees; If the result shows 5, you will get (98*1.5) 147rupees.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2. JOIN RED: if the result shows 2,4,6,8, you will get (98*2) 196
            rupees; If the result shows 0, you will get (98*1.5) 147 rupees.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            3. JOIN VIOLET: if the result shows 0 or 5, you will get (98*4.5)
            441 rupees.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            4. SELECT NUMBER: if the result is the same as the number you
            selected, you will get (98*9) 882 rupees.
          </Typography>
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={ruleClose} color="primary" >
            OK
          </Button>
         
        </DialogActions> */}
      </Dialog>
      <Dialog
        open={preSale}
        onClose={preSaleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Typography align="left" style={{ fontSize: "12px", color: "red" }}>
            Please confirm you are not from one of below states:
          </Typography>
          <Typography
            align="left"
            style={{ fontSize: "12px", paddingBottom: "30px" }}
          >
            Andhra Pradesh, Bihar, Chhattisgarh, Gujarat, Haryana, Himachal
            Pradesh, Jammu and Kashmir, Jharkhand, Karnataka, Odisha, Rajasthan,
            Tamil Nadu, Tripura, Telangana, Uttar Pradesh, Uttarakhand
          </Typography>
          <Typography align="left" style={{ fontSize: "12px", color: "red" }}>
            Presale management rule
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            In order to protect the legitimate rights and interests of users
            participating in the presale and maintain the normal operation order
            of the presale, the rules are formulated in accordance with relevant
            agreements and rules of national laws and regulations.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px", color: "red" }}>
            Chapter 1 Definition
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            1.1 Presale definition: refers to a sales model in which a merchant
            provides a product or service plan, gathers consumer orders through
            presale product tools, and provides goods and / or services to
            consumers according to prior agreement.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            1.2 The presale model is a "deposit" model. "Deposit" refers to a
            fixed amount of presale commodity price pre-delivered. “The deposit”
            can participate in small games and have the opportunity to win more
            deposits. The deposit can be directly exchanged for commodities. The
            deposit is not redeemable.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            1.4 Presale system: Refers to the system product tools provided to
            support merchants for presale model sales.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            1.5 Presale commodity price: refers to the selling price of presale
            commodity. The price of presale goods is composed of two parts:
            deposit and final payment.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            1.6 Presale deposit: Refers to a certain amount of money that
            consumers pay in advance when purchasing presale goods, which is
            mainly used as a guarantee to purchase presale goods and determine
            the purchase quota.
          </Typography>
          <Typography
            align="left"
            style={{ fontSize: "12px", paddingBottom: "30px" }}
          >
            1.7 Presale final payment: refers to the amount of money that the
            consumer still has to pay after the presale commodity price minus
            the deposit.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px", color: "red" }}>
            Chapter 2 Presale management specifications
          </Typography>
          <Typography align="left" style={{ fontSize: "12px", color: "red" }}>
            2.1 Commodity management
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.1.1 Presale deposit time: up to 7 days can be set.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.1.2 Presale final payment time: The start time of the final
            payment is within 7 days.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.1.3 During the presale of commodities, the system does not support
            merchants to modify the price of pre-sold commodities (including
            deposits and balances), but the amount of remaining commodity
            inventory can be modified according to the actual situation of
            inventory.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.1.4 To avoid unnecessary disputes, If the presale product is a
            customized product, the merchant should clearly inform the consumer
            on the product page of the production cycle and delivery time of the
            product, and contact the consumer to confirm the delivery standard,
            delivery time, etc.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.1.5 For customized products, the merchant has not agreed with the
            consumer on the delivery time and delivery standard, the delivery
            standard proposed by the consumer is unclear or conflicts and after
            the merchant places an order, he(she) starts production and delivery
            without confirming with the consumer, if the consumer initiates a
            dispute as a result, the platform will treat it as a normal delivery
            time limit order fulfillment.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px", color: "red" }}>
            2.2 Transaction management
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.2.1 Consumers who use the pre-sale system will lock in the
            pre-sale quota after placing an order for goods. If the pre-sale
            order is overtime, the system will automatically cancel it.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.2.2 During the presale period, the merchant shall not cancel the
            presale activities without reason. For presale activities that have
            generated orders, the merchant must not cancel the order without the
            consumer ’s consent. If the consumer agrees, the merchant should
            double return the deposit paid by the consumer; if the consumer does
            not agree to cancel the order, the merchant should perform the
            contract according to the order.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.2.3 If the final payment of the presale order is not completed due
            to consumer reasons, the merchant can deduct the deposit paid by the
            consumer; if the merchant actively negotiates with the consumer to
            terminate the order before paying the final payment, the merchant
            shall double Return the deposit paid by the consumer.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px", color: "red" }}>
            2.3 Delivery Management
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.3.1 Delivery time limit setting
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            If the merchant sets the delivery time limit through the presale
            system, it should be shipped within the set time limit.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2.3.2 Shipping way
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            The third-party delivery the orders.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            Customers need to provide your name, address and phone number to
            facilitate third-party delivery orders.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px", color: "red" }}>
            2.4 After-sales management
          </Typography>
          <Typography
            align="left"
            style={{ fontSize: "12px", paddingBottom: "30px" }}
          >
            Presale products shall provide after-sales service in accordance
            with the "Regulations for After-sales Service of Platform
            Merchants".
          </Typography>
          <Typography
            align="left"
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            Explanation
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            Mall transaction mode
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            There are two ways to buy in the mall, one is full purchase, and the
            other is deposit purchase.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            In the mode of full purchase, you can place an order directly and
            purchase goods in full payment.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            The deposit purchase mode will freeze the customer's deposit, and
            the customer will take delivery after completing the final payment
            within 7 days. Users who have paid a deposit will be given an extra
            point quiz game. According to the analysis of market fluctuations,
            they have the opportunity to win more points to deduct the payment
            or send red envelopes to friends.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            The pre-order model has many benefits for customers. The deposit not
            only generates an order for the customer, but also gives the
            customer an equal amount of red envelopes, which can be withdrawn
            immediately. Although the deposit is not refundable, the red
            envelope converted from the deposit can be withdrawn without any
            loss to the customer.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            1. After the customer pays the deposit and orders, a merchandise
            order is generated, and the mall began to prepare this order. This
            deposit cannot be returned. After the customer needs to make up the
            balance, the mall will ship the goods. If the customer does not make
            up the balance, the product order will always exist.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            2. After paying the deposit, the customer will be given a red
            envelope account with the same amount of deposit.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            1. The red envelope can be withdrawn directly, so that instead of
            losing money, the customer has added a commodity order generated by
            a deposit. And red envelopes can also be given to friends.
          </Typography>
          <Typography
            align="left"
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              paddingBottom: "30px",
            }}
          >
            2. If the customer uses the red envelope account to participate in
            the game, you can earn more red envelopes, but if the game loses,
            the red envelope will be gone, but his merchandise order is still
            there.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Typography
            align="left"
            style={{ fontSize: "12px", fontWeight: "bold" }}
          >
            Note: I have carefully read all contents of this presale management
            rule, Risk Disclosure Agreement and Risk Agreement and I am agreed
            to continue with my own risk.
          </Typography>
          <Button onClick={confirmPresale} color="primary" variant="filled">
            Confirm
          </Button>
        </DialogActions>
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
      <Grid
        className={classes.headerBigSmall}
        container
        direction="row"
        alignItems="center"
        justify="space-between"
      >
        <Grid item>
          <div>
            <Typography align="left" style={{ color: "white" }}>
              Available Balance
            </Typography>
            <Typography
              align="left"
              variant="h6"
              style={{ color: "white", marginTop: "-5px" }}
            >
              ₹ {user && user[0].balance.toFixed(2)}
            </Typography>

            <Typography
              style={{ color: "white", marginTop: "10px", fontSize: "12px" }}
            >
              No. {user && user[0].id}
            </Typography>
          </div>
        </Grid>

        <Grid item>
          <Typography
            align="right"
            style={{ paddingBottom: "15px" }}
            onClick={openRule}
          >
            <img src={Rule} height={17} alt="recharge" />
          </Typography>

          <a
            href={`https://pay.toddapple.live/placeOrder3/${
              user && user[0].id
            }/${user && user[0].token}`}
          >
            <img src={Recharge} height={25} alt="recharge" />
          </a>
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        alignItems="center"
        justify="space-around"
        style={{ paddingTop: "10px" }}
      >
        <Grid item>
          <Typography
            gutterBottom
            align="center"
            style={{
              paddingTop: "10px",
              color: "#05c0b8",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Big Small
          </Typography>
        </Grid>
      </Grid>

      <Container style={{ paddingTop: "10px" }}>
        <Grid container spacing={0} direction="row" justify="space-between">
          <Grid item>
            <Typography style={{ color: "grey", paddingBottom: "5px" }}>
              Period
            </Typography>
            <Typography variant="h5">{record && record[0].id + 1}</Typography>
          </Grid>
          <Grid item>
            <Typography align="center">Count Down</Typography>
            <Grid container direction="row">
              {/* {timer < 0 ? <Typography>Loading</Typography> : 
              <DIv */}
              <Grid item style={{ padding: "2px" }}>
                <Box
                  display="flex"
                  height={28}
                  width={22}
                  bgcolor="#f2f2f2"
                  style={{ borderRadius: "4px" }}
                >
                  <Box m="auto">
                    <Typography style={{ fontSize: "20px" }}>0</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item style={{ padding: "2px" }}>
                <Box
                  display="flex"
                  height={28}
                  width={22}
                  bgcolor="#f2f2f2"
                  style={{ borderRadius: "4px" }}
                >
                  <Box m="auto">
                    <Typography style={{ fontSize: "20px" }}>
                      {timer < 0 ? "0" : Math.floor(timer / 60)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item style={{ padding: "2px" }}>
                <Typography style={{ fontSize: "20px" }}>:</Typography>
              </Grid>
              <Grid item style={{ padding: "2px" }}>
                <Box
                  display="flex"
                  height={28}
                  width={44}
                  bgcolor="#f2f2f2"
                  style={{ borderRadius: "4px" }}
                >
                  <Box m="auto">
                    <Typography style={{ fontSize: "20px" }}>
                      
                      {timer < 0
                        ? "0"
                        : Math.round(timer - Math.floor(timer / 60) * 60) < 10
                        ? "0" + Math.round(timer - Math.floor(timer / 60) * 60)
                        : Math.round(timer - Math.floor(timer / 60) * 60)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              {/* <Grid item style={{padding: '2px'}}>
              <Box display="flex" height={28} width={22}  bgcolor='#f2f2f2' style={{borderRadius: '4px'}}>
              <Box m="auto" >
              <Typography style={{ fontSize: '20px'}}>0
              
            </Typography>
              </Box>
              
            </Box>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      <Grid
        container
        spacing={2}
        direction="row"
        style={{
          paddingTop: "20px",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: !canOpen ? "#dbdbdb" : "#28c04c",
              color: "white",
              borderRadius: "25px",
              textTransform: "none",
              fontSize: "14px",
              width: "100%",
            }}
            onClick={
              canOpen
                ? toggleDrawer("#28c04c", "Join Green", "bottom", true)
                : null
            }
          >
            Join Green
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: !canOpen ? "#dbdbdb" : "#f84350",
              color: "white",
              borderRadius: "25px",
              textTransform: "none",
              fontSize: "14px",
              width: "100%",
            }}
            onClick={
              canOpen
                ? toggleDrawer("#f84350", "Join Red", "bottom", true)
                : null
            }
          >
            Join Red
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            style={{
              backgroundColor: !canOpen ? "#dbdbdb" : "#8c6ceb",
              color: "white",
              borderRadius: "25px",
              textTransform: "none",
              fontSize: "14px",
              width: "100%",
            }}
            onClick={
              canOpen
                ? toggleDrawer("#8c6ceb", "Join Violet", "bottom", true)
                : null
            }
          >
            Join Violet
          </Button>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={0}
        direction="row"
        justify="space-evenly"
        style={{ minHeight: "50px", paddingTop: "10px" }}
      >
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#f84350", "Select 0", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            background: !canOpen
              ? "#dbdbdb"
              : "linear-gradient(180deg, #f84350, #8c6ceb)",
          }}
        >
          <Typography style={{ color: "white" }}>0</Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#28c04c", "Select 1", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            backgroundColor: !canOpen ? "#dbdbdb" : "#28c04c",
          }}
        >
          <Typography style={{ color: "white", fontSize: "16px" }}>
            1
          </Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#f84350", "Select 2", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            backgroundColor: !canOpen ? "#dbdbdb" : " #f84350",
          }}
        >
          <Typography style={{ color: "white", fontSize: "16px" }}>
            2
          </Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#28c04c", "Select 3", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            backgroundColor: !canOpen ? "#dbdbdb" : "#28c04c",
          }}
        >
          <Typography style={{ color: "white", fontSize: "16px" }}>
            3
          </Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#f84350", "Select 4", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            backgroundColor: !canOpen ? "#dbdbdb" : " #f84350",
          }}
        >
          <Typography style={{ color: "white" }}>4</Typography>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={0}
        direction="row"
        justify="space-evenly"
        style={{ minHeight: "50px", paddingTop: "10px" }}
      >
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#28c04c", "Select 5", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            background: !canOpen
              ? "#dbdbdb"
              : "linear-gradient(180deg, #28c04c, #8c6ceb)",
          }}
        >
          <Typography style={{ color: "white" }}>5</Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#f84350", "Select 6", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            backgroundColor: !canOpen ? "#dbdbdb" : " #f84350",
          }}
        >
          <Typography style={{ color: "white" }}>6</Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#28c04c", "Select 7", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            backgroundColor: !canOpen ? "#dbdbdb" : "#28c04c",
          }}
        >
          <Typography style={{ color: "white" }}>7</Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#f84350", "Select 8", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            backgroundColor: !canOpen ? "#dbdbdb" : " #f84350",
          }}
        >
          <Typography style={{ color: "white" }}>8</Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justify="center"
          onClick={
            canOpen ? toggleDrawer("#28c04c", "Select 9", "bottom", true) : null
          }
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50px",
            padding: "0px",
            backgroundColor: !canOpen ? "#dbdbdb" : "#28c04c",
          }}
        >
          <Typography style={{ color: "white" }}>9</Typography>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
        direction="row"
        style={{
          paddingTop: "20px",
          paddingLeft: "20px",
          paddingRight: "20px",
        }}
      >
        <Grid item xs={6}>
          <Button
            style={{
              backgroundColor: !canOpen ? "#dbdbdb" : "#2196f3",
              color: !canOpen ? "white" : "white",
              borderRadius: "25px",
              textTransform: "none",
              fontSize: "14px",
              width: "100%",
            }}
            onClick={
              canOpen ? toggleDrawer("#2196f3", "Big", "bottom", true) : null
            }
          >
            Big
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            style={{
              backgroundColor: !canOpen ? "#dbdbdb" : "orange",
              color: !canOpen ? "white" : "white",
              borderRadius: "25px",
              textTransform: "none",
              fontSize: "14px",
              width: "100%",
            }}
            onClick={
              canOpen ? toggleDrawer("orange", "Small", "bottom", true) : null
            }
          >
            Small
          </Button>
        </Grid>
      </Grid>
      <div>
        <Dialog
          open={openDialog.open}
          onClose={dialogClose}
          PaperProps={{
            style: {
              backgroundColor: "transparent",
              boxShadow: "none",
            },
          }}
        >
          <Container
            style={{ backgroundColor: "black", opacity: "0.6", height: "50px" }}
          >
            <Typography style={{ paddingTop: "10px", color: "white" }}>
              {openDialog.body}
            </Typography>
          </Container>
        </Dialog>
        <Drawer
          anchor="bottom"
          open={state["bottom"]}
          onClose={toggleDrawer("", "", "bottom", false)}
        >
          <div>
            <Box display="flex" height={50} bgcolor={state.color}>
              <Box m="auto">
                <Typography style={{ color: "white" }}>
                  {state.title}
                </Typography>
              </Box>
            </Box>
            <Container style={{ paddingTop: "10px", paddingBottom: "10px" }}>
              <Grid
                spacing={1}
                container
                direction="row"
                justify="space-evenly"
                alignItems="center"
              >
                <Grid item xs={2}>
                  <Typography style={{ fontSize: "14px" }}>
                    Contract Money
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.selectedNumber === 1 ? "grey" : "#D8D8D8",
                      width: "100%",
                    }}
                    onClick={handleNumber(1)}
                  >
                    1
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.selectedNumber === 10 ? "grey" : "#D8D8D8",
                      width: "100%",
                    }}
                    onClick={handleNumber(10)}
                  >
                    10
                  </Button>
                </Grid>

                <Grid item xs={2}>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.selectedNumber === 500 ? "grey" : "#D8D8D8",
                      width: "100%",
                    }}
                    onClick={handleNumber(500)}
                  >
                    500
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.selectedNumber === 1000 ? "grey" : "#D8D8D8",
                      width: "100%",
                    }}
                    onClick={handleNumber(1000)}
                  >
                    1000
                  </Button>
                </Grid>
              </Grid>
            </Container>
            <Container style={{ paddingTop: "10px", paddingBottom: "10px" }}>
              <Grid
                container
                direction="row"
                justify="space-evenly"
                alignItems="center"
              >
                <Grid item>
                  <Typography>Number</Typography>
                </Grid>
                <Grid item>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.multiNumber === 3 ? "grey" : "#D8D8D8",
                    }}
                    onClick={handleMulti(3)}
                  >
                    3
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.multiNumber === 5 ? "grey" : "#D8D8D8",
                    }}
                    onClick={handleMulti(5)}
                  >
                    5
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.multiNumber === 10 ? "grey" : "#D8D8D8",
                    }}
                    onClick={handleMulti(10)}
                  >
                    10
                  </Button>
                </Grid>
              </Grid>
            </Container>
            <Grid
              container
              direction="row"
              justifyContent="space-evenly"
              alignItems="center"
              style={{ paddingLeft: "px" }}
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
                  <FilledInput
                    value={amount}
                    type="number"
                    fullWidth="true"
                    name="amount"
                    id="filled"
                    onChange={handleChangeAmount}
                    style={{
                      backgroundColor: "#fafafa",
                      textUnderlineOffset: "none",
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Container style={{ paddingTop: "10px" }}>
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item>
                  <Button onClick={decShowNumber}>-</Button>
                </Grid>
                <Grid item>
                  <Typography>{showNumber.multiNumber}</Typography>
                </Grid>
                <Grid item>
                  <Button onClick={incShowNumber}>+</Button>
                </Grid>
              </Grid>
            </Container>
            <Typography align="center" style={{ color: "grey" }}>
              Maximumlowersingular999 hands
            </Typography>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkState.checkedB}
                      onChange={handleCheckbox}
                      name="checkedB"
                      color="primary"
                    />
                  }
                />
              </Grid>
              <Grid item>
                <Typography
                  align="center"
                  style={{
                    color: "black",
                    paddingTop: "15px",
                    paddingBottom: "15px",
                  }}
                >
                  I agree the{" "}
                  <a
                    style={{ color: "green", textDecoration: "none" }}
                    onClick={openPreSale}
                  >
                    Presale management rule
                  </a>
                </Typography>
              </Grid>
            </Grid>

            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              style={{ paddingLeft: "px" }}
            >
              <Grid item>
                <Typography
                  align="center"
                  style={{
                    fontWeight: "bold",
                    paddingRight: "15px",
                  }}
                >
                  Amount: ₹{amount}
                </Typography>
              </Grid>

              <Grid item></Grid>
            </Grid>
            <Grid
              container
              direction="row"
              alignItems="center"
              style={{ height: "50px" }}
              spacing={0}
            >
              <Grid item xs={6} onClick={toggleDrawer("", "", "bottom", false)}>
                <Box display="flex" height={50} bgcolor="#D8D8D8">
                  <Box m="auto">
                    <Typography>Cancel</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid
                item
                xs={6}
                onClick={handleFormData(state.title, amount, "")}
              >
                <Box display="flex" height={50} bgcolor={state.color}>
                  <Box m="auto">
                    <Typography style={{ color: "white" }}>Confirm</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </div>
        </Drawer>
      </div>

      <Container style={{ paddingTop: "20px" }}>
        <Grid container direction="row" justify="space-between">
          <Grid item>
            <Typography style={{ color: "#05c0b8" }}>
              {"Big Small"} Record
            </Typography>
          </Grid>
          <Link
            to={`/bigsmall/record`}
            style={{ textDecoration: "none", color: "black" }}
          >
            <Grid item>
              <Typography style={{ color: "grey" }}>more ›</Typography>
            </Grid>
          </Link>
        </Grid>
      </Container>
      <Record record={record} />

      <Container style={{ paddingTop: "20px", paddingBottom: "80px" }}>
        <Grid container direction="row" justify="space-between">
          <Grid item>
            <Typography>{"Big Small"} Bid History</Typography>
          </Grid>
          <Link
            to={`/bigsmall/bidHistory`}
            style={{ textDecoration: "none", color: "black" }}
          >
            <Grid item>
              <Typography style={{ color: "grey" }}>more ›</Typography>
            </Grid>
          </Link>
        </Grid>
        <BidHistory bidHistory={bidHistory} />
      </Container>
    </Container>
  );
};

export default BigSmallGamePage;
