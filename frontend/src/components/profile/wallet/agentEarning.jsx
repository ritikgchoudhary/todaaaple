import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  TableContainer,
  Table,
  TableRow,
  Container,
  TableCell,
  TableHead,
  TableBody,
  Dialog,
  CircularProgress,
  Button,
  DialogContent,
  Box,
  CardContent,
  Card,
  Avatar,
  Paper,
} from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Link } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

const AgentEarning = () => {
  const dispatch = useDispatch();
  const [isAuth, setAuth] = useState(false);
  const history = useHistory();
  const URL = api.url;
  const [earning, setEarning] = useState(
    {
      dailyTask: { today: 0, total: 0 },
      refer: { today: 0, total: 0 },
      level0: { today: 0, total: 0 },
      level1: { today: 0, total: 0 },
      level2: { today: 0, total: 0 },
      level3: { today: 0, total: 0 },
      level4: { today: 0, total: 0 },
      level5: { today: 0, total: 0 },
      level6: { today: 0, total: 0 }
    }
  );

  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [loader, setLoader] = React.useState(true);
  const [ruleDialog, setRule] = React.useState(false);
  const ruleClose = () => {
    setRule(false);
  };
  const openRule = () => {
    setRule(true);
  };

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getAgentEarnings/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setEarning(response.data);
          setLoader(false);
        })
        .catch((error) => {});
    } else {
      history.push("/login");
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: "white",
        minHeight: "100vh",
        paddingBottom: "100px",
      }}
    >
      <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogContent style={{ backgroundColor: 'white', color: 'black' }}>
          <Typography 
            align="center" 
            style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              paddingBottom: '20px',
              color: '#05c0b8'
            }}
          >
            AGENT EARNINGS / एजेंट कमाई
          </Typography>

          <Typography 
            align="left" 
            style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '15px',
              color: '#05c0b8'
            }}
          >
            RECHARGE BONUS / रिचार्ज बोनस
          </Typography>

          <TableContainer component={Paper} style={{ marginBottom: '20px', backgroundColor: 'white' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>LEVEL</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>BONUS</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>EXAMPLE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { level: "Level 1", bonus: "3%", example: "₹10,000 → ₹300" }
                ].map((tier, index) => (
                  <TableRow key={index}>
                    <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>{tier.level}</TableCell>
                    <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>{tier.bonus}</TableCell>
                    <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>{tier.example}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography 
            align="left" 
            style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '15px',
              color: '#05c0b8'
            }}
          >
            TERMS AND CONDITIONS / नियम और शर्तें
          </Typography>

          <ul style={{ paddingLeft: '20px', color: 'black' }}>
            <li style={{ marginBottom: '10px' }}>
              Bonus is credited automatically to your wallet when your downline members recharge
              <br />
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                जब आपके डाउनलाइन सदस्य रिचार्ज करते हैं तो बोनस स्वचालित रूप से आपके वॉलेट में जमा हो जाता है
              </span>
            </li>
            <li style={{ marginBottom: '10px' }}>
              Bonus is calculated on the recharge amount before any deductions
              <br />
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                बोनस की गणना किसी भी कटौती से पहले रिचार्ज राशि पर की जाती है
              </span>
            </li>
            <li style={{ marginBottom: '10px' }}>
              Bonus is credited instantly after successful recharge
              <br />
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                सफल रिचार्ज के बाद बोनस तुरंत जमा हो जाता है
              </span>
            </li>
            <li style={{ marginBottom: '10px' }}>
              Bonus is available for all levels (1-7) of your downline
              <br />
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                बोनस आपके डाउनलाइन के सभी लेवल (1-7) के लिए उपलब्ध है
              </span>
            </li>
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog
        open={loader}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <Container align="center" style={{backgroundColor: 'black', opacity: '0.6', height: '100px', paddingTop: "10px"}}>
          <CircularProgress style={{color: 'white'}} />
          <Typography style={{paddingTop: '10px', color: "white"}}>Please Wait!</Typography>
        </Container>
      </Dialog>

      <Dialog
        open={openDialog.open}
        onClose={dialogClose}
        PaperProps={{
          style: {
            boxShadow: 'none',
          },
        }}
      >
        <Container>
          <Typography style={{padding: '10px', color: "black"}}>{openDialog.body}</Typography>
        </Container>
      </Dialog>

      <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px', paddingTop: '15px', paddingBottom: '15px', paddingRight: '20px', backgroundColor: '#05c0b8'}}>
        <Grid item xs={4}>  
          <ArrowBackIosIcon style={{fontSize:'20px', color: 'white'}} onClick={history.goBack} />
        </Grid>
        <Grid item xs={4}>                    
          <Typography align="center" style={{color: 'white'}}>Agent Earning</Typography>
        </Grid>
      </Grid>

      <TableContainer style={{marginTop: '20px'}}>
        <Table aria-label="earning table">
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{fontWeight: 'bold', color:'white', backgroundColor: '#05c0b8'}}>EARNING TYPE</TableCell>
              <TableCell align="center" style={{fontWeight: 'bold', color:'white', backgroundColor: '#05c0b8'}}>TODAY</TableCell>
              <TableCell align="center" style={{fontWeight: 'bold', color:'white', backgroundColor: '#05c0b8'}}>TOTAL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center" style={{backgroundColor: '#f5f5f5', color:'black'}}>
                Daily Salary
              </TableCell>
              <TableCell align="center" style={{backgroundColor: '#f5f5f5', color:'black', fontWeight: 'bold'}}>
                ₹{earning?.dailyTask?.today ?? 0}
              </TableCell>
              <TableCell align="center" style={{backgroundColor: '#f5f5f5', color:'black', fontWeight: 'bold'}}>
                ₹{earning?.dailyTask?.total ?? 0}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" style={{backgroundColor: 'white', color:'black'}}>
                Referral Bonus
              </TableCell>
              <TableCell align="center" style={{backgroundColor: 'white', color:'black', fontWeight: 'bold'}}>
                ₹{earning?.refer?.today ?? 0}
              </TableCell>
              <TableCell align="center" style={{backgroundColor: 'white', color:'black', fontWeight: 'bold'}}>
                ₹{earning?.refer?.total ?? 0}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" style={{backgroundColor: '#f5f5f5', color:'black'}}>
                Level 1 Recharge Bonus
              </TableCell>
              <TableCell align="center" style={{backgroundColor: '#f5f5f5', color:'black', fontWeight: 'bold'}}>
                ₹{earning?.level0?.today ?? 0}
              </TableCell>
              <TableCell align="center" style={{backgroundColor: '#f5f5f5', color:'black', fontWeight: 'bold'}}>
                ₹{earning?.level0?.total ?? 0}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Container style={{paddingTop: '20px'}}>
        <Container align="center">
          <Button
            variant="contained"
            style={{ 
              backgroundColor: '#05c0b8',
              color: 'white',
              padding: '10px 20px',
              fontWeight: 'bold'
            }}
            onClick={openRule}
          >
            How it works?
          </Button>
        </Container>
      </Container>
    </div>
  );
};

export default AgentEarning;
