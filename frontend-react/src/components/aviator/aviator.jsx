import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Typography,
  Container,
  Grid,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Paper,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import useStyles from "../home/style/game.js";
import * as api from "../../api/auth.js";
import { useHistory } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import Recharge from "../../images/recharge.png";
import Rule from "../../images/rule.png";
import Plane from "../../images/plane2.gif";
import Boom from "../../images/boom1.gif";

var socket;
const AviatorGamePage = () => {
  const URL = api.url;
  const aviatorURL = 'https://aviatorbackend-521a.onrender.com';
  const history = useHistory();
  const classes = useStyles();
  const [loader, setLoader] = React.useState(false);
  const [socketConnected, setSocketConnection] = React.useState(false);
  const [counter, setCounter] = React.useState(0);
  const [score, setScore] = React.useState(1);
  const [fly, setFly] = React.useState(false);
  const [crashed, setCrashed] = React.useState(false);
  const [bid, setBid] = React.useState({});
  const [repair,setRepair] = React.useState(false);
  // const [serverCounter, setServerCounter] = React.useState();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const data = { id: foundUser.result.id };
      socket = io(aviatorURL);
      socket.on("aviatorRepair", (res) => {
        setRepair(true);
      });
      socket.on("aviatorConnected", (res) => {
        setRepair(false);
        setSocketConnection(true);
        if (res.fly) {
          setFly(true);
          setScore(res.countScore);
        }
        if (!res.fly && !res.crash) {
          setFly(false);
          setCrashed(false);
          setCounter(res.count);
          setScore(1);
          
        }
        if (res.crash) {
          setFly(false);
          setCrashed(true);
          setScore(res.score);
          setBid({});
        
        }  
      });
      socket.on("aviatorRecord", (res) => {
        setrecord(res.getRecord);
      })
     
    
    }
  }, []);

  const [showNumber, setShowNumber] = useState({
    selectedNumber: 10,
    number: 1,
    multiNumber: 1,
  });

  const [record, setrecord] = useState();
  const [user, setUser] = useState();
  const [bidHistory, setHistory] = useState();
  const [isBlocked, setBlock] = useState({ open: false, msg: "" });



  const placeBid = (e) => {
    e.preventDefault();
    setLoader(true);
    const data = {
      id: user[0].id,
      amount: showNumber.selectedNumber * showNumber.multiNumber,
      token: user[0].token,
    };
    socket.emit("aviatorPlace", data);
    socket.on("errorOccurred", (msg) => {
      setLoader(false);
      setDialog({ ...openDialog, open: true, body: msg });
    });
    socket.on("aviatorPlaceSuccess", (res) => {
      setBid({...bid,[res.bid.id]: res.bid});
      
      setLoader(false);
      refreshUserData();
    });
    socket.on("aviatorPlaceError", (res) => {
      
      
      setLoader(false);
      
    });

  };

  const stopGame = (e,data) => {
    e.preventDefault();
    setLoader(true);
    var dataNew = {
      ...data,
      token: user[0].token,
      stopOn: score,

    }
    socket.emit("aviatorStop", dataNew);
    socket.on("errorOccurred", (msg) => {
      setLoader(false);
      setDialog({ ...openDialog, open: true, body: msg });
    });
    socket.on("aviatorStopSuccess", (res) => {
      const newBidData = {
        ...data,
        stop: true,
        stopOn: res.stopOn,
        
      }
      
      setLoader(false);
      setBid({...bid,[res.id]: newBidData});
      refreshUserData();
    });
    socket.on("aviatorStopError", (res) => {
     
  
      setLoader(false);
      
    });
  };

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
  const refreshUserData = useCallback(async () => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);

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

      //   axios.get(`${URL}/getBidHistory/${foundUser.result.id}/`, { headers: { Authorization: AuthStr } })
      //     .then(response => {
      //         setHistory(response.data);
      //   })
      //     .catch((error) => {
      //       console.log(error);
      //   });
    } else {
      console.log("not logged in");
      window.location.replace("/login");
    }
  });

  // const refreshRecord = () => {
  //   axios
  //     .get(`${URL}/getAviatorRecordData`)
  //     .then((response) => {
  //       setrecord(response.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  useEffect(() => {
    removeRecaptcha();
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);

      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUser/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setUser(response.data);
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

        axios.get(`${URL}/getAviatorBidHistory/${foundUser.result.id}/`, { headers: { Authorization: AuthStr } })
        .then(response => {
          var newBid = {};
          if(response.data.length > 0)
          response.data.forEach(element => {
            const filed = `${element.id}`
            newBid[filed] = element;
            
          });
          setBid(newBid);
            
      })
        .catch((error) => {
          console.log(error);
      });
    } else {
      console.log("not logged in");
      window.location.replace("/login");
    }
  }, []);

  useEffect(() => {
    // get record

    axios
      .get(`${URL}/getAviatorRecordData`)
      .then((response) => {
        setrecord(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [openDialog, setDialog] = React.useState({ open: false, body: "" });

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false, body: "" });
  };

  const handleNumber = (money) => (e) => {
    setShowNumber({ ...showNumber, selectedNumber: money });
  };
  const handleMulti = (number) => (e) => {
    setShowNumber({ ...showNumber, number: number, multiNumber: number });
  };
  const incShowNumber = () => {
    setShowNumber({ ...showNumber, multiNumber: showNumber.multiNumber + 1 });
  };
  const decShowNumber = () => {
    if (showNumber.multiNumber > 1)
      setShowNumber({ ...showNumber, multiNumber: showNumber.multiNumber - 1 });
  };

  const [ruleDialog, setRule] = React.useState(false);
  const ruleClose = () => {
    setRule(false);
  };
  const openRule = () => {
    setRule(true);
  };

  return (
    <Container disableGutters="true">
      <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Typography align="left" style={{ fontSize: "12px" }}>
            Rules of aviator:
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            10 seconds to order. Place your bids in 10 seconds. If you place
            bids your aviator fly then bids will be considered in next fly.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            Trade out your bids before aviator crashes or flew away.
          </Typography>
          <Typography align="left" style={{ fontSize: "12px" }}>
            If you trade out befere crash or flew away your money will be
            multiplied by aviator score. Ex - Aviator Score is 20x,If your bid
            was 100 rupees then your money will be multiplied by 100 * 20 = 2000
            rupees.
          </Typography>
        </DialogContent>
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
        className={fly ? classes.headerAviatorOn : classes.headerAviator}
        container
        direction="column"
        alignItems="start"
        justify="space-between"
      >
        <Grid
          container
          direction="row"
          alignItems="start"
          justify="space-between"
          style={{
            paddingTop: "10px",
            paddingLeft: "20px",
            paddingRight: "20px",
          }}
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

            <Link to="/preOrder">
              <img src={Recharge} height={25} alt="recharge" />
            </Link>
          </Grid>
        </Grid>
        <Grid item>
          {repair ? <div><Typography
                  
                  align="center"
                  style={{ color: "white",fontSize: '20px',fontWeight: 'bold'}}
                >
                  Plane Re-fueling !
                </Typography>
                <Typography
                  
                  align="center"
                  style={{ color: "white",fontSize: '15px'}}
                >
                  This not take long. Stay tuned.
                </Typography></div>  : !fly ? (
            crashed ? (
              <div>
                <Typography
                  variant="h4"
                  align="center"
                  style={{ paddingBottom: "30px", color: "white" }}
                >
                  {score.toFixed(2)}x
                </Typography>
                <Typography align="center">
                  <img
                    src={Boom}
                    height={150}
                    alt="plane"
                    
                  />
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  style={{ color: "white" }}
                >
                  Flew away !
                </Typography>
              </div>
            ) : (
              <div>
                <Typography
                  variant="h5"
                  align="center"
                  style={{ color: "white" }}
                >
                  Starting new game
                </Typography>
                <Typography
                  variant="h6"
                  align="center"
                  style={{ color: "white" }}
                >
                  {counter} seconds...
                </Typography>
              </div>
            )
          ) : (
            <div>
              <Typography
                variant="h4"
                align="center"
                style={{ paddingBottom: "30px", color: "white" }}
              >
                {score.toFixed(2)}x
              </Typography>
              <Typography align="center">
                <img
                  src={Plane}
                  height={150}
                  alt="plane"
                  className={classes.planeImg}
                />
              </Typography>
            </div>
          )}
        </Grid>
        <Grid item>
          <Grid
            container
            direction="row"
            alignItems="center"
            justify="space-between"
            style={{
              paddingLeft: "20px",
              paddingBottom: "5px",
              paddingRight: "20px",
            }}
          >
            <Grid item>
              <Container
                align="center"
                style={{
                  borderRadius: "5px",
                  backgroundColor:
                    record && record[0].number && record[0].number <= 1.5
                      ? "red"
                      : record && record[0].number && record[0].number <= 2
                      ? "orange"
                      : record && record[0].number && record[0].number <= 5
                      ? "#28c04c"
                      : "#8c6ceb",
                }}
              >
                <Typography style={{ fontSize: "11px", color: "white" }}>
                  {record && record[0].number && record[0].number}x
                </Typography>
              </Container>
            </Grid>
            <Grid item>
              <Container
                align="center"
                style={{
                  borderRadius: "5px",
                  backgroundColor:
                    record && record[1].number && record[1].number <= 1.5
                      ? "red"
                      : record && record[1].number && record[1].number <= 2
                      ? "orange"
                      : record && record[1].number && record[1].number <= 5
                      ? "#28c04c"
                      : "#8c6ceb",
                }}
              >
                <Typography style={{ fontSize: "11px", color: "white" }}>
                  {record && record[1].number && record[1].number}x
                </Typography>
              </Container>
            </Grid>
            <Grid item>
              <Container
                align="center"
                style={{
                  borderRadius: "5px",
                  backgroundColor:
                    record && record[2].number && record[2].number <= 1.5
                      ? "red"
                      : record && record[2].number && record[2].number <= 2
                      ? "orange"
                      : record && record[2].number && record[2].number <= 5
                      ? "#28c04c"
                      : "#8c6ceb",
                }}
              >
                <Typography style={{ fontSize: "11px", color: "white" }}>
                  {record && record[2].number && record[2].number}x
                </Typography>
              </Container>
            </Grid>
            <Grid item>
              <Container
                align="center"
                style={{
                  borderRadius: "5px",
                  backgroundColor:
                    record && record[3].number && record[3].number <= 1.5
                      ? "red"
                      : record && record[3].number && record[3].number <= 2
                      ? "orange"
                      : record && record[3].number && record[3].number <= 5
                      ? "#28c04c"
                      : "#8c6ceb",
                }}
              >
                <Typography style={{ fontSize: "11px", color: "white" }}>
                  {record && record[3].number && record[3].number}x
                </Typography>
              </Container>
            </Grid>
            <Grid item>
              <Link to={`aviator/record`}>
                <Typography style={{ fontSize: "13px", color: "white" }}>
                  {"more >"}
                </Typography>
              </Link>
            </Grid>
          </Grid>
          <Typography
            align="center"
            style={{ fontSize: "10px", color: "white" }}
          >
            {socketConnected ? `🟢 Connected` : "🟠 Connecting"}
          </Typography>
        </Grid>
      </Grid>

      <Container style={{ height: "10px" }}></Container>
      <Typography align="center" style={{ color: "#05c0b8" }}>
        Period: {record && record[0].id + 1}
      </Typography>
      
      {bid &&
       Object.keys(bid).map((bidData) => {
          return <Paper
            style={{
              backgroundColor: "#05c0b8",
              marginLeft: "15px",
              marginRight: "15px",
              marginTop: "10px",
              marginBottom: "5px",
              padding: "10px",
            }} key={bidData}
          >
            <Grid container direction="row" justifyContent="space-between">
              <Grid item>
                <Typography style={{ color: "white", fontSize: "12px" }}>
                  Your Bid: ₹{bid[`${bidData}`].amount}
                </Typography>
                <Typography style={{ color: "white", fontSize: "12px" }}>
                  Period: {bid[`${bidData}`].period}
                </Typography>
              </Grid>
              <Grid item>
                <Typography
                  align="center"
                  style={{ color: "white", fontSize: "14px" }}
                >
                  Profit
                </Typography>
                <Typography
                  style={{
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  ₹{(bid[`${bidData}`].amount * score).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            {fly ?<Typography align={bid[`${bidData}`].stop ? 'start' : 'center'}>
    
    <Button
      size="small"
      disabled={bid[`${bidData}`].stop ? true : false}
      style={{
        backgroundColor: bid[`${bidData}`].stop ? 'black' : "white",
        color:bid[`${bidData}`].stop ? "white": "black",
        borderRadius: "10px",
        textTransform: "none",
        fontSize: "15px",
        width:bid[`${bidData}`].stop ? "150px" : "200px",
      }}
      onClick={!bid[`${bidData}`].stop ?  ((e)=>stopGame(e,bid[`${bidData}`])): null}
    >
      {bid[`${bidData}`].stop ? `Stoped ₹${(bid[`${bidData}`].amount * bid[`${bidData}`].stopOn).toFixed(2)}`: 'Stop Now'}
    </Button>
  </Typography> : null}
            
          </Paper>
        })
        }

      <div>
        <Container style={{ paddingTop: "10px", paddingBottom: "10px" }}>
          <Grid
            spacing={1}
            container
            direction="row"
            justify="space-evenly"
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography style={{ fontSize: "12px" }}>
                Contract Money
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Button
                size="small"
                style={{
                  backgroundColor:
                    showNumber.selectedNumber === 10 ? "grey" : "#D8D8D8",
                }}
                onClick={handleNumber(10)}
              >
                10
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                size="small"
                style={{
                  backgroundColor:
                    showNumber.selectedNumber === 100 ? "grey" : "#D8D8D8",
                  width: "100%",
                }}
                onClick={handleNumber(100)}
              >
                100
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                size="small"
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
            <Grid item xs={2}>
              <Button
                size="small"
                style={{
                  backgroundColor:
                    showNumber.selectedNumber === 10000 ? "grey" : "#D8D8D8",
                  width: "100%",
                }}
                onClick={handleNumber(10000)}
              >
                10000
              </Button>
            </Grid>
          </Grid>
        </Container>
        <Container style={{ paddingTop: "1px", paddingBottom: "10px" }}>
          <Grid
            container
            direction="row"
            justify="space-evenly"
            alignItems="center"
          >
            <Grid item>
              <Typography style={{ fontSize: "12px" }}>Number</Typography>
            </Grid>
            <Grid item>
              <Button
                size="small"
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
                size="small"
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
                size="small"
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
        <Container style={{ paddingTop: "5px" }}>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item>
              <Button onClick={decShowNumber}>-</Button>
            </Grid>
            <Grid item>
              <Typography>{showNumber.multiNumber}</Typography>
            </Grid>
            <Grid item>
              <Button onClick={incShowNumber}>+</Button>
            </Grid>
            <Grid item>
              
              <Button
                disabled={repair ? true : counter < 1 ? true : crashed ? true : false}
                style={{
                  backgroundColor:
                    counter < 1 ? "#D8D8D8" : crashed ? "#D8D8D8" : "#05c0b8",
                  color: "black",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "15px",
                  width: "100%",
                }}
                onClick={repair ? null : counter < 1 ? null : crashed ? null :((e) =>  placeBid(e))}
              >
                Join Plane ₹{showNumber.selectedNumber * showNumber.multiNumber}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </div>

      <div>
         <Container style={{ paddingTop: "20px" }}>
          <Grid container direction="row" justify="space-between">
            <Grid item>
              <Typography style={{ color: "#05c0b8" }}>Your All Bid History</Typography>
            </Grid>
            
          </Grid>
        </Container>
        <Link
              to={`aviator/history`}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Typography align="center">
<Button
                size="small"
                style={{
                  backgroundColor: "#05c0b8",
                  color: "white",
                  borderRadius: "5px",
                  textTransform: "none",
                  fontSize: "10px",
                  width: "150px",
                  marginTop: "20px"
                }}
                // onClick={}
              >
                View Now
              </Button>
              </Typography>
              </Link>
        <Container style={{ height: "80px" }}></Container>
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
      </div>


      {/* <Container style={{ paddingTop: "20px" }}>
        <Grid container direction="row" justify="space-between">
          <Grid item>
            <Typography style={{color: "#05c0b8"}}>{whichGame.selectedGame === 0 ? 'Parity' : whichGame.selectedGame === 1 ? 'Sapre': whichGame.selectedGame === 2 ? 'Bcone': 'Emerd'} Record</Typography>
          </Grid>
          <Link to={`/record/${whichGame.selectedGame}`} style={{textDecoration: 'none', color: 'black'}}>
          <Grid item>
            <Typography style={{ color: "grey" }}>more ›</Typography>
          </Grid>
          </Link>
        </Grid>
        
      </Container> */}
    </Container>
  );
};

export default AviatorGamePage;
