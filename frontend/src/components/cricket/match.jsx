import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Dialog,
  Drawer,
  Box,
  Button,
  FormControl,
  InputLabel,
  FilledInput,
  Paper,
} from "@material-ui/core/";
import useStyles from "../home/style/game.js";
import { Link, useParams, useHistory } from "react-router-dom";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import LiveTvIcon from "@material-ui/icons/LiveTv";
import io from "socket.io-client";
import * as api from "../../api/auth.js";

var socket;

export const MatchPage = () => {
  const URL = api.url;
  const cricketURL = api.cricket;
  const history = useHistory();
  const params = useParams();
  const classes = useStyles();
  const [user, setUser] = useState();
  const [loader, setLoader] = React.useState(false);
  const [isBlocked, setBlock] = useState({ open: false, msg: "" });
  const [matchOdds, setMatchOdds] = useState();
  const [bidData, setBidData] = useState();
  const [betAmount, setBetAmount] = useState({ book: {}, match: {} });
  const [liveScore, setLiveScore] = useState();
  const [liveTV, setLiveTV] = useState(false);

  const [state, setState] = React.useState({
    color: "red",
    title: "Join Red",
    bottom: false,
  });
  const [amount, setAmount] = useState(1000);

  const handleAmount = (money) => (e) => {
    setAmount(money);

    if (state.type === "match") {
      var market = parseFloat(state.market);
      var teamAAmount = bidData?.match?.teamAAmount ?? 0;
      var teamBAmount = bidData?.match?.teamBAmount ?? 0;
      if (state.team === 0) {
        if (state.title.includes("Back")) {
          teamAAmount += money * market - money;
          teamBAmount -= money;
        } else {
          teamBAmount += money;
          teamAAmount -= money * market - money;
        }
      } else {
        if (state.title.includes("Back")) {
          teamBAmount += money * market - money;
          teamAAmount -= money;
        } else {
          teamAAmount += money;
          teamBAmount -= money * market - money;
        }
      }
      setBetAmount({ ...betAmount, match: { teamAAmount, teamBAmount } });
    } else {
      var teamAAmount = bidData?.book?.teamAAmount ?? 0;
      var teamBAmount = bidData?.book?.teamBAmount ?? 0;

      if (state.team === 0) {
        if (state.title.includes("Back")) {
          teamAAmount += (parseFloat(state.id) / 100) * money;
          teamBAmount -= money;
        } else {
          teamBAmount += money;
          teamAAmount -= (parseFloat(state.id) / 100) * money;
        }
      } else {
        if (state.title.includes("Back")) {
          teamBAmount += (parseFloat(state.id) / 100) * money;
          teamAAmount -= money;
        } else {
          teamAAmount += money;
          teamBAmount -= (parseFloat(state.id) / 100) * money;
        }
      }
      setBetAmount({ ...betAmount, book: { teamAAmount, teamBAmount } });
    }
  };

  const handleChangeAmount = (e) => {
    if (e.target.value && parseFloat(e.target.value) > 0)
      setAmount(parseFloat(e.target.value));

    if (state.type === "match") {
      var market = parseFloat(state.market);
      var teamAAmount = bidData?.match?.teamAAmount ?? 0;
      var teamBAmount = bidData?.match?.teamBAmount ?? 0;
      if (state.team === 0) {
        if (state.title.includes("Back")) {
          teamAAmount +=
            parseFloat(e.target.value) * market - parseFloat(e.target.value);
          teamBAmount -= parseFloat(e.target.value);
        } else {
          teamBAmount += parseFloat(e.target.value);
          teamAAmount -=
            parseFloat(e.target.value) * market - parseFloat(e.target.value);
        }
      } else {
        if (state.title.includes("Back")) {
          teamBAmount +=
            parseFloat(e.target.value) * market - parseFloat(e.target.value);
          teamAAmount -= parseFloat(e.target.value);
        } else {
          teamAAmount += parseFloat(e.target.value);
          teamBAmount -=
            parseFloat(e.target.value) * market - parseFloat(e.target.value);
        }
      }
      setBetAmount({ ...betAmount, match: { teamAAmount, teamBAmount } });
    } else {
      var teamAAmount = bidData?.book?.teamAAmount ?? 0;
      var teamBAmount = bidData?.book?.teamBAmount ?? 0;

      if (state.team === 0) {
        if (state.title.includes("Back")) {
          teamAAmount +=
            (parseFloat(state.id) / 100) * parseFloat(e.target.value);
          teamBAmount -= parseFloat(e.target.value);
        } else {
          teamBAmount += parseFloat(e.target.value);
          teamAAmount -=
            (parseFloat(state.id) / 100) * parseFloat(e.target.value);
        }
      } else {
        if (state.title.includes("Back")) {
          teamBAmount +=
            (parseFloat(state.id) / 100) * parseFloat(e.target.value);
          teamAAmount -= parseFloat(e.target.value);
        } else {
          teamAAmount += parseFloat(e.target.value);
          teamBAmount -=
            (parseFloat(state.id) / 100) * parseFloat(e.target.value);
        }
      }
      setBetAmount({ ...betAmount, book: { teamAAmount, teamBAmount } });
    }
  };

  const toggleDrawer =
    (type, id, color, title, market, team, anchor, open) => (event) => {
      if (
        event.type === "keydown" &&
        (event.key === "Tab" || event.key === "Shift")
      ) {
        return;
      }

      if(type === ''){
        setState({
          ...state,
          
          [anchor]: open,
        });
      }


      if (type === "match") {
        var aAmount = bidData?.match?.teamAAmount ?? 0;
        var bAmount = bidData?.match?.teamBAmount ?? 0;

       
        if(title.includes("Cashout")){
          if(aAmount === 0 && bAmount === 0){
            setDialog({open: true, body: 'Exposer not found'})
         }else{
          bAmount += 128 * 1.77 - 128;
          aAmount -= 128;
         }
        }else{
          if (team === 0) {
          
            if (title.includes("Back")) {
              aAmount += amount * parseFloat(market) - amount;
              bAmount -= amount;
            } else {
              bAmount += amount;
              aAmount -= amount * parseFloat(market) - amount;
            }
          
          
        } else {
          
            if (title.includes("Back")) {
              bAmount += amount * parseFloat(market) - amount;
              aAmount -= amount;
            } else {
              aAmount += amount;
              bAmount -= amount * parseFloat(market) - amount;
            }
          
          
        }
        setBetAmount({
          ...betAmount,
          match: { teamAAmount: aAmount, teamBAmount: bAmount },
        });

        if (parseFloat(market) >= 101 || parseFloat(market) <= 0.0) {
          setDialog({ open: true, body: "Min - Max Stake Reached 0 ~ 30" });
        } else {
          setState({
            ...state,
            type,
            id,
            color,
            title,
            market,
            team,
            [anchor]: open,
          });
        }
        }
       
   
       
      }
      if (type === "fancy" || type === "fancy2") {
        if (parseFloat(market) <= 0.0) {
        } else {
          setState({
            ...state,
            type,
            id,
            color,
            title,
            market,
            team,
            [anchor]: open,
          });
        }
      }

      if (type === "bookmaker") {
        var teamAAmount = bidData?.book?.teamAAmount ?? 0;
        var teamBAmount = bidData?.book?.teamBAmount ?? 0;
        if (parseFloat(id) <= 0.0) {
        } else {
          setState({
            ...state,
            type,
            id,
            color,
            title,
            market,
            team,
            [anchor]: open,
          });
        }
        if (team === 0) {
          if(title.includes("Cashout")){
          
          }else{
          if (title.includes("Back")) {
            teamAAmount += (parseFloat(id) / 100) * amount;
            teamBAmount -= amount;
          } else {
            teamBAmount += amount;
            teamAAmount -= (parseFloat(id) / 100) * amount;
          }
        }
        } else {
          if(title.includes("Cashout")){
          
          }else{
          if (title.includes("Back")) {
            teamBAmount += (parseFloat(id) / 100) * amount;
            teamAAmount -= amount;
          } else {
            teamAAmount += amount;
            teamBAmount -= (parseFloat(id) / 100) * amount;
          }
        }
        }
        setBetAmount({ ...betAmount, book: { teamAAmount, teamBAmount } });
      }
    };

  const [openDialog, setDialog] = React.useState({ open: false, body: "" });

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };
  const handleDialog = (e, val) => {
    e.preventDefault();
    setDialog({ open: true, body: val });
  };

  const handleFormData = (bidOn) => async (event) => {
    setLoader(true);
    const bidData = { bidOn: bidOn, userId: user[0].id, token: user[0].token };

    socket.emit("placeCricketBet", bidData);
    socket.on("placeCricketBetSuccess", (res) => {
      refreshUserData();
      setLoader(false);
    });
    socket.on("errorOccurred", (msg) => {
      setLoader(false);
      setDialog({ ...openDialog, open: true, body: msg });
    });
    setState({ ...state, bottom: false });
  };

  const handleLiveTV = (e) => {
    e.preventDefault();
    if (liveTV) {
      setLiveTV(false);
    } else {
      setLiveTV(true);
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

      // Get bid history

      axios
        .get(
          `${URL}/cricket_getCurrentBidHistory/${params.match}/${foundUser.result.id}`,
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          //setBidHistory(response.data);
          setBidData({
            ...bidData,
            match: response.data?.bid[`${foundUser.result.id}`]?.final ?? {},
            book: response.data?.bid[`${foundUser.result.id}`]?.finalBook ?? {},
            fancy:
              response.data?.bid[`${foundUser.result.id}`]?.fancyAmount ?? {},
            fancy2:
              response.data?.bid[`${foundUser.result.id}`]?.fancy2Amount ?? {},
          });
          setBetAmount({
            ...betAmount,
            match: response.data?.bid[`${foundUser.result.id}`]?.final ?? {},
            book: response.data?.bid[`${foundUser.result.id}`]?.finalBook ?? {},
          });
        })
        .catch((error) => {
          console.log("error");
          setLoader(false);
        });
    } else {
      setLoader(false);
      window.location.replace("/login");
    }
  });

  useEffect(() => {
    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);

      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUser/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          if (response.data.block) {
            localStorage.removeItem("user");
            window.location.replace("/login");
          }
          setUser(response.data);

          socket = io(cricketURL, {
            auth: {
              user_id: response.data[0].id,
              token: response.data[0].token,
            },
          });

          socket.emit("getMatchOdds", {
            matchId: params.id,
            id: response.data[0].id,
            token: response.data[0].token,
          });
          socket.on("matchOdds", (res) => {
            
            if (res[`${params.id}`]) {
              if (
                res[`${params.id}`].odds?.name === "Error" ||
                res[`${params.id}`].odds?.status === "something went wrong"
              ) {
              } else {
                setMatchOdds(res[`${params.id}`].odds);
              }
            }
            setLoader(false);
          });
          //socket.emit("getMatchLiveScore", { id: params.id });
          socket.emit("getMatchLiveScore", {
            matchId: params.match,
            id: response.data[0].id,
            token: response.data[0].token,
          });
          socket.on("liveScore", (res) => {
            if (res !== null && res[`${params.match}`]) {
              if (res[`${params.match}`].data)
                setLiveScore(res[`${params.match}`]);
            }
          });
        })
        .catch((error) => {
          setLoader(false);

          //history.push("/login");
        });

      //Get bid history

      axios
        .get(
          `${URL}/cricket_getCurrentBidHistory/${params.match}/${foundUser.result.id}`,
          { headers: { Authorization: AuthStr } }
        )
        .then((response) => {
          //setBidHistory(response.data);
          setBidData({
            ...bidData,
            match: response.data?.bid[`${foundUser.result.id}`]?.final ?? {},
            book: response.data?.bid[`${foundUser.result.id}`]?.finalBook ?? {},
            fancy:
              response.data?.bid[`${foundUser.result.id}`]?.fancyAmount ?? {},
            fancy2:
              response.data?.bid[`${foundUser.result.id}`]?.fancy2Amount ?? {},
          });
        })
        .catch((error) => {
          setLoader(false);
        });
    } else {
      setLoader(false);
      window.location.replace("/login");
    }
  }, []);

  return (
    <>
      <Grid
        className={classes.headerOdds}
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item>
          <ArrowBackIosIcon
            onClick={history.goBack}
            style={{ fontSize: "18px", color: "black" }}
          />
        </Grid>
        <Grid item>
          <Typography style={{ color: "black", fontSize: "14px" }}>
            Match Page
          </Typography>
        </Grid>
        <Grid item>
          <Container style={{ backgroundColor: "#05c0b8" }}>
            <Typography
              style={{ color: "black", fontWeight: "bold", fontSize: "15px" }}
            >
              ₹{user && user[0].balance.toFixed(2)}
            </Typography>
          </Container>
          <Container style={{ backgroundColor: "red" }}>
            <Typography
              style={{ color: "white", fontWeight: "bold", fontSize: "12px" }}
            >
              EXP{" "}
              {user && user[0].exp && user[0].exp ? user[0].exp.toFixed(0) : 0}
            </Typography>
          </Container>
        </Grid>
        {/* <Grid item>
          <Container
            style={{
              backgroundColor: "white",
              color: "black",
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "20px",
              width: "100%",
            }}
          >
            Next ₹{session.next.toFixed(2)}
          </Container>
        </Grid> */}
      </Grid>

      <div
        className="container-fluid"
        style={{ paddingRight: "11px", paddingLeft: "11px" }}
      >
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          style={{
            paddingLeft: "10px",
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingRight: "10px",
            backgroundColor: "#05c0b8",
          }}
        >
          <Grid item xs={8}>
            <Typography
              align="left"
              style={{ color: "white", fontSize: "10px", fontWeight: "bold" }}
            >
              {params.team1 + " vs " + params.team2}
            </Typography>
            <Typography
              align="center"
              style={{ color: "red", fontSize: "10px", fontWeight: "bold" }}
            >
              {matchOdds &&
              matchOdds.t1 &&
              matchOdds.t1[0] &&
              matchOdds.t1[0][0] &&
              matchOdds?.t1[0][0]?.inplay
                ? "In Play"
                : ""}
            </Typography>
          </Grid>

          <Grid item>
            <Link
              to={`/cricket/history/${params.match}/${params.team1}/${params.team2}`}
            >
              <div className="form-inline text-white">
                <small>
                  <b>
                    Open Bets <span className="badge badge-light">{"🏏"}</span>
                  </b>
                </small>
              </div>
            </Link>
          </Grid>
        </Grid>
        {liveScore ? (
          <Container
            disableGutters="true"
            className={classes.headerCricketPitch}
          >
            <Typography align="right" style={{ color: "white" }}>
              <LiveTvIcon
                onClick={(e) => handleLiveTV(e)}
                style={{ fontSize: "18px", color: "white" }}
              />
            </Typography>

            <Typography
              align="center"
              style={{
                fontSize: "16px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {liveScore && liveScore.data && liveScore.data.first_circle}
            </Typography>
            <Grid
              container
              direction="row"
              alignItems="start"
              justifyContent="space-between"
            >
              <Grid item>
                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {liveScore && liveScore.data && liveScore.data.team_a_short}
                </Typography>
                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {liveScore?.data?.team_a_scores ?? "Yet to bet"}
                </Typography>
                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "10px",
                  }}
                >
                  {liveScore && liveScore.data && liveScore.data.team_a_over}
                </Typography>
              </Grid>

              <Grid item>
                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {liveScore && liveScore.data && liveScore.data.team_b_short}
                </Typography>
                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {liveScore?.data?.team_b_scores ?? "Yet to bet"}
                </Typography>
                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "10px",
                  }}
                >
                  {liveScore && liveScore.data && liveScore.data.team_b_over}
                </Typography>
              </Grid>
            </Grid>
            <Typography
              align="center"
              style={{
                letterSpacing: "3px",
                fontSize: "12px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {liveScore && liveScore.data && liveScore.data.last36ball}
            </Typography>
            <Typography
              align="center"
              style={{
                paddingTop: "8px",
                fontSize: "8px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {liveScore && liveScore.data && liveScore.data.need_run_ball}
            </Typography>
          </Container>
        ) : (
          <Container
            disableGutters="true"
            className={classes.headerCricketPitch}
          >
            <Typography align="right" style={{ color: "white" }}>
              <LiveTvIcon
                onClick={(e) => handleLiveTV(e)}
                style={{ fontSize: "18px", color: "white" }}
              />
            </Typography>
            <Typography
              align="center"
              style={{
                paddingTop: "30px",

                fontSize: "10px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Match Start Time
            </Typography>
            <Typography
              align="center"
              style={{
                paddingBottom: "10px",
                fontSize: "10px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {new Date(params.date).toLocaleString()}
            </Typography>
            <Grid
              container
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item>
                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {params.team1}
                </Typography>

                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "10px",
                  }}
                >
                  Yet to bet
                </Typography>
              </Grid>

              <Grid item>
                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {params.team2}
                </Typography>

                <Typography
                  align="center"
                  style={{
                    color: "white",
                    fontSize: "10px",
                  }}
                >
                  Yet to bet
                </Typography>
              </Grid>
            </Grid>
          </Container>
        )}
        {liveTV ? (
          <Typography align="center">
            <iframe
              height="180px"
              style={{ transform: "scale(1)" }}
              src={`https://tele.bazigarprediction.website/tv-cricket/live.php?match_id=${params.match}`}
            ></iframe>{" "}
          </Typography>
        ) : (
          <div></div>
        )}

        {
          loader ? (
            <div></div>
          ) : (
            <div style={{ paddingBottom: "80px" }}>
              {matchOdds && matchOdds.status === "something went wrong" ? (
                <div></div>
              ) : (
                <div>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingLeft: "10px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      paddingRight: "10px",
                      backgroundColor: "#f2f0f0",
                    }}
                  >
                    <Grid item>
                      <Grid container direction="row" alignItems="center">
                        <Grid item>
                          <Typography
                            align="left"
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            Match Odds
                          </Typography>
                        </Grid>
                        {/* <Grid item xs={4}>  
                          <Container
                            disableGutters={true}
                            onClick={toggleDrawer(
                              "match",
                              matchOdds && matchOdds.t1[0][0].sid,
                              "orange",
                              `Cashout`,
                              matchOdds && matchOdds.t1[0][0].b1,
                              0,
                              "bottom",
                              true
                            )}
                            style={{
                              width: "60px",
                              borderRadius: "10px",
                              backgroundColor: "orange",
                            }}
                          >
                            <Typography
                              align="center"
                              style={{ fontSize: "10px" }}
                            >
                              CashOut
                            </Typography>
                          </Container>
                        </Grid> */}
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Container
                            style={{
                              width: "60px",
                              align: "center",
                              backgroundColor: '"#f2f0f0',
                            }}
                          >
                            <Typography
                              align="center"
                              style={{
                                fontSize: "10px",
                                fontWeight: "bold",
                                paddingRight: "10px",
                              }}
                            >
                              Back
                            </Typography>
                          </Container>
                        </Grid>
                        <Grid item>
                          <Container
                            style={{
                              width: "60px",
                              align: "center",
                              backgroundColor: '"#f2f0f0',
                            }}
                          >
                            <Typography
                              align="center"
                              style={{ fontSize: "10px", fontWeight: "bold" }}
                            >
                              Lay
                            </Typography>
                          </Container>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingLeft: "10px",
                      paddingBottom: "3px",
                      backgroundColor: "white",
                    }}
                  >
                    <Grid
                      item
                      xs={6}
                      container
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Grid item xs={10}>
                        <Typography
                          align="start"
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {params.team1}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography
                          align="start"
                          style={{
                            fontSize: "10px",
                            color:
                              bidData &&
                              bidData.match &&
                              bidData.match.teamAAmount < 0
                                ? "red"
                                : "green",
                          }}
                        >
                          {bidData &&
                            bidData.match &&
                            bidData.match.teamAAmount &&
                            (
                              Math.round(bidData.match.teamAAmount * 100) / 100
                            ).toFixed(1)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item>
                      {matchOdds &&
                      matchOdds.t1 &&
                      matchOdds.t1[0] &&
                      matchOdds.t1[0][0].mstatus === "OPEN" ? (
                        <Grid
                          container
                          direction="row"
                          justifyContent="space-evenly"
                        >
                          <Grid
                            item
                            onClick={toggleDrawer(
                              "match",
                              matchOdds.t1[0][0].sid,
                              "green",
                              `Back ${params.team1}`,
                              matchOdds && matchOdds.t1[0][0].b1,
                              0,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#A7D9FE",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds && matchOdds.t1[0][0].b1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds && matchOdds.t1[0][0].bs1}
                              </Typography>
                            </Container>
                          </Grid>
                          <Grid
                            item
                            style={{ paddingLeft: "3px" }}
                            onClick={toggleDrawer(
                              "match",
                              matchOdds.t1[0][0].sid,
                              "red",
                              `Lay ${params.team1}`,
                              matchOdds && matchOdds.t1[0][0].l1,
                              0,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#F9CAD4",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds && matchOdds.t1[0][0].l1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds && matchOdds.t1[0][0].ls1}
                              </Typography>
                            </Container>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography
                          style={{
                            color:
                              matchOdds &&
                              matchOdds.t1 &&
                              matchOdds.t1[0] &&
                              matchOdds.t1[0][0].status === "WINNER"
                                ? "green"
                                : "red",
                            fontWeight: "bold",
                            fontSize: "13px",
                            paddingRight: "20px",
                          }}
                        >
                          {matchOdds &&
                          matchOdds.t1 &&
                          matchOdds.t1[0] &&
                          matchOdds.t1[0][0].status !== "ACTIVE"
                            ? matchOdds && matchOdds.t1[0][0].status
                            : "SUSPENDED"}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingBottom: "3px",
                      paddingLeft: "10px",
                      backgroundColor: "white",
                    }}
                  >
                    <Grid
                      item
                      xs={6}
                      container
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Grid item xs={10}>
                        <Typography
                          align="start"
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {params.team2}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography
                          align="start"
                          style={{
                            fontSize: "10px",
                            color:
                              bidData &&
                              bidData.match &&
                              bidData.match.teamBAmount < 0
                                ? "red"
                                : "green",
                          }}
                        >
                          {bidData &&
                            bidData.match &&
                            bidData.match.teamBAmount &&
                            (
                              Math.round(bidData.match.teamBAmount * 100) / 100
                            ).toFixed(1)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item>
                      {matchOdds &&
                      matchOdds.t1 &&
                      matchOdds.t1[0] &&
                      matchOdds.t1[0][1].mstatus === "OPEN" ? (
                        <Grid
                          container
                          direction="row"
                          justifyContent="space-evenly"
                        >
                          <Grid
                            item
                            onClick={toggleDrawer(
                              "match",
                              matchOdds.t1[0][1].sid,
                              "green",
                              `Back ${params.team2}`,
                              matchOdds && matchOdds.t1[0][1].b1,
                              1,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#A7D9FE",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds && matchOdds.t1[0][1].b1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds && matchOdds.t1[0][1].bs1}
                              </Typography>
                            </Container>
                          </Grid>
                          <Grid
                            item
                            style={{ paddingLeft: "3px" }}
                            onClick={toggleDrawer(
                              "match",
                              matchOdds.t1[0][1].sid,
                              "red",
                              `Lay ${params.team2}`,
                              matchOdds && matchOdds.t1[0][1].l1,
                              1,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#F9CAD4",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds && matchOdds.t1[0][1].l1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds && matchOdds.t1[0][1].ls1}
                              </Typography>
                            </Container>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography
                          align="center"
                          style={{
                            color:
                              matchOdds &&
                              matchOdds.t1 &&
                              matchOdds.t1[0] &&
                              matchOdds.t1[0][1].status === "WINNER"
                                ? "green"
                                : "red",
                            fontWeight: "bold",
                            fontSize: "13px",
                            paddingRight: "20px",
                          }}
                        >
                          {matchOdds &&
                          matchOdds.t1 &&
                          matchOdds.t1[0] &&
                          matchOdds.t1[0][1].mstatus === "CLOSED"
                            ? matchOdds && matchOdds.t1[0][1].mstatus
                            : "SUSPENDED"}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </div>
              )}

              {/* {matchOdds && matchOdds.t1 && matchOdds.t1[0].length === 3 ? (
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{
                    paddingBottom: "3px",
                    paddingLeft: "10px",
                    backgroundColor: "white",
                  }}
                >
                  <Grid
                    item
                    xs={6}
                    container
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Grid item>
                      <Typography
                        align="start"
                        style={{ fontSize: "12px", fontWeight: "bold" }}
                      >
                        Draw
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography
                        align="start"
                        style={{
                          fontSize: "10px",
                          color:
                            bidData && bidData.draw && bidData.draw.amount < 0
                              ? "red"
                              : "green",
                          paddingLeft: "10px",
                        }}
                      >
                        {bidData &&
                          bidData.draw &&
                          (Math.round(bidData.draw.amount * 100) / 100).toFixed(
                            1
                          )}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item>
                    {matchOdds && matchOdds.t1[0][2].mstatus === "OPEN" ? (
                      <Grid
                        container
                        direction="row"
                        justifyContent="space-evenly"
                      >
                        <Grid
                          item
                          onClick={toggleDrawer(
                            "green",
                            `Back ${params.team2}`,
                            matchOdds && matchOdds.t1[0][2].b1,
                            2,
                            "bottom",
                            true
                          )}
                        >
                          <Container
                            style={{
                              width: "70px",
                              align: "center",
                              backgroundColor: "#A7D9FE",
                            }}
                          >
                            <Typography
                              align="center"
                              style={{ fontSize: "12px", fontWeight: "bold" }}
                            >
                              {matchOdds && matchOdds.t1[0][2].b1}
                            </Typography>
                            <Typography
                              align="center"
                              style={{ fontSize: "8px" }}
                            >
                              {matchOdds && matchOdds.t1[0][2].bs1}
                            </Typography>
                          </Container>
                        </Grid>
                        <Grid
                          item
                          style={{ paddingLeft: "3px" }}
                          onClick={toggleDrawer(
                            "red",
                            `Lay ${params.team2}`,
                            matchOdds && matchOdds.t1[0][2].l1,
                            2,
                            "bottom",
                            true
                          )}
                        >
                          <Container
                            style={{
                              width: "70px",
                              align: "center",
                              backgroundColor: "#F9CAD4",
                            }}
                          >
                            <Typography
                              align="center"
                              style={{ fontSize: "12px", fontWeight: "bold" }}
                            >
                              {matchOdds && matchOdds.t1[0][2].l1}
                            </Typography>
                            <Typography
                              align="center"
                              style={{ fontSize: "8px" }}
                            >
                              {matchOdds && matchOdds.t1[0][2].ls1}
                            </Typography>
                          </Container>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography
                        align="center"
                        style={{
                          color:
                            matchOdds && matchOdds.t1[0][2].status === "WINNER"
                              ? "green"
                              : "red",
                          fontWeight: "bold",
                          fontSize: "13px",
                          paddingRight: "20px",
                        }}
                      >
                        {matchOdds && matchOdds.t1[0][2].mstatus !== "OPEN"
                          ? matchOdds && matchOdds.t1[0][2].status
                          : "SUSPENDED"}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              ) : (
                <div></div>
              )} */}
              {matchOdds && matchOdds.t2 && matchOdds.t2.length === 0 ? (
                <div></div>
              ) : matchOdds &&
                matchOdds.t2 &&
                matchOdds.t2[0].bm1[0].mname === "Tied Match" ? (
                <div>
                  {/* <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                style={{
                  paddingLeft: "10px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingRight: "10px",
                  backgroundColor: "#f2f0f0",
                }}
              >
                <Grid item>
                  <Grid container direction="row" alignItems="center">
                    <Grid item>
                      <Typography
                        align="center"
                        style={{ fontSize: "13px", fontWeight: "bold" }}
                      >
                        {matchOdds && matchOdds.t2 && matchOdds.t2[0].bm1[0].mname}
                      </Typography>
                    </Grid>
                   
                  </Grid>
                </Grid>

                <Grid item>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Grid item>
                      <Container
                        style={{
                          width: "60px",
                          align: "center",
                          backgroundColor: '"#f2f0f0',
                        }}
                      >
                        <Typography
                          align="center"
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            paddingRight: "10px",
                          }}
                        >
                          Back
                        </Typography>
                      </Container>
                    </Grid>
                    <Grid item>
                      <Container
                        style={{
                          width: "60px",
                          align: "center",
                          backgroundColor: '"#f2f0f0',
                        }}
                      >
                        <Typography
                          align="center"
                          style={{ fontSize: "10px", fontWeight: "bold" }}
                        >
                          Lay
                        </Typography>
                      </Container>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                style={{
                  paddingLeft: "10px",
                  paddingBottom: "3px",
                  backgroundColor: "white",
                }}
              >
                <Grid
                  item
                  xs={6}
                  container
                  direction="row"
                  justifyContent="space-between"
                >
                  <Grid item>
                    <Typography
                      align="start"
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                    >
                      Tied Match
                    </Typography>
                  </Grid>
                  <Grid item>
                  <Typography
                      align="start"
                      style={{
                        fontSize: "10px",
                        color:
                          bidData && bidData.tied &&
                          bidData.tied.teamAAmount  < 0
                            ? "red"
                            : "green",
                        
                      }}
                    >
                      {bidData && bidData.tied &&
                        bidData.tied.teamAAmount &&
                        (Math.round(bidData.tied.teamAAmount * 100) / 100).toFixed(
                          1
                        )}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item>
                  {matchOdds && matchOdds.t2 && matchOdds.t2[0].bm1[0].s !== "SUSPENDED" ? (
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-evenly"
                    >
                      <Grid
                        item
                        onClick={toggleDrawer(
                          'tied',
                          '',
                          "green",
                          `Back Tied`,
                          0,
                          0,
                          "bottom",
                          true
                        )}
                      >
                        <Container
                          style={{
                            width: "70px",
                            align: "center",
                            backgroundColor: "#A7D9FE",
                          }}
                        >
                          <Typography
                            align="center"
                            style={{ fontSize: "12px", fontWeight: "bold" }}
                          >
                            {matchOdds && matchOdds.t2 && matchOdds.t2[0].bm1[0].b1}
                          </Typography>
                          <Typography
                            align="center"
                            style={{ fontSize: "8px" }}
                          >
                             {matchOdds && matchOdds.t2 && matchOdds.t2[0].bm1[0].bs1}
                          </Typography>
                        </Container>
                      </Grid>
                      <Grid
                        item
                        style={{ paddingLeft: "3px" }}
                        onClick={toggleDrawer(
                          'tied',
                          '',
                          "red",
                          `Lay Tied`,
                          0,
                          0,
                          "bottom",
                          true
                        )}
                      >
                        <Container
                          style={{
                            width: "70px",
                            align: "center",
                            backgroundColor: "#F9CAD4",
                          }}
                        >
                          <Typography
                            align="center"
                            style={{ fontSize: "12px", fontWeight: "bold" }}
                          >
                            {matchOdds && matchOdds.t2 && matchOdds.t2[0].bm1[0].l1}
                          </Typography>
                          <Typography
                            align="center"
                            style={{ fontSize: "8px" }}
                          >
                             {matchOdds && matchOdds.t2 && matchOdds.t2[0].bm1[0].ls1}
                          </Typography>
                        </Container>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography
                      style={{
                        color:
                         "red",
                        fontWeight: "bold",
                        fontSize: "13px",
                        paddingRight: "20px",
                      }}
                    >
                      {matchOdds && matchOdds.t2 && matchOdds.t2[0].bm1[0].s}
                    </Typography>
                  )}
                </Grid>
              </Grid> */}
                </div>
              ) : (
                <div>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingLeft: "10px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      paddingRight: "10px",
                      backgroundColor: "#f2f0f0",
                    }}
                  >
                    <Grid item>
                      <Grid container direction="row" alignItems="center">
                        <Grid item>
                          <Typography
                            align="center"
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            {matchOdds &&
                              matchOdds.t2 &&
                              matchOdds.t2[0].bm1[0].mname}
                          </Typography>
                        </Grid>
                        {/* <Grid item style={{ paddingLeft: "3px" }}>
                    <Container
                      //onClick={(e) => openCashoutDialog(e)}
                      style={{
                        width: "60px",
                        borderRadius: "10px",
                        backgroundColor: "orange",
                      }}
                    >
                      <Typography
                        style={{ marginLeft: "-5px", fontSize: "10px" }}>
                        CashOut
                      </Typography>
                    </Container>
                  </Grid> */}
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Container
                            style={{
                              width: "60px",
                              align: "center",
                              backgroundColor: '"#f2f0f0',
                            }}
                          >
                            <Typography
                              align="center"
                              style={{
                                fontSize: "10px",
                                fontWeight: "bold",
                                paddingRight: "10px",
                              }}
                            >
                              Back
                            </Typography>
                          </Container>
                        </Grid>
                        <Grid item>
                          <Container
                            style={{
                              width: "60px",
                              align: "center",
                              backgroundColor: '"#f2f0f0',
                            }}
                          >
                            <Typography
                              align="center"
                              style={{ fontSize: "10px", fontWeight: "bold" }}
                            >
                              Lay
                            </Typography>
                          </Container>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingLeft: "10px",
                      paddingBottom: "3px",
                      backgroundColor: "white",
                    }}
                  >
                    <Grid
                      item
                      xs={6}
                      container
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Grid item xs={10}>
                        <Typography
                          align="start"
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {matchOdds &&
                            matchOdds.t2 &&
                            matchOdds.t2[0].bm1[0].nat}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography
                          align="start"
                          style={{
                            fontSize: "10px",
                            color:
                              bidData &&
                              bidData.book &&
                              bidData.book.teamAAmount < 0
                                ? "red"
                                : "green",
                          }}
                        >
                          {bidData &&
                            bidData.book &&
                            bidData.book.teamAAmount &&
                            (
                              Math.round(bidData.book.teamAAmount * 100) / 100
                            ).toFixed(1)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item>
                      {matchOdds &&
                      matchOdds.t2 &&
                      matchOdds.t2[0].bm1[0].s === "ACTIVE" ? (
                        <Grid
                          container
                          direction="row"
                          justifyContent="space-evenly"
                        >
                          <Grid
                            item
                            onClick={toggleDrawer(
                              "bookmaker",
                              matchOdds.t2[0].bm1[0].b1,
                              "green",
                              `Back ${matchOdds.t2[0].bm1[0].nat}`,
                              0,
                              0,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#A7D9FE",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[0].bm1[0].b1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[0].bm1[0].bs1}
                              </Typography>
                            </Container>
                          </Grid>
                          <Grid
                            item
                            style={{ paddingLeft: "3px" }}
                            onClick={toggleDrawer(
                              "bookmaker",
                              matchOdds.t2[0].bm1[0].l1,
                              "red",
                              `Lay ${matchOdds.t2[0].bm1[0].nat}`,
                              0,
                              0,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#F9CAD4",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[0].bm1[0].l1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[0].bm1[0].ls1}
                              </Typography>
                            </Container>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography
                          style={{
                            color: "red",
                            fontWeight: "bold",
                            fontSize: "13px",
                            paddingRight: "20px",
                          }}
                        >
                          {matchOdds &&
                            matchOdds.t2 &&
                            matchOdds.t2[0].bm1[0].s}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingBottom: "3px",
                      paddingLeft: "10px",
                      backgroundColor: "white",
                    }}
                  >
                    <Grid
                      item
                      xs={6}
                      container
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Grid item xs={10}>
                        <Typography
                          align="start"
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {matchOdds &&
                            matchOdds.t2 &&
                            matchOdds.t2[0].bm1[1].nat}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography
                          align="start"
                          style={{
                            fontSize: "10px",
                            color:
                              bidData &&
                              bidData.book &&
                              bidData.book.teamBAmount < 0
                                ? "red"
                                : "green",
                          }}
                        >
                          {bidData &&
                            bidData.book &&
                            bidData.book.teamBAmount &&
                            (
                              Math.round(bidData.book.teamBAmount * 100) / 100
                            ).toFixed(1)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item>
                      {matchOdds &&
                      matchOdds.t2 &&
                      matchOdds.t2[0] &&
                      matchOdds.t2[0].bm1[1].s === "ACTIVE" ? (
                        <Grid
                          container
                          direction="row"
                          justifyContent="space-evenly"
                        >
                          <Grid
                            item
                            onClick={toggleDrawer(
                              "bookmaker",
                              matchOdds.t2[0].bm1[1].b1,
                              "green",
                              `Back ${matchOdds.t2[0].bm1[1].nat}`,
                              0,
                              1,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#A7D9FE",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[0].bm1[1].b1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[0].bm1[1].bs1}
                              </Typography>
                            </Container>
                          </Grid>
                          <Grid
                            item
                            style={{ paddingLeft: "3px" }}
                            onClick={toggleDrawer(
                              "bookmaker",
                              matchOdds.t2[0].bm1[1].l1,
                              "red",
                              `Lay ${matchOdds.t2[0].bm1[1].nat}`,
                              0,
                              1,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#F9CAD4",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[0].bm1[1].l1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[0].bm1[1].ls1}
                              </Typography>
                            </Container>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography
                          align="center"
                          style={{
                            color: "red",
                            fontWeight: "bold",
                            fontSize: "13px",
                            paddingRight: "20px",
                          }}
                        >
                          {matchOdds &&
                            matchOdds.t2 &&
                            matchOdds.t2[0].bm1[1].s}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </div>
              )}
              {matchOdds && matchOdds.t2 && matchOdds.t2.length === 0 ? (
                <div></div>
              ) : matchOdds &&
                matchOdds.t2 &&
                matchOdds.t2[1] &&
                matchOdds.t2[1].bm1[0].mname === "Bookmaker" ? (
                <div>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingLeft: "10px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      paddingRight: "10px",
                      backgroundColor: "#f2f0f0",
                    }}
                  >
                    <Grid item>
                      <Grid container direction="row" alignItems="center">
                        <Grid item>
                          <Typography
                            align="center"
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          >
                            {matchOdds &&
                              matchOdds.t2 &&
                              matchOdds.t2[1].bm1[0].mname}
                          </Typography>
                        </Grid>
                        {/* <Grid item style={{ paddingLeft: "3px" }}>
                    <Container
                      //onClick={(e) => openCashoutDialog(e)}
                      style={{
                        width: "60px",
                        borderRadius: "10px",
                        backgroundColor: "orange",
                      }}
                    >
                      <Typography
                        style={{ marginLeft: "-5px", fontSize: "10px" }}>
                        CashOut
                      </Typography>
                    </Container>
                  </Grid> */}
                      </Grid>
                    </Grid>

                    <Grid item>
                      <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Container
                            style={{
                              width: "60px",
                              align: "center",
                              backgroundColor: '"#f2f0f0',
                            }}
                          >
                            <Typography
                              align="center"
                              style={{
                                fontSize: "10px",
                                fontWeight: "bold",
                                paddingRight: "10px",
                              }}
                            >
                              Back
                            </Typography>
                          </Container>
                        </Grid>
                        <Grid item>
                          <Container
                            style={{
                              width: "60px",
                              align: "center",
                              backgroundColor: '"#f2f0f0',
                            }}
                          >
                            <Typography
                              align="center"
                              style={{ fontSize: "10px", fontWeight: "bold" }}
                            >
                              Lay
                            </Typography>
                          </Container>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingLeft: "10px",
                      paddingBottom: "3px",
                      backgroundColor: "white",
                    }}
                  >
                    <Grid
                      item
                      xs={6}
                      container
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography
                          align="start"
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {matchOdds.t2[1].bm1[0].nat}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography
                          align="start"
                          style={{
                            fontSize: "10px",
                            color:
                              bidData &&
                              bidData.book &&
                              bidData.book.teamAAmount < 0
                                ? "red"
                                : "green",
                          }}
                        >
                          {bidData &&
                            bidData.book &&
                            bidData.book.teamAAmount &&
                            (
                              Math.round(bidData.book.teamAAmount * 100) / 100
                            ).toFixed(1)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item>
                      {matchOdds &&
                      matchOdds.t2 &&
                      matchOdds.t2[1].bm1[0].s === "ACTIVE" ? (
                        <Grid
                          container
                          direction="row"
                          justifyContent="space-evenly"
                        >
                          <Grid
                            item
                            onClick={toggleDrawer(
                              "bookmaker",
                              matchOdds.t2[1].bm1[0].b1,
                              "green",
                              `Back ${matchOdds.t2[1].bm1[0].nat}`,
                              1,
                              0,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#A7D9FE",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[1].bm1[0].b1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[1].bm1[0].bs1}
                              </Typography>
                            </Container>
                          </Grid>
                          <Grid
                            item
                            style={{ paddingLeft: "3px" }}
                            onClick={toggleDrawer(
                              "bookmaker",
                              matchOdds.t2[1].bm1[0].l1,
                              "red",
                              `Lay ${matchOdds.t2[1].bm1[0].nat}`,
                              1,
                              0,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#F9CAD4",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[1].bm1[0].l1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[1].bm1[0].ls1}
                              </Typography>
                            </Container>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography
                          style={{
                            color: "red",
                            fontWeight: "bold",
                            fontSize: "13px",
                            paddingRight: "20px",
                          }}
                        >
                          {matchOdds &&
                            matchOdds.t2 &&
                            matchOdds.t2[1].bm1[0].s}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      paddingBottom: "3px",
                      paddingLeft: "10px",
                      backgroundColor: "white",
                    }}
                  >
                    <Grid
                      item
                      xs={6}
                      container
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Grid item xs={10}>
                        <Typography
                          align="start"
                          style={{ fontSize: "12px", fontWeight: "bold" }}
                        >
                          {matchOdds.t2[1].bm1[1].nat}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography
                          align="start"
                          style={{
                            fontSize: "10px",
                            color:
                              bidData &&
                              bidData.book &&
                              bidData.book.teamBAmount < 0
                                ? "red"
                                : "green",
                          }}
                        >
                          {bidData &&
                            bidData.book &&
                            bidData.book.teamBAmount &&
                            (
                              Math.round(bidData.book.teamBAmount * 100) / 100
                            ).toFixed(1)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item>
                      {matchOdds &&
                      matchOdds.t2 &&
                      matchOdds.t2[1] &&
                      matchOdds.t2[1].bm1[1].s === "ACTIVE" ? (
                        <Grid
                          container
                          direction="row"
                          justifyContent="space-evenly"
                        >
                          <Grid
                            item
                            onClick={toggleDrawer(
                              "bookmaker",
                              matchOdds.t2[1].bm1[1].b1,
                              "green",
                              `Back ${matchOdds.t2[1].bm1[1].nat}`,
                              1,
                              1,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#A7D9FE",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[1].bm1[1].b1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[1].bm1[1].bs1}
                              </Typography>
                            </Container>
                          </Grid>
                          <Grid
                            item
                            style={{ paddingLeft: "3px" }}
                            onClick={toggleDrawer(
                              "bookmaker",
                              matchOdds.t2[1].bm1[1].l1,
                              "red",
                              `Lay ${matchOdds.t2[1].bm1[1].nat}`,
                              1,
                              1,
                              "bottom",
                              true
                            )}
                          >
                            <Container
                              style={{
                                width: "70px",
                                align: "center",
                                backgroundColor: "#F9CAD4",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{ fontSize: "12px", fontWeight: "bold" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[1].bm1[1].l1}
                              </Typography>
                              <Typography
                                align="center"
                                style={{ fontSize: "8px" }}
                              >
                                {matchOdds &&
                                  matchOdds.t2 &&
                                  matchOdds.t2[1].bm1[1].ls1}
                              </Typography>
                            </Container>
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography
                          align="center"
                          style={{
                            color: "red",
                            fontWeight: "bold",
                            fontSize: "13px",
                            paddingRight: "20px",
                          }}
                        >
                          {matchOdds &&
                            matchOdds.t2 &&
                            matchOdds.t2[1].bm1[1].s}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </div>
              ) : (
                <div></div>
              )}
              {matchOdds &&
                matchOdds.t4 &&
                matchOdds.t4.map((ele) => {
                  return ele.nat.includes("Toss") ? (
                    <div>
                      <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        style={{
                          paddingLeft: "10px",
                          paddingTop: "10px",
                          paddingBottom: "10px",
                          paddingRight: "10px",
                          backgroundColor: "#f2f0f0",
                        }}
                      >
                        <Grid item>
                          <Grid container direction="row" alignItems="center">
                            <Grid item>
                              <Typography
                                align="center"
                                style={{ fontSize: "13px", fontWeight: "bold" }}
                              >
                                Toss
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item>
                          <Grid
                            container
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Grid item>
                              <Container
                                style={{
                                  width: "60px",
                                  align: "center",
                                  backgroundColor: '"#f2f0f0',
                                }}
                              >
                                <Typography
                                  align="center"
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    paddingRight: "10px",
                                  }}
                                >
                                  Yes
                                </Typography>
                              </Container>
                            </Grid>
                            <Grid item>
                              <Container
                                style={{
                                  width: "60px",
                                  align: "center",
                                  backgroundColor: '"#f2f0f0',
                                }}
                              >
                                <Typography
                                  align="center"
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  No
                                </Typography>
                              </Container>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      <div
                        style={{
                          borderBottomStyle: "solid",
                          borderWidth: "1px",
                          borderColor: "#e6e5e3",
                        }}
                      >
                        <Grid
                          container
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          style={{
                            paddingLeft: "10px",
                            paddingBottom: "3px",
                            backgroundColor: "white",
                          }}
                        >
                          <Grid
                            item
                            xs={6}
                            container
                            alignItems="center"
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Grid item xs={10}>
                              <Typography
                                align="start"
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "normal",
                                }}
                              >
                                {ele.nat}
                              </Typography>
                            </Grid>
                            <Grid item xs={2}>
                              <Typography
                                align="start"
                                style={{
                                  fontSize: "10px",
                                  color: "red",
                                }}
                              >
                                {bidData &&
                                  bidData.fancy2 &&
                                  bidData.fancy2[`${ele.sid}`]}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Grid item>
                            {ele.gstatus === "" ? (
                              <Grid
                                container
                                direction="row"
                                justifyContent="center"
                              >
                                <Grid
                                  item
                                  onClick={toggleDrawer(
                                    "fancy2",
                                    ele.sid,
                                    "green",
                                    `Back ${ele.nat}`,
                                    ele.b1,
                                    0,
                                    "bottom",
                                    true
                                  )}
                                >
                                  <Container
                                    style={{
                                      width: "70px",
                                      align: "center",
                                      backgroundColor: "#A7D9FE",
                                    }}
                                  >
                                    <Typography
                                      align="center"
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {ele.b1}
                                    </Typography>
                                    <Typography
                                      align="center"
                                      style={{ fontSize: "8px" }}
                                    >
                                      {ele.bs1}
                                    </Typography>
                                  </Container>
                                </Grid>
                                <Grid
                                  item
                                  style={{ paddingLeft: "3px" }}
                                  onClick={toggleDrawer(
                                    "fancy2",
                                    ele.sid,
                                    "red",
                                    `Lay ${ele.nat}`,
                                    ele.l1,
                                    0,
                                    "bottom",
                                    true
                                  )}
                                >
                                  <Container
                                    style={{
                                      width: "70px",
                                      align: "center",
                                      backgroundColor: "#F9CAD4",
                                    }}
                                  >
                                    <Typography
                                      align="center"
                                      style={{
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {ele.l1}
                                    </Typography>
                                    <Typography
                                      align="center"
                                      style={{ fontSize: "8px" }}
                                    >
                                      {ele.ls1}
                                    </Typography>
                                  </Container>
                                </Grid>
                              </Grid>
                            ) : (
                              <Typography
                                align="center"
                                style={{
                                  color: "black",

                                  fontSize: "12px",
                                  paddingRight: "20px",
                                }}
                              >
                                {ele.gstatus}
                              </Typography>
                            )}
                          </Grid>
                        </Grid>
                      </div>{" "}
                    </div>
                  ) : (
                    <div></div>
                  );
                })}
              {matchOdds && matchOdds.t3 ? (
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{
                    paddingLeft: "10px",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    paddingRight: "10px",
                    backgroundColor: "#f2f0f0",
                  }}
                >
                  <Grid item>
                    <Grid container direction="row" alignItems="center">
                      <Grid item>
                        <Typography
                          align="center"
                          style={{ fontSize: "13px", fontWeight: "bold" }}
                        >
                          Fancy
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Container
                          style={{
                            width: "60px",
                            align: "center",
                            backgroundColor: '"#f2f0f0',
                          }}
                        >
                          <Typography
                            align="center"
                            style={{
                              fontSize: "10px",
                              fontWeight: "bold",
                              paddingRight: "10px",
                            }}
                          >
                            Yes
                          </Typography>
                        </Container>
                      </Grid>
                      <Grid item>
                        <Container
                          style={{
                            width: "60px",
                            align: "center",
                            backgroundColor: '"#f2f0f0',
                          }}
                        >
                          <Typography
                            align="center"
                            style={{ fontSize: "10px", fontWeight: "bold" }}
                          >
                            No
                          </Typography>
                        </Container>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <></>
              )}
              {matchOdds &&
                matchOdds.t3 &&
                matchOdds.t3.map((ele) => {
                  return (
                    <div
                      style={{
                        borderBottomStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "#e6e5e3",
                      }}
                    >
                      <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        style={{
                          paddingLeft: "10px",
                          paddingTop: "3px",
                          paddingBottom: "3px",
                          backgroundColor: "white",
                        }}
                      >
                        <Grid
                          item
                          xs={6}
                          container
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Grid item xs={10}>
                            <Typography
                              align=""
                              style={{ fontSize: "12px", fontWeight: "normal" }}
                            >
                              {ele.nat}
                            </Typography>
                          </Grid>

                          <Grid item xs={2}>
                            <Typography
                              align="start"
                              style={{
                                fontSize: "10px",
                                color: "red",
                              }}
                            >
                              {bidData &&
                                bidData.fancy &&
                                bidData.fancy[`${ele.sid}`]}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid item>
                          {ele.gstatus === "" ? (
                            <Grid
                              container
                              direction="row"
                              justifyContent="center"
                            >
                              <Grid
                                item
                                onClick={toggleDrawer(
                                  "fancy",
                                  ele.sid,
                                  "green",
                                  `Back ${ele.nat}`,
                                  ele.bs1,
                                  0,
                                  "bottom",
                                  true
                                )}
                              >
                                <Container
                                  style={{
                                    width: "70px",
                                    align: "center",
                                    backgroundColor: "#A7D9FE",
                                  }}
                                >
                                  <Typography
                                    align="center"
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {ele.b1}
                                  </Typography>
                                  <Typography
                                    align="center"
                                    style={{ fontSize: "8px" }}
                                  >
                                    {ele.bs1}
                                  </Typography>
                                </Container>
                              </Grid>
                              <Grid
                                item
                                style={{ paddingLeft: "3px" }}
                                onClick={toggleDrawer(
                                  "fancy",
                                  ele.sid,
                                  "red",
                                  `Lay ${ele.nat}`,
                                  ele.ls1,
                                  0,
                                  "bottom",
                                  true
                                )}
                              >
                                <Container
                                  style={{
                                    width: "70px",
                                    align: "center",
                                    backgroundColor: "#F9CAD4",
                                  }}
                                >
                                  <Typography
                                    align="center"
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {ele.l1}
                                  </Typography>
                                  <Typography
                                    align="center"
                                    style={{ fontSize: "8px" }}
                                  >
                                    {ele.ls1}
                                  </Typography>
                                </Container>
                              </Grid>
                            </Grid>
                          ) : (
                            <Typography
                              align="center"
                              style={{
                                color: "black",

                                fontSize: "12px",
                                paddingRight: "20px",
                              }}
                            >
                              {ele.gstatus}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </div>
                  );
                })}
              <Container style={{ height: "30px" }}></Container>
              {matchOdds &&
                matchOdds.t4 &&
                matchOdds.t4.map((ele) => {
                  return (
                    <div
                      style={{
                        borderBottomStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "#e6e5e3",
                      }}
                    >
                      <Grid
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        style={{
                          paddingLeft: "10px",
                          paddingBottom: "3px",
                          backgroundColor: "white",
                        }}
                      >
                        <Grid
                          item
                          xs={6}
                          container
                          alignItems="center"
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Grid item xs={10}>
                            <Typography
                              align="start"
                              style={{ fontSize: "12px", fontWeight: "normal" }}
                            >
                              {ele.nat}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography
                              align="start"
                              style={{
                                fontSize: "10px",
                                color: "red",
                              }}
                            >
                              {bidData &&
                                bidData.fancy2 &&
                                bidData.fancy2[`${ele.sid}`]}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid item>
                          {ele.gstatus === "" ? (
                            <Grid
                              container
                              direction="row"
                              justifyContent="center"
                            >
                              <Grid
                                item
                                onClick={toggleDrawer(
                                  "fancy2",
                                  ele.sid,
                                  "green",
                                  `Back ${ele.nat}`,
                                  ele.b1,
                                  0,
                                  "bottom",
                                  true
                                )}
                              >
                                <Container
                                  style={{
                                    width: "70px",
                                    align: "center",
                                    backgroundColor: "#A7D9FE",
                                  }}
                                >
                                  <Typography
                                    align="center"
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {ele.b1}
                                  </Typography>
                                  <Typography
                                    align="center"
                                    style={{ fontSize: "8px" }}
                                  >
                                    {ele.bs1}
                                  </Typography>
                                </Container>
                              </Grid>
                              <Grid
                                item
                                style={{ paddingLeft: "3px" }}
                                onClick={toggleDrawer(
                                  "fancy2",
                                  ele.sid,
                                  "red",
                                  `Lay ${ele.nat}`,
                                  ele.l1,
                                  0,
                                  "bottom",
                                  true
                                )}
                              >
                                <Container
                                  style={{
                                    width: "70px",
                                    align: "center",
                                    backgroundColor: "#F9CAD4",
                                  }}
                                >
                                  <Typography
                                    align="center"
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {ele.l1}
                                  </Typography>
                                  <Typography
                                    align="center"
                                    style={{ fontSize: "8px" }}
                                  >
                                    {ele.ls1}
                                  </Typography>
                                </Container>
                              </Grid>
                            </Grid>
                          ) : (
                            <Typography
                              align="center"
                              style={{
                                color: "black",

                                fontSize: "12px",
                                paddingRight: "20px",
                              }}
                            >
                              {ele.gstatus}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </div>
                  );
                })}
            </div>
          )

          // <BackLay
          //   status=
          //   team1R={matchOdds && matchOdds[0] && matchOdds[0].runners[0].status}
          //   team2R={matchOdds && matchOdds[0] && matchOdds[0].runners[1].status}
          //   title="Match Odds"
          //   team1={`${params.team1}`}
          //   team2={`${params.team2}`}
          //   back={`${matchOdds && matchOdds[0] && matchOdds[0].runners[0].ex.availableToBack[0].price}`}
          //   backSize={`${matchOdds && matchOdds[0] && matchOdds[0].runners[0].ex.availableToBack[0].size}`}
          //   lay={`${matchOdds && matchOdds[0] && matchOdds[0].runners[0].ex.availableToLay[0].price}`}
          //   laySize={`${matchOdds && matchOdds[0] && matchOdds[0].runners[0].ex.availableToLay[0].size}`}
          //   back1={`${matchOdds && matchOdds[0] && matchOdds[0].runners[1].ex.availableToBack[0].price}`}
          //   back1Size={`${matchOdds && matchOdds[0] && matchOdds[0].runners[1].ex.availableToBack[0].size}`}
          //   lay1={`${matchOdds && matchOdds[0] && matchOdds[0].runners[1].ex.availableToLay[0].price}`}
          //   lay1Size={`${matchOdds && matchOdds[0] && matchOdds[0].runners[1].ex.availableToLay[0].size}`}
          // ></BackLay>
        }
      </div>
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
      {/* <Dialog
        open={cashoutDialog}
        onClose={(e) => closeCashOutDialog(e)}
        PaperProps={{
          style: {
            backgroundColor: "white",
            boxShadow: "none",
          },
        }}
      >
        <div style={{ padding: "20px" }}>
          {bidHistory && bidHistory.map &&
            bidHistory.length !== 0 ? bidHistory.map((ele) => {
              return (
                <Container>
                  <Grid
                    container
                    direction="row"
                    alignItems="center"
                    style={{
                      backgroundColor: "white",
                    }}
                  >
                    <Grid item>
                      <Typography
                        style={{ fontSize: "12px", fontWeight: "bold" }}
                      >
                        Amount: ₹{ele.amount}
                      </Typography>
                      <Typography
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "blue",
                        }}
                      >
                        {ele.bid}
                      </Typography>
                    </Grid>
                    <Grid item style={{ paddingLeft: "20px" }}>
                      <Container
                        onClick={(e) => cashout(e)}
                        style={{
                          width: "60px",
                          borderRadius: "10px",
                          backgroundColor: "orange",
                        }}
                      >
                        <Typography
                          style={{ marginLeft: "-5px", fontSize: "10px" }}
                        >
                          CashOut
                        </Typography>
                      </Container>
                      <Typography
                        style={{ paddingLeft: "8px", fontSize: "10px" }}
                      >
                        return ₹{ele.amount}
                      </Typography>
                    </Grid>
                  </Grid>
                </Container>
              );
            }) : <Typography>No bets</Typography>}
        </div>
      </Dialog> */}
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
        onClose={toggleDrawer("", "", "", "", "", "", "bottom", false)}
      >
        <div>
          <Box display="flex" height={50} bgcolor={state.color}>
            <Box m="auto">
              <Typography style={{ color: "white" }}>{state.title}</Typography>
            </Box>
          </Box>
          {state.type === "match" || state.type === "bookmaker" ? (
            <Paper style={{ backgroundColor: "#D8D8D8", margin: "10px" }}>
              <Grid
                container
                direction="row"
                alignItems="center"
                style={{
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  paddingTop: "10px",
                }}
              >
                <Grid item>
                  <Typography
                    align="start"
                    style={{
                      fontWeight: "bold",
                      fontSize: "12px",
                      paddingRight: "5px",
                    }}
                  >
                    {state.type === "bookmaker"
                      ? params.team2 + " -> "
                      : params.team1 + " -> "}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    align="center"
                    style={{
                      fontWeight: "bold",
                      fontSize: "12px",
                      color:
                        state.type === "bookmaker"
                          ? betAmount.book.teamAAmount > 0
                            ? "green"
                            : "red"
                          : betAmount.match.teamAAmount > 0
                          ? "green"
                          : "red",
                      paddingRight: "15px",
                    }}
                  >
                    {state.type === "bookmaker"
                      ? betAmount.book?.teamAAmount?.toFixed(1) ?? 0
                      : betAmount.match?.teamAAmount?.toFixed(1) ?? 0}
                  </Typography>
                </Grid>

                <Grid item></Grid>
              </Grid>
              <Container
                style={{
                  backgroundColor: "grey",
                  height: "1px",
                  width: "100%",
                }}
              ></Container>
              <Grid
                container
                direction="row"
                alignItems="center"
                style={{
                  paddingLeft: "10px",
                  paddingTop: "5px",
                  paddingBottom: "10px",
                }}
              >
                <Grid item>
                  <Typography
                    align="start"
                    style={{
                      fontWeight: "bold",
                      fontSize: "12px",
                      paddingRight: "5px",
                    }}
                  >
                    {state.type === "bookmaker"
                      ? params.team1 + " -> "
                      : params.team2 + " -> "}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    align="center"
                    style={{
                      fontWeight: "bold",
                      fontSize: "12px",
                      color:
                        state.type === "bookmaker"
                          ? betAmount.book.teamBAmount > 0
                            ? "green"
                            : "red"
                          : betAmount.match.teamBAmount > 0
                          ? "green"
                          : "red",
                      paddingRight: "15px",
                    }}
                  >
                    {state.type === "bookmaker"
                      ? betAmount.book?.teamBAmount?.toFixed(1) ?? 0
                      : betAmount.match?.teamBAmount?.toFixed(1) ?? 0}
                  </Typography>
                </Grid>

                <Grid item></Grid>
              </Grid>
            </Paper>
          ) : (
            <div></div>
          )}

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
                  style={{
                    backgroundColor: amount === 100 ? "grey" : "#D8D8D8",

                    width: "100%",
                  }}
                  onClick={handleAmount(100)}
                >
                  100
                </Button>
              </Grid>
              <Grid item xs={2}>
                <Button
                  style={{
                    backgroundColor: amount === 500 ? "grey" : "#D8D8D8",
                    width: "100%",
                  }}
                  onClick={handleAmount(500)}
                >
                  500
                </Button>
              </Grid>
              <Grid item xs={2}>
                <Button
                  style={{
                    backgroundColor: amount === 1000 ? "grey" : "#D8D8D8",
                    width: "100%",
                  }}
                  onClick={handleAmount(1000)}
                >
                  1000
                </Button>
              </Grid>
              <Grid item xs={2}>
                <Button
                  style={{
                    backgroundColor: amount === 10000 ? "grey" : "#D8D8D8",
                    width: "100%",
                  }}
                  onClick={handleAmount(10000)}
                >
                  10000
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
                <InputLabel></InputLabel>
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

          <Container style={{ height: "20px" }}></Container>
          <Typography align="center" style={{ fontSize: "12px", color: "red" }}>
            Bet will be placed at market rate!
          </Typography>
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
            <Grid
              item
              xs={6}
              onClick={toggleDrawer("", "", "", "", "", "", "bottom", false)}
            >
              <Box display="flex" height={50} bgcolor="#D8D8D8">
                <Box m="auto">
                  <Typography>Cancel</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid
              item
              xs={6}
              onClick={
                amount >= 100
                  ? handleFormData({
                      type: state.type,
                      matchId: params.match,
                      id: state.id,
                      marketId: params.id,
                      market: state.market,
                      team: state.team,
                      title: state.title,
                      amount: amount,
                    })
                  : (e) => handleDialog(e, "Minimum amount 100")
              }
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
    </>
  );
};
