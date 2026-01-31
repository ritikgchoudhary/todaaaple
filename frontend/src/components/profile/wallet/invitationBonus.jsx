import React, {useState, useEffect}from 'react';
import {Typography, Grid,TableContainer,Table,TableRow,Container,TableCell,TableHead,TableBody,Dialog,CircularProgress, Button,DialogContent, Paper} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { Link, useHistory } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { useDispatch } from "react-redux";

const InvitationBonus = () => {
    const dispatch = useDispatch();
    const [isAuth, setAuth] = useState(false);
    const history = useHistory();
    const URL = api.url;
    const [inviteData, setInviteData] = useState({
        totalInvitees: 0,
        qualifiedInvitees: 0,
        eligibleTiers: [],
        remainingTargets: [],
        previousClaimed: []
    });
    
    const [messageDialog, setMessageDialog] = React.useState({
        open: false,
        message: '',
        isError: false
    });
    const [loader, setLoader] = React.useState(true);
    const [ruleDialog, setRule] = React.useState(false);
    
    const ruleClose = () => {
      setRule(false);
    };
    
    const openRule = () => {
      setRule(true);
    };
  
    const closeMessageDialog = () => {
        setMessageDialog({ ...messageDialog, open: false });
    };

  useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
            axios.get(`${URL}/getInviteBonusData/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
                    setInviteData(response.data);
          setLoader(false);
    })
      .catch((error) => {
                    console.error("Error fetching invite data:", error);
                    setLoader(false);
    });
        } else {
      history.push('/login');
    }
  }, []); 

    const handleClaim = async (tier) => {
    setLoader(true);
        const loggedInUser = localStorage.getItem("user");
    const foundUser = JSON.parse(loggedInUser);
    
    const AuthStr = 'Bearer '.concat(foundUser.token);
        axios.get(`${URL}/claimInvitationBonus/${foundUser.result.id}/${tier}`, { headers: { Authorization: AuthStr } })
            .then(response => {
                setLoader(false);
                setMessageDialog({
                    open: true,
                    message: `Successfully claimed Tier ${response.data.tier} bonus of ₹${response.data.amount}!`,
                    isError: false
                });
                // Refresh data after claiming
                axios.get(`${URL}/getInviteBonusData/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
                        setInviteData(response.data);
                    });
    })
      .catch((error) => {
                setLoader(false);
                setMessageDialog({
                    open: true,
                    message: error.response?.data || 'Failed to claim bonus',
                    isError: true
                });
            });
    };
    
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
  };
    
    return (
        <div style={{ backgroundColor: "white", minHeight: '100vh', paddingBottom: '100px' }}>
            <Grid container direction="row" alignItems="center" style={{ padding: '10px 20px', backgroundColor: '#05c0b8' }}>
                <Grid item xs={2}>
                    <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white' }} onClick={history.goBack} />
                </Grid>
                <Grid item xs={8}>
                    <Typography align="center" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Invitation Bonus</Typography>
                </Grid>
            </Grid>

            <Container style={{ padding: '20px', backgroundColor: '#f5f5f5', marginTop: '10px', borderRadius: '10px' }}>
                <Typography align="center" style={{ fontSize: '16px', fontWeight: 'bold', color: '#05c0b8' }}>Invite friends and deposit</Typography>
                <Typography align="center" style={{ fontSize: '14px', color: 'black' }}>Invite friends to register and recharge to receive rewards</Typography>
                <Typography align="center" style={{ fontSize: '14px', color: 'black' }}>Activity date: 2000-01-01 - 2099-01-01</Typography>
            </Container>

            <Container style={{ marginTop: '10px', marginBottom: '10px' }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Link to="/invitationRewardRule" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                            <Button 
                                variant="contained" 
                                fullWidth
                                style={{ 
                                    backgroundColor: '#f5f5f5', 
                                    color: '#05c0b8', 
                                    padding: '10px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                    textTransform: 'none'
                                }}
                            >
                                Invitation Rules
          </Button>
                        </Link>
                    </Grid>
                    <Grid item xs={6}>
                        <Link to="/invitationRecord" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                            <Button 
                                variant="contained"
                                fullWidth
                                style={{ 
                                    backgroundColor: '#f5f5f5', 
                                    color: '#05c0b8', 
                                    padding: '10px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                    textTransform: 'none'
                                }}
                            >
                                Invitation Record
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
                </Container>
                
            <Container style={{ padding: '20px', backgroundColor: '#f5f5f5', marginTop: '10px', borderRadius: '10px' }}>
                <Typography align="center" style={{ fontSize: '16px', fontWeight: 'bold', color: '#05c0b8' }}>Current Progress</Typography>
                <Typography align="center" style={{ fontSize: '14px', color: 'black' }}>
                    Total Invitees: {inviteData.totalInvitees} | Qualified Invitees: {inviteData.qualifiedInvitees}
                </Typography>
            </Container>

            {/* Claimed Rewards History */}
            {inviteData.previousClaimed && inviteData.previousClaimed.length > 0 && (
                <Container style={{ padding: '0', marginBottom: '20px', marginTop: '15px' }}>
                    <Typography align="center" style={{ fontSize: '16px', fontWeight: 'bold', color: '#05c0b8', marginBottom: '10px' }}>
                        Claimed Rewards
                    </Typography>
                    <TableContainer component={Paper} style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#05c0b8' }}>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Invitees</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Reward</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Claimed On</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inviteData.previousClaimed.map((claim, index) => (
                                    <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F1F8E9' }}>
                                        <TableCell align="center" style={{ color: 'black' }}>{claim.invitees}</TableCell>
                                        <TableCell align="center" style={{ color: 'black' }}>₹{claim.reward}</TableCell>
                                        <TableCell align="center" style={{ color: 'black' }}>{formatDate(claim.claimedAt)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            )}

            {/* Eligible Tiers Table */}
            {inviteData.eligibleTiers && inviteData.eligibleTiers.length > 0 && (
                <Container style={{ padding: '0', marginBottom: '20px', marginTop: '15px' }}>
                    <Typography align="center" style={{ fontSize: '16px', fontWeight: 'bold', color: '#05c0b8', marginBottom: '10px' }}>
                        Available Rewards
                    </Typography>
                    <TableContainer component={Paper} style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <Table>
          <TableHead>
                                <TableRow style={{ backgroundColor: '#05c0b8' }}>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Required Invitees</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Recharge Required</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Reward</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Action</TableCell>
            </TableRow>
          </TableHead>
                            <TableBody>
                                {inviteData.eligibleTiers.map((tier, index) => (
                                    <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F1F8E9' }}>
                                        <TableCell align="center" style={{ color: 'black' }}>{tier.invitees}</TableCell>
                                        <TableCell align="center" style={{ color: 'black' }}>₹{tier.rechargeAmount}</TableCell>
                                        <TableCell align="center" style={{ color: 'black' }}>₹{tier.reward}</TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                variant="contained" 
                                                style={{ backgroundColor: '#05c0b8', color: 'white' }}
                                                onClick={() => handleClaim(tier.tier)}
                                            >
                                                Claim
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            )}

            {/* Remaining Targets Table - Replacing Next Target */}
            {inviteData.remainingTargets && inviteData.remainingTargets.length > 0 && (
                <Container style={{ padding: '0', marginBottom: '20px', marginTop: '15px'}}>
                    <Typography align="center" style={{ fontSize: '16px', fontWeight: 'bold', color: '#05c0b8', marginBottom: '10px' }}>
                        Upcoming Targets
                    </Typography>
                    <TableContainer component={Paper} style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#05c0b8' }}>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Target Reward</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Required Invitees</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Recharge Required</TableCell>
                                    <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Progress</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inviteData.remainingTargets.map((target, index) => (
                                    <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F1F8E9' }}>
                                        <TableCell align="center" style={{ color: 'black' }}>₹{target.reward}</TableCell>
                                        <TableCell align="center" style={{ color: 'black' }}>
                                            {inviteData.qualifiedInvitees}/{target.invitees}
                                            <Typography variant="caption" display="block" style={{ color: 'black' }}>
                                                ({target.remaining} more needed)
                                            </Typography>
              </TableCell>
                                        <TableCell align="center" style={{ color: 'black' }}>₹{target.rechargeAmount}</TableCell>
                                        <TableCell align="center">
                                            <div style={{ 
                                                width: '100%', 
                                                backgroundColor: '#E0E0E0',
                                                borderRadius: '10px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${Math.min(100, (inviteData.qualifiedInvitees / target.invitees) * 100)}%`,
                                                    backgroundColor: '#05c0b8',
                                                    height: '8px',
                                                    transition: 'width 0.3s ease'
                                                }} />
                    </div>
                                            <Typography variant="caption" style={{ 
                                                color: 'black',
                                                display: 'block',
                                                marginTop: '4px'
                                            }}>
                                                {Math.round((inviteData.qualifiedInvitees / target.invitees) * 100)}%
                                            </Typography>
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
                </Container>
            )}

            <Dialog open={ruleDialog} onClose={ruleClose} maxWidth="sm" fullWidth>
                <DialogContent>
                    <Typography align="center" style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: '20px', color: '#05c0b8' }}>
                        Invitation Reward Rules
                    </Typography>
                    <Typography align="left" style={{ fontSize: '14px', paddingBottom: '10px', color: 'black' }}>
                        1. Invite friends to register and recharge to receive rewards.
                    </Typography>
                    <Typography align="left" style={{ fontSize: '14px', paddingBottom: '10px', color: 'black' }}>
                        2. Each invited friend must complete the minimum recharge requirement.
                    </Typography>
                    <Typography align="left" style={{ fontSize: '14px', paddingBottom: '10px', color: 'black' }}>
                        3. Rewards increase with more qualified invitees.
                    </Typography>
                    <Typography align="left" style={{ fontSize: '14px', paddingBottom: '10px', color: 'black' }}>
                        4. Each tier can be claimed independently when requirements are met.
                    </Typography>
                    <Typography align="left" style={{ fontSize: '14px', paddingBottom: '10px', color: 'black' }}>
                        5. Activity date: 2000-01-01 - 2099-01-01
                    </Typography>
                </DialogContent>
            </Dialog>

            {/* Message Dialog */}
            <Dialog 
                open={messageDialog.open} 
                onClose={closeMessageDialog}
                PaperProps={{ 
                    style: { 
                        backgroundColor: messageDialog.isError ? '#FFEBEE' : '#E8F5E9',
                        borderRadius: '10px',
                        padding: '20px'
                    } 
                }}
            >
                <DialogContent style={{ textAlign: 'center' }}>
                    {messageDialog.isError ? (
                        <ErrorIcon style={{ fontSize: 40, color: '#D32F2F', marginBottom: '10px' }} />
                    ) : (
                        <CheckCircleIcon style={{ fontSize: 40, color: '#2E7D32', marginBottom: '10px' }} />
                    )}
                    <Typography style={{ 
                        color: messageDialog.isError ? '#D32F2F' : '#2E7D32',
                        fontSize: '16px',
                        marginBottom: '15px'
                    }}>
                        {messageDialog.message}
                    </Typography>
                    <Button
                        variant="contained"
                        style={{ 
                            backgroundColor: messageDialog.isError ? '#D32F2F' : '#2E7D32',
                            color: 'white'
                        }}
                        onClick={closeMessageDialog}
                    >
                        {messageDialog.isError ? 'Try Again' : 'OK'}
            </Button>
                </DialogContent>
            </Dialog>

            {loader && (
                <Dialog open={loader} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
                    <Container align="center" style={{ backgroundColor: 'black', opacity: '0.6', height: '100px', paddingTop: "10px" }}>
                        <CircularProgress style={{ color: 'white' }} />
                        <Typography style={{ paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
          </Container>
                </Dialog>
            )}
        </div>
    );
}

export default InvitationBonus; 
