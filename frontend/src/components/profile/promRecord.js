import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  CircularProgress,
  Box,
  Button,
  Fade
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Link } from "react-router-dom";
import * as api from "../../api/auth";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";

const PromotionRecord = () => {
  const params = useParams();
  const history = useHistory();
  const URL = api.url;
  const [levelData, setLevelData] = useState([]);
  const [levelDataNew, setLevelDataNew] = useState({});
  const [liveBalance, setLiveBalance] = useState({});
  const [loader, setLoader] = React.useState(false);

  const fetchLiveBalance = (e , phone) => {
    e.preventDefault();
    const loggedInUser = localStorage.getItem("user");
    const foundUser = JSON.parse(loggedInUser);
    const AuthStr = "Bearer ".concat(foundUser.token);
    axios
        .get(`${URL}/getPromotionLiveBalance/${foundUser.result.id}/${phone}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setLiveBalance({...liveBalance, [response.data.phone]: response.data.amount});
        })
        .catch((error) => {
          console.log(error);
          // history.push("/login");
        });
   
  }

  useEffect(() => {
    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getPromotionFull/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
        
          setLevelData(response.data);
          setLoader(false);
        })
        .catch((error) => {
          console.log(error);
          history.push("/login");
        });
        axios
        .get(`${URL}/getPromotionNew/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setLevelDataNew(response.data);
        })
        .catch((error) => {
          console.log(error);
          history.push("/login");
        });  
    } else {
      history.push("/login");
    }
  }, []);

  // const getRecharge = (phoneNumber) => {

  //   var memberRequest = new XMLHttpRequest();
  //   memberRequest.onreadystatechange = function () {
  //     if (memberRequest.readyState === 4 && memberRequest.status === 200) {
  //       const response = JSON.parse(memberRequest.response);
  //       setMemberRecharge(response);

  //     }
  //   };
  //   memberRequest.open("GET", `https://secured.servider.net/playerJankaari/${phoneNumber}`, true);
  //   memberRequest.send();
  //   setRule(true);

  // }
  const [user, setUser] = useState([{ bonus: "Loading" }]);
  const [level, setLevel] = useState(0);
  const handleLevel = (level) => async (event) => {
    console.log(level);
    setLevel(level);
  };

  // Add helper function to safely get level data
  const getLevelData = (levelNum, phone, field) => {
    try {
      return levelData?.[`level${levelNum}`]?.[phone]?.[field] || 0;
    } catch {
      return 0;
    }
  };

  // Add helper function to safely get new level data
  const getNewLevelData = (levelNum, phone, field) => {
    try {
      return levelDataNew?.[`level${levelNum}`]?.[phone]?.[field] || 0;
    } catch {
      return 0;
    }
  };

  return (
    <div style={{backgroundColor: "white", minHeight: '100vh', paddingBottom: '100px'}}>
      {/* Loading Dialog */}
      <Dialog
        open={loader}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <Container align="center" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '15px'
        }}>
          <CircularProgress style={{color: 'white'}} />
          <Typography style={{
            paddingTop: '15px',
            color: "white",
            fontSize: '16px'
          }}>
            Please Wait!
          </Typography>
        </Container>
      </Dialog>

      {/* Header */}
      <Box 
        style={{
          backgroundColor: '#05c0b8',
          borderRadius: '0 0 20px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}
      >
        <Grid container alignItems="center" style={{padding: '15px 20px'}}>
          <Grid item xs={4}>
            <ArrowBackIosIcon 
              style={{
                fontSize: '20px',
                color: 'white',
                cursor: 'pointer'
              }} 
              onClick={history.goBack} 
            />
          </Grid>
          <Grid item xs={4}>
            <Typography align="center" style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 500
            }}>
              Full Promotion Record
            </Typography>
          </Grid>
        </Grid>

        <Typography 
          align="center" 
          style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            padding: '0 20px 20px'
          }}
        >
          Full Promotion Record - Get full details of your total invites including today.
        </Typography>
      </Box>

      {/* Level Selection */}
      <Container style={{marginBottom: '20px'}}>
        <Grid container spacing={1}>
          {[...Array(7)].map((_, index) => (
            <Grid item xs={index === 0 ? 12 : 4} key={index}>
              <Button
                fullWidth
                onClick={handleLevel(index)}
                style={{
                  backgroundColor: level === index ? '#05c0b8' : 'transparent',
                  border: '1px solid #05c0b8',
                  borderRadius: '8px',
                  padding: '8px',
                  color: level === index ? 'white' : '#05c0b8',
                  textTransform: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                Level {index + 1}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Data Table */}
      <Container style={{ 
        padding: '0 16px',
        maxWidth: '100%'
      }}>
        <TableContainer 
          component={Paper} 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '15px',
            overflow: 'auto',
            width: '100%',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: '#05c0b8' }}>
                <TableCell 
                  align="left" 
                  style={{ 
                    color: "white",
                    fontWeight: 500,
                    padding: '16px',
                    fontSize: '16px',
                    width: '20%'
                  }}
                >
                  Phone
                </TableCell>
                <TableCell 
                  align="center" 
                  style={{ 
                    color: "white",
                    fontWeight: 500,
                    padding: '16px',
                    fontSize: '16px',
                    width: '16%'
                  }}
                >
                  Total Recharge
                </TableCell>
                <TableCell 
                  align="center" 
                  style={{ 
                    color: "white",
                    fontWeight: 500,
                    padding: '16px',
                    fontSize: '16px',
                    width: '16%'
                  }}
                >
                  Total WithDrawal
                </TableCell>
                <TableCell 
                  align="center" 
                  style={{ 
                    color: "white",
                    fontWeight: 500,
                    padding: '16px',
                    fontSize: '16px',
                    width: '16%'
                  }}
                >
                  Today WithDrawal
                </TableCell>
                <TableCell 
                  align="center" 
                  style={{ 
                    color: "white",
                    fontWeight: 500,
                    padding: '16px',
                    fontSize: '16px',
                    width: '16%'
                  }}
                >
                  Today Bid
                </TableCell>
                <TableCell 
                  align="center" 
                  style={{ 
                    color: "white",
                    fontWeight: 500,
                    padding: '16px',
                    fontSize: '16px',
                    width: '16%'
                  }}
                >
                  Today Recharge
                </TableCell>
                <TableCell 
                  align="right" 
                  style={{ 
                    color: "white",
                    fontWeight: 500,
                    padding: '16px',
                    fontSize: '16px',
                    width: '16%'
                  }}
                >
                  Live Balance
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {levelData && levelData[`level${level}`] &&
                Object.keys(levelData[`level${level}`]).map((phone, idx) => (
                  <TableRow 
                    key={phone}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white'
                    }}
                  >
                    <TableCell
                      align="left"
                      component="th"
                      scope="row"
                      style={{ 
                        color: '#333',
                        padding: '16px',
                        fontSize: '16px'
                      }}
                    >
                      {phone}
                    </TableCell>
                    <TableCell 
                      align="center" 
                      style={{ 
                        color: '#333',
                        padding: '16px',
                        fontSize: '16px'
                      }}
                    >
                      ₹{getLevelData(level, phone, 'totalRecharge')}
                    </TableCell>
                    <TableCell 
                      align="center" 
                      style={{ 
                        color: '#333',
                        padding: '16px',
                        fontSize: '16px'
                      }}
                    >
                      ₹{getLevelData(level, phone, 'totalWithdrawal')}
                    </TableCell>
                    <TableCell 
                      align="center" 
                      style={{ 
                        color: '#333',
                        padding: '16px',
                        fontSize: '16px'
                      }}
                    >
                      ₹{getNewLevelData(level, phone, 'todayWithdrawal')}
                    </TableCell>
                    <TableCell 
                      align="center" 
                      style={{ 
                        color: '#333',
                        padding: '16px',
                        fontSize: '16px'
                      }}
                    >
                      ₹{getNewLevelData(level, phone, 'bidToday')}
                    </TableCell>
                    <TableCell 
                      align="center" 
                      style={{ 
                        color: '#333',
                        padding: '16px',
                        fontSize: '16px'
                      }}
                    >
                      ₹{getNewLevelData(level, phone, 'todayRecharge')}
                    </TableCell>
                    <TableCell 
                      align="right" 
                      style={{ 
                        padding: '16px'
                      }}
                    >
                      {liveBalance[phone] ? (
                        <Typography style={{
                          color: '#333',
                          fontSize: '16px'
                        }}>
                          ₹{liveBalance[phone].toFixed(2)}
                        </Typography>
                      ) : (
                        <Button
                          size="small"
                          onClick={e => fetchLiveBalance(e, phone)}
                          style={{
                            backgroundColor: '#05c0b8',
                            color: 'white',
                            textTransform: 'none',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            float: 'right'
                          }}
                        >
                          Fetch Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </div>
  );
};

export default PromotionRecord;
