import React, { useState, useEffect } from 'react';
import { Typography, Grid, TableContainer, Table, TableRow, Container, TableCell, TableHead, TableBody, Dialog, CircularProgress, Button, DialogContent, Paper, Box, Chip } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { makeStyles } from "@material-ui/core/styles";
import * as api from "../../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F5F9",
    display: "flex",
    justifyContent: "center",
    paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
  },
  frame: {
    width: "100%",
    maxWidth: 500,
    minHeight: "100vh",
    backgroundColor: "#fff",
    position: 'relative',
    paddingBottom: '20px'
  },
  header: {
    backgroundColor: '#05c0b8',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerTitle: {
    color: 'white',
    flexGrow: 1,
    textAlign: 'center',
    fontWeight: 600,
    marginRight: '20px'
  },
  section: {
    margin: '20px',
    padding: '15px',
    borderRadius: '10px'
  }
}));

const MySalary = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [isAuth, setAuth] = useState(false);
  const history = useHistory();
  const URL = api.url;
  const [invite, setInvite] = useState();
  const [memberProgress, setMemberProgress] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [highestAvailable, setHighestAvailable] = useState(0);
  const [isClaimingTime, setIsClaimingTime] = useState(false);

  const [openDialog, setDialog] = React.useState({ open: false, body: '' });
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

  // Check if current time is between 12am-10am
  const checkClaimingTime = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 0 && hours < 10; // 12am to 10am
  };

  useEffect(() => {

    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {

      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = 'Bearer '.concat(foundUser.token);
      axios.get(`${URL}/getSalaryTask/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(response => {
          if (response.data.tasks) {
            setInvite(response.data.tasks);
            setMemberProgress(response.data.memberProgress || []);
            setHighestAvailable(response.data.highestAvailable || 0);
          } else {
            setInvite(response.data); // Handle old API format
          }
          setLoader(false);
          setIsClaimingTime(checkClaimingTime());

        })
        .catch((error) => {
          console.log(error);
          setLoader(false);
        });

    } else {
      history.push('/login');

    }

  }, []);

  const handleSubmit = async (e, id) => {
    e.preventDefault();

    // Check if it's claiming time
    if (!isClaimingTime) {
      setDialog({ ...openDialog, open: true, body: 'Salary can only be claimed between 12:00 AM - 10:00 AM for previous day performance.' });
      return;
    }

    // Check if trying to claim the highest available level
    if (id !== highestAvailable) {
      setDialog({ ...openDialog, open: true, body: 'You can only claim the highest available salary level.' });
      return;
    }

    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    const foundUser = JSON.parse(loggedInUser);

    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/claimSalary/${foundUser.result.id}/${id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
        history.goBack();
        setDialog({ ...openDialog, open: true, body: `Successfully Claimed Salary Level ${id}!` });

      })
      .catch((error) => {
        setLoader(false);
        setDialog({ ...openDialog, open: true, body: error.response?.data || 'An error occurred while claiming salary.' });
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
              AGENT DAILY SALARY
            </Typography>

            <TableContainer component={Paper} style={{ marginBottom: '20px', backgroundColor: 'white' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>LEVEL</TableCell>
                    <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>SALARY</TableCell>
                    <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>REQUIREMENTS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      level: "Level 1",
                      salary: 600,
                      reqs: "10 Active Players (5 Level 1)\n3 Downline Recharge\n₹5,000 Total Bid"
                    },
                    {
                      level: "Level 2",
                      salary: 1100,
                      reqs: "20 Active Players (8 Level 1)\n6 Downline Recharge\n₹10,000 Total Bid"
                    },
                    {
                      level: "Level 3",
                      salary: 2600,
                      reqs: "40 Active Players (11 Level 1)\n9 Downline Recharge\n₹20,000 Total Bid"
                    },
                    {
                      level: "Level 4",
                      salary: 4100,
                      reqs: "60 Active Players (14 Level 1)\n13 Downline Recharge\n₹30,000 Total Bid"
                    },
                    {
                      level: "Level 5",
                      salary: 6100,
                      reqs: "80 Active Players (17 Level 1)\n16 Downline Recharge\n₹40,000 Total Bid"
                    },
                    {
                      level: "Level 6",
                      salary: 8100,
                      reqs: "100 Active Players (21 Level 1)\n19 Downline Recharge\n₹50,000 Total Bid"
                    },
                    {
                      level: "Level 7",
                      salary: 10000,
                      reqs: "125 Active Players (24 Level 1)\n22 Downline Recharge\n₹62,500 Total Bid"
                    },
                    {
                      level: "Level 8",
                      salary: 13000,
                      reqs: "150 Active Players (27 Level 1)\n25 Downline Recharge\n₹75,000 Total Bid"
                    },
                    {
                      level: "Level 9",
                      salary: 20000,
                      reqs: "200 Active Players (30 Level 1)\n28 Downline Recharge\n₹100,000 Total Bid"
                    }
                  ].map((tier, index) => (
                    <TableRow key={index}>
                      <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>{tier.level}</TableCell>
                      <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>₹{tier.salary}</TableCell>
                      <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white', whiteSpace: 'pre-line' }}>{tier.reqs}</TableCell>
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
                Active Player is counted only if they bet minimum ₹300 in a day
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  सक्रिय खिलाड़ी तभी गिना जाएगा जब वह दिन में न्यूनतम ₹300 का बेट करे
                </span>
              </li>
              <li style={{ marginBottom: '10px' }}>
                Level 1 players are your direct referrals
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  लेवल 1 के खिलाड़ी आपके सीधे रेफरल हैं
                </span>
              </li>
              <li style={{ marginBottom: '10px' }}>
                Downline Recharge is counted from all levels (Level 1-7 for users) when they make a deposit
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  डाउनलाइन रिचार्ज सभी लेवल से गिना जाता है (यूजर्स के लिए लेवल 1-7) जब वे डिपॉजिट करते हैं
                </span>
              </li>
              <li style={{ marginBottom: '10px' }}>
                Total Bid is the sum of all bets placed by active players in a day
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  कुल बेट एक दिन में सभी सक्रिय खिलाड़ियों द्वारा लगाए गए बेट का योग है
                </span>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>You can only claim the HIGHEST available salary level per day</strong>
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  आप प्रति दिन केवल उच्चतम उपलब्ध सैलरी लेवल ही क्लेम कर सकते हैं
                </span>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <strong>Salary can only be claimed between 12:00 AM - 10:00 AM for previous day performance</strong>
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  सैलरी पिछले दिन के प्रदर्शन के लिए केवल 12:00 AM - 10:00 AM के बीच ही क्लेम की जा सकती है
                </span>
              </li>
              <li style={{ marginBottom: '10px' }}>
                Same IP, Same Bank details, or Same Phone number cannot claim Daily Salary
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  समान IP, समान बैंक विवरण, या समान फोन नंबर से डेली सैलरी नहीं क्लेम की जा सकती
                </span>
              </li>
              <li style={{ marginBottom: '10px' }}>
                For exceptional performance, contact your Agency for better offers
                <br />
                <span style={{ fontSize: '14px', opacity: 0.9 }}>
                  उत्कृष्ट प्रदर्शन के लिए, बेहतर ऑफर के लिए अपनी एजेंसी से संपर्क करें
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
          <Container align="center" style={{ backgroundColor: 'black', opacity: '0.6', height: '100px', paddingTop: "10px" }}>
            <CircularProgress style={{ color: 'white', }} />
            <Typography style={{ paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
          </Container>


        </Dialog>
        <Dialog
          open={openDialog.open}
          onClose={dialogClose}
          PaperProps={{
            style: {
              // backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}


        >
          <Container style={{
            // backgroundColor: 'black', opacity: '0.6', height: '50px'
          }}>
            <Typography style={{ padding: '10px', color: "black" }}>{openDialog.body}</Typography>
          </Container>


        </Dialog>

        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={history.goBack} />
          <Typography className={classes.headerTitle}>Daily Salary</Typography>
        </div>

        {/* Claiming Time Status */}
        <Paper style={{ margin: '20px', padding: '15px', backgroundColor: isClaimingTime ? '#d4edda' : '#f8d7da', border: `1px solid ${isClaimingTime ? '#c3e6cb' : '#f5c6cb'}` }}>
          <Typography align="center" style={{ color: isClaimingTime ? '#155724' : '#721c24', fontWeight: 'bold' }}>
            {isClaimingTime ? '✅ Claiming Time: 12:00 AM - 10:00 AM' : '⏰ Claiming Time: 12:00 AM - 10:00 AM (Previous Day Performance)'}
          </Typography>
        </Paper>

        <Typography align='center' style={{ marginTop: '20px', color: 'black' }}>Total Level 1 Members: {invite && invite[0] && invite[0].members}</Typography>

        {/* Highest Available Level Display */}
        {highestAvailable > 0 && (
          <Paper style={{ margin: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
            <Typography align="center" style={{ color: '#856404', fontWeight: 'bold' }}>
              🏆 Highest Available Level: {highestAvailable}
            </Typography>
            <Typography align="center" style={{ color: '#856404', fontSize: '14px' }}>
              You can only claim this level.
            </Typography>
          </Paper>
        )}

        {/* Member Progress Section */}
        {memberProgress && memberProgress.length > 0 && (
          <Container style={{ marginTop: '20px', marginBottom: '20px' }}>
            <Button
              onClick={() => setShowProgress(!showProgress)}
              fullWidth
              style={{
                backgroundColor: '#05c0b8',
                color: 'white',
                padding: '10px',
                marginBottom: showProgress ? '10px' : '0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <Typography style={{ fontWeight: 'bold', fontSize: '16px' }}>
                Member Activity
              </Typography>
              {showProgress ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Button>

            {showProgress && (
              <Paper style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px' }}>
                <TableContainer component={Paper} style={{ backgroundColor: 'white', marginBottom: '10px', borderRadius: '8px', boxShadow: '0 3px 5px rgba(0,0,0,0.2)' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>Member</TableCell>
                        <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>Level</TableCell>
                        <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>Bid Amount</TableCell>
                        <TableCell style={{ color: 'white', fontWeight: 'bold', backgroundColor: '#05c0b8' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {memberProgress.map((member, index) => (
                        <TableRow key={index}>
                          <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                            {member.name}
                          </TableCell>
                          <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                            {member.level === 'level0' ? 'Direct' : `Level ${member.level.replace('level', '')}`}
                          </TableCell>
                          <TableCell style={{ color: 'black', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                            ₹{member.bidAmount.toLocaleString()}
                          </TableCell>
                          <TableCell style={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                            <Chip
                              label={member.active ? "Active" : "Inactive"}
                              style={{
                                backgroundColor: member.active ? '#A1E8CC' : '#FFD4D4',
                                color: member.active ? '#006400' : '#B00020',
                                fontWeight: 'bold',
                                fontSize: '11px',
                                height: '24px'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box style={{ display: 'flex', justifyContent: 'space-between', color: 'black', padding: '0 10px' }}>
                  <Typography variant="body2">
                    Active Members: {memberProgress.filter(m => m.active).length}/{memberProgress.length}
                  </Typography>
                  <Typography variant="body2">
                    Total Bid: ₹{memberProgress.reduce((sum, member) => sum + member.bidAmount, 0).toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Container>
        )}

        <TableContainer style={{ marginTop: '20px' }}>
          <Table aria-label="salary table">
            <TableHead>
              <TableRow>
                <TableCell align="center" style={{ fontWeight: 'bold', color: 'white', backgroundColor: '#05c0b8' }}>Active Players</TableCell>
                <TableCell align="center" style={{ fontWeight: 'bold', color: 'white', backgroundColor: '#05c0b8' }}>Total Bid</TableCell>
                <TableCell align="center" style={{ fontWeight: 'bold', color: 'white', backgroundColor: '#05c0b8' }}>Daily Salary</TableCell>
                <TableCell align="center" style={{ fontWeight: 'bold', color: 'white', backgroundColor: '#05c0b8' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invite && invite.map((row, index) => (
                <TableRow
                  key={row.id}
                  style={{
                    backgroundColor: row.id === highestAvailable ? '#e8f5e8' : (index % 2 === 0 ? '#f5f5f5' : 'white'),
                    border: row.id === highestAvailable ? '2px solid #05c0b8' : 'none'
                  }}
                >
                  <TableCell align="center" style={{ color: 'black' }}>
                    <Typography>Total: {row.active.current} / {row.active.target}</Typography>
                    <Typography style={{ fontSize: '12px' }}>
                      Direct: {row.active.level0} / {row.active.required.level0}
                    </Typography>
                    <Typography style={{ fontSize: '10px' }}>
                      Recharges: {row.active.downlineRecharge} / {row.active.required.downlineRecharge}
                    </Typography>
                    {row.active.current >= row.active.target && row.active.level0 >= row.active.required.level0 && row.active.downlineRecharge >= row.active.required.downlineRecharge &&
                      <Typography style={{ fontSize: '10px', color: '#05c0b8', fontWeight: 'bold' }}>
                        Completed
                      </Typography>
                    }
                  </TableCell>
                  <TableCell align="center" style={{ color: 'black' }}>
                    <Typography>₹{row.bid.current.toLocaleString()}</Typography>
                    <Typography style={{ fontSize: '12px' }}>
                      Target: ₹{row.bid.target.toLocaleString()}
                    </Typography>
                    {row.bid.current >= row.bid.target &&
                      <Typography style={{ fontSize: '10px', color: '#05c0b8', fontWeight: 'bold' }}>
                        Completed
                      </Typography>
                    }
                  </TableCell>
                  <TableCell align="center" style={{ color: 'black' }}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      ₹{row.salary.toLocaleString()}
                    </Typography>
                    {row.id === highestAvailable && (
                      <Typography style={{ fontSize: '10px', color: '#05c0b8', fontWeight: 'bold' }}>
                        HIGHEST AVAILABLE
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {row.claimed ? (
                      <Typography style={{ fontSize: '12px', color: '#05c0b8', fontWeight: 'bold' }}>
                        Done
                      </Typography>
                    ) : row.eligible && row.id === highestAvailable ? (
                      <Button
                        onClick={(e) => handleSubmit(e, row.id)}
                        variant="contained"
                        disabled={!isClaimingTime}
                        style={{
                          backgroundColor: isClaimingTime ? '#05c0b8' : '#ccc',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {isClaimingTime ? 'Claim Now' : 'Not Time'}
                      </Button>
                    ) : row.eligible && row.id < highestAvailable ? (
                      <Typography style={{ fontSize: '12px', color: '#ffa500', fontWeight: 'bold' }}>
                        Auto-Complete
                      </Typography>
                    ) : (
                      <Typography style={{ fontSize: '12px', color: 'black' }}>
                        Incomplete
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Container style={{ paddingTop: '20px' }}>
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
    </div>
  )
}

export default MySalary;
