import React, { useEffect, useState } from 'react';
import {
  Typography,
  Grid,
  Dialog,
  Container,
  CircularProgress,
  DialogContent,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  Divider
} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import EmojiEventsIcon from '@material-ui/icons/EmojiEvents';
import axios from 'axios';
import * as api from "../../api/auth.js";
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min.js';

const WinStreakProgress = () => {
  const history = useHistory();
  const params = useParams();
  const URL = api.url;
  const [winStreakData, setWinStreakData] = useState(null);
  const [loader, setLoader] = useState(false);
  const [ruleDialog, setRuleDialog] = useState(false);
  const [openDialogBonus, setDialogBonus] = useState({ open: false, body: "" });

  const dialogCloseBonus = () => {
    setDialogBonus({ ...openDialogBonus, open: false });
  };

  const ruleClose = () => {
    setRuleDialog(false);
  };

  const openRule = () => {
    setRuleDialog(true);
  };

  const fetchWinStreakData = async () => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = 'Bearer '.concat(foundUser.token);
      setLoader(true);
      
      try {
        const response = await axios.get(`${URL}/getWinStreakData/${foundUser.result.id}/${params.id}`, { 
          headers: { Authorization: AuthStr } 
        });
        console.log('Win Streak Data:', response.data);
        setWinStreakData(response.data);
        setLoader(false);
      } catch (error) {
        console.error('Error fetching win streak data:', error);
        setLoader(false);
      }
    }
  };

  const handleClaimBonus = (e, tier = null) => {
    e.preventDefault();
    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    const foundUser = JSON.parse(loggedInUser);
      
    const AuthStr = "Bearer ".concat(foundUser.token);
    
    const endpoint = tier 
      ? `${URL}/claimPeriodStreakBonus/${foundUser.result.id}/${params.id}/${tier}`
      : `${URL}/claimPeriodStreakBonus/${foundUser.result.id}/${params.id}`;
    
    axios
    .get(endpoint, {
      headers: { Authorization: AuthStr },
    })
    .then((response) => {
      setLoader(false);
      if (response.data.success) {
        setDialogBonus({open: true, body: `Successfully claimed ${response.data.amount} coins! Streak: ${response.data.streakLength} wins`});
        // Refresh win streak data after successful claim
        fetchWinStreakData();
      } else {
        setDialogBonus({open: true, body: response.data.message || response.data});
      }
    })
    .catch((error) => {
      setLoader(false);
      const errorMessage = error.response?.data || "Error processing win streak bonus. Please try again.";
      setDialogBonus({open: true, body: errorMessage});
    });
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      fetchWinStreakData();
    } else {
      window.location.replace("/login");
    }
  }, [params.id]);

  return (
    <div style={{ backgroundColor: "white", minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Header */}
      <Grid container direction="row" alignItems="center" style={{ padding: '10px 20px', backgroundColor: '#05c0b8' }}>
        <Grid item xs={2}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white' }} onClick={history.goBack} />
        </Grid>
        <Grid item xs={8}>
          <Typography align="center" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            {`${params.id} Minutes`} Win Streak
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Button onClick={openRule} style={{ color: 'white', minWidth: 'auto', padding: '4px' }}>
            <Typography style={{ fontSize: '12px' }}>Rules</Typography>
          </Button>
        </Grid>
      </Grid>

      {/* Success/Error Dialog */}
      <Dialog
        open={openDialogBonus.open}
        onClose={dialogCloseBonus}
        PaperProps={{
          style: {
            boxShadow: 'none',
          },
        }}
      >
        <Container>
          <Typography style={{padding: '10px', color: "black" }}>{openDialogBonus.body}</Typography>
        </Container>
      </Dialog>

      {/* Loading Dialog */}
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
          <Typography style={{paddingTop: '10px', color: "white" }}>Loading...</Typography>
        </Container>
      </Dialog>

      {/* Rules Dialog */}
      <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent style={{padding: '20px', backgroundColor: '#f5f5f5'}}>
          <Typography align="center" style={{ 
            fontSize: '24px',
            fontWeight: 'bold',
            paddingBottom: '20px',
            color: '#333',
            textTransform: 'uppercase'
          }}>
            WINSTREAK BONUS
          </Typography>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '15px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <Typography align="center" style={{ 
              fontSize: '18px',
              fontWeight: 'bold',
              paddingBottom: '15px',
              color: '#333'
            }}>
              PRIZES
            </Typography>
            <Typography align="left" style={{ fontSize: '14px', paddingBottom: '8px', color: '#333' }}>
              Win 5 in a row & get 10% (betting amount X 10%)
            </Typography>
            <Typography align="left" style={{ fontSize: '14px', paddingBottom: '8px', color: '#333' }}>
              Win 10 in a row & get 20% (betting amount X 20%)
            </Typography>
            <Typography align="left" style={{ fontSize: '14px', paddingBottom: '8px', color: '#333' }}>
              Win 20 in a row & get 30% (betting amount X 30%)
            </Typography>
            <Typography align="left" style={{ fontSize: '14px', paddingBottom: '8px', color: '#333' }}>
              Win 30 in a row & get 40% (betting amount X 40%)
            </Typography>
            <Typography align="left" style={{ fontSize: '14px', paddingBottom: '8px', color: '#333' }}>
              Win 40 in a row & get 50% (betting amount X 50%)
            </Typography>
            <Typography align="left" style={{ fontSize: '14px', paddingBottom: '8px', color: '#333' }}>
              Win 50 in a row & get 100% (betting amount X 100%)
            </Typography>
          </div>

          <div style={{
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            <Typography style={{ fontSize: '12px', fontWeight: 'bold' }}>
              MEET THE CONDITIONS & CLAIM DIRECTLY THROUGH THE APP
            </Typography>
          </div>

          <div style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '15px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <Typography align="center" style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              paddingBottom: '10px',
              color: '#333'
            }}>
              TERMS AND CONDITIONS
            </Typography>
            
            <Typography align="left" style={{ fontSize: '11px', color: '#333', paddingBottom: '8px', lineHeight: '1.4' }}>
              1. Valid for Wingo Game only.
            </Typography>
            <Typography align="left" style={{ fontSize: '11px', color: '#333', paddingBottom: '8px', lineHeight: '1.4' }}>
              2. No betting limit
            </Typography>
            <Typography align="left" style={{ fontSize: '11px', color: '#333', paddingBottom: '8px', lineHeight: '1.4' }}>
              3. The bonus must be claimed on the same day the winning streak is achieved.
            </Typography>
            <Typography align="left" style={{ fontSize: '11px', color: '#333', paddingBottom: '8px', lineHeight: '1.4' }}>
              4. You can claim bonuses directly through the app.
            </Typography>
            <Typography align="left" style={{ fontSize: '11px', color: '#333', paddingBottom: '8px', lineHeight: '1.4' }}>
              5. Members involved in this bonus are not allowed to have the same data as other members.
            </Typography>
            <Typography align="left" style={{ fontSize: '11px', color: '#333', lineHeight: '1.4' }}>
              6. Toddapple has the right to stop the event without prior notice.
            </Typography>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <Container style={{ paddingTop: '20px' }}>
        {winStreakData && (
          <div>
            {/* Current Status Card */}
            <Card style={{ marginBottom: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent style={{ padding: '20px' }}>
                <Box display="flex" alignItems="center" marginBottom="15px">
                  <TrendingUpIcon style={{ color: '#05c0b8', marginRight: '10px' }} />
                  <Typography variant="h6" style={{ color: '#333', fontWeight: 'bold' }}>
                    Current Status
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center" padding="10px" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                      <Typography style={{ fontSize: '24px', fontWeight: 'bold', color: '#05c0b8' }}>
                        {winStreakData.totalStreak}
                      </Typography>
                      <Typography style={{ fontSize: '12px', color: '#666' }}>Total Streak</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" padding="10px" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                      <Typography style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                        {winStreakData.currentUnclaimedStreak}
                      </Typography>
                      <Typography style={{ fontSize: '12px', color: '#666' }}>Unclaimed Streak</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" padding="10px" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                      <Typography style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff9800' }}>
                        {winStreakData.totalBettingAmount}
                      </Typography>
                      <Typography style={{ fontSize: '12px', color: '#666' }}>Betting Amount</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" padding="10px" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                      <Typography style={{ fontSize: '18px', fontWeight: 'bold', color: '#9c27b0' }}>
                        {winStreakData.claimedStreaks}
                      </Typography>
                      <Typography style={{ fontSize: '12px', color: '#666' }}>Previously Claimed</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Available to Claim */}
            {winStreakData.eligibleTiers && winStreakData.eligibleTiers.length > 0 && (
              <Card style={{ marginBottom: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <CardContent style={{ padding: '20px' }}>
                  <Box display="flex" alignItems="center" marginBottom="15px">
                    <EmojiEventsIcon style={{ color: '#4caf50', marginRight: '10px' }} />
                    <Typography variant="h6" style={{ color: '#333', fontWeight: 'bold' }}>
                      Available to Claim
                    </Typography>
                  </Box>
                  
                  {/* Quick Claim Button at top */}
                  <Box textAlign="center" marginBottom="20px">
                    <Button
                      variant="contained"
                      size="large"
                      style={{
                        backgroundColor: '#05c0b8',
                        color: 'white',
                        borderRadius: '25px',
                        padding: '12px 30px',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                      onClick={(e) => handleClaimBonus(e)}
                    >
                      CLAIM
                    </Button>
                  </Box>
                  
                  {winStreakData.eligibleTiers.map((tier, index) => (
                    <Box key={index} style={{
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '15px',
                      backgroundColor: '#e8f5e8',
                      marginBottom: '10px',
                      borderRadius: '10px',
                      border: '2px solid #4caf50'
                    }}>
                      <div>
                        <Typography style={{ fontWeight: 'bold', fontSize: '16px', color: '#2e7d32' }}>
                          {tier.streakLength} Wins - {tier.bonusPercentage}%
                        </Typography>
                        <Typography style={{ fontSize: '14px', color: '#4caf50' }}>
                          Reward: {tier.reward} coins
                        </Typography>
                      </div>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Previously Claimed */}
            {winStreakData.previousClaimed && winStreakData.previousClaimed.length > 0 && (
              <Card style={{ marginBottom: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <CardContent style={{ padding: '20px' }}>
                  <Typography variant="h6" style={{ color: '#333', marginBottom: '15px', fontWeight: 'bold' }}>
                    Previously Claimed
                  </Typography>
                  
                  {winStreakData.previousClaimed.map((claimed, index) => (
                    <Box key={index} style={{
                      padding: '15px',
                      backgroundColor: '#f5f5f5',
                      marginBottom: '10px',
                      borderRadius: '10px',
                      border: '1px solid #ddd'
                    }}>
                      <Typography style={{ fontWeight: 'bold', fontSize: '16px', color: '#666' }}>
                        {claimed.streakLength} Wins - {claimed.bonusPercentage}%
                      </Typography>
                      <Typography style={{ fontSize: '14px', color: '#888' }}>
                        Claimed: {claimed.reward} coins
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Next Targets */}
            {winStreakData.remainingTargets && winStreakData.remainingTargets.length > 0 && (
              <Card style={{ marginBottom: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <CardContent style={{ padding: '20px' }}>
                  <Typography variant="h6" style={{ color: '#333', marginBottom: '15px', fontWeight: 'bold' }}>
                    Next Targets
                  </Typography>
                  
                  {winStreakData.remainingTargets.map((target, index) => (
                    <Box key={index} style={{
                      padding: '15px',
                      backgroundColor: '#fff3cd',
                      marginBottom: '10px',
                      borderRadius: '10px',
                      border: '1px solid #ffeaa7'
                    }}>
                      <Typography style={{ fontWeight: 'bold', fontSize: '16px', color: '#856404' }}>
                        {target.streakLength} Wins - {target.bonusPercentage}%
                      </Typography>
                      <Typography style={{ fontSize: '14px', color: '#856404' }}>
                        Potential Reward: {target.reward} coins
                      </Typography>
                      <Typography style={{ fontSize: '12px', color: '#6c757d' }}>
                        {target.remaining > 0 ? `${target.remaining} more wins needed` : 'Target achieved!'}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* No Data State */}
        {!winStreakData && !loader && (
          <Card style={{ marginTop: '50px', textAlign: 'center', padding: '40px' }}>
            <Typography variant="h6" style={{ color: '#666', marginBottom: '10px' }}>
              No Win Streak Data
            </Typography>
            <Typography style={{ color: '#999' }}>
              Start playing to build your win streak!
            </Typography>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default WinStreakProgress;