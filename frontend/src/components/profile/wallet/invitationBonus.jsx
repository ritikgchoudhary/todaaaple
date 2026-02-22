import React, { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { Link, useHistory } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F5F9",
    display: "flex",
    justifyContent: "center",
    paddingBottom: "calc(100px + env(safe-area-inset-bottom))",
  },
  frame: {
    width: "100%",
    maxWidth: 500,
    minHeight: "100vh",
    backgroundColor: "#fff",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    padding: "10px 16px",
    backgroundColor: "#05c0b8",
  },
  section: {
    padding: "14px",
    margin: "10px 12px 0",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#05c0b8",
  },
  sectionSub: {
    fontSize: 13,
    color: "#0F172A",
    opacity: 0.9,
  },
  actionWrap: {
    margin: "10px 12px",
  },
  topButtons: {
    backgroundColor: "#f5f5f5",
    color: "#05c0b8",
    padding: "10px",
    fontSize: 13,
    fontWeight: 800,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
    textTransform: "none",
  },
  tableWrap: {
    padding: 0,
    margin: "15px 12px 20px",
  },
  tableContainer: {
    borderRadius: 10,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  table: {
    minWidth: 560, // allow scroll on phones
  },
  th: {
    fontWeight: 800,
    color: "white",
    fontSize: 12,
    padding: "10px 8px",
    whiteSpace: "nowrap",
  },
  td: {
    color: "black",
    fontSize: 12,
    padding: "10px 8px",
    whiteSpace: "nowrap",
  },
  claimBtn: {
    backgroundColor: "#05c0b8",
    color: "white",
    textTransform: "none",
    fontWeight: 800,
    fontSize: 12,
    padding: "6px 10px",
  },
}));

const InvitationBonus = () => {
    const classes = useStyles();
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
  
    const closeMessageDialog = () => {
        setMessageDialog({ ...messageDialog, open: false });
    };

  useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
    const foundUser = JSON.parse(loggedInUser);
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
  }, [URL, history]); 

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
        <div className={classes.page}>
          <div className={classes.frame}>
            <Grid container direction="row" alignItems="center" className={classes.header}>
                <Grid item xs={2}>
                    <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white' }} onClick={history.goBack} />
                </Grid>
                <Grid item xs={8}>
                    <Typography align="center" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Invitation Bonus</Typography>
                </Grid>
            </Grid>

            <div className={classes.section}>
                <Typography align="center" className={classes.sectionTitle}>Invite friends and deposit</Typography>
                <Typography align="center" className={classes.sectionSub}>Invite friends to register and recharge to receive rewards</Typography>
                <Typography align="center" className={classes.sectionSub}>Activity date: 2000-01-01 - 2099-01-01</Typography>
            </div>

            <div className={classes.actionWrap}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Link to="/invitationRewardRule" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                            <Button 
                                variant="contained" 
                                fullWidth
                                className={classes.topButtons}
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
                                className={classes.topButtons}
                            >
                                Invitation Record
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
                </div>
                
            <div className={classes.section}>
                <Typography align="center" className={classes.sectionTitle}>Current Progress</Typography>
                <Typography align="center" className={classes.sectionSub}>
                    Total Invitees: {inviteData.totalInvitees} | Qualified Invitees: {inviteData.qualifiedInvitees}
                </Typography>
            </div>

            {/* Claimed Rewards History */}
            {inviteData.previousClaimed && inviteData.previousClaimed.length > 0 && (
                <div className={classes.tableWrap}>
                    <Typography align="center" className={classes.sectionTitle} style={{ marginBottom: 10 }}>
                        Claimed Rewards
                    </Typography>
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#05c0b8' }}>
                                    <TableCell align="center" className={classes.th}>Invitees</TableCell>
                                    <TableCell align="center" className={classes.th}>Reward</TableCell>
                                    <TableCell align="center" className={classes.th}>Claimed On</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inviteData.previousClaimed.map((claim, index) => (
                                    <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F1F8E9' }}>
                                        <TableCell align="center" className={classes.td}>{claim.invitees}</TableCell>
                                        <TableCell align="center" className={classes.td}>₹{claim.reward}</TableCell>
                                        <TableCell align="center" className={classes.td}>{formatDate(claim.claimedAt)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}

            {/* Eligible Tiers Table */}
            {inviteData.eligibleTiers && inviteData.eligibleTiers.length > 0 && (
                <div className={classes.tableWrap}>
                    <Typography align="center" className={classes.sectionTitle} style={{ marginBottom: 10 }}>
                        Available Rewards
                    </Typography>
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table}>
          <TableHead>
                                <TableRow style={{ backgroundColor: '#05c0b8' }}>
                                    <TableCell align="center" className={classes.th}>Required Invitees</TableCell>
                                    <TableCell align="center" className={classes.th}>Recharge Required</TableCell>
                                    <TableCell align="center" className={classes.th}>Reward</TableCell>
                                    <TableCell align="center" className={classes.th}>Action</TableCell>
            </TableRow>
          </TableHead>
                            <TableBody>
                                {inviteData.eligibleTiers.map((tier, index) => (
                                    <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F1F8E9' }}>
                                        <TableCell align="center" className={classes.td}>{tier.invitees}</TableCell>
                                        <TableCell align="center" className={classes.td}>₹{tier.rechargeAmount}</TableCell>
                                        <TableCell align="center" className={classes.td}>₹{tier.reward}</TableCell>
                                        <TableCell align="center">
                                            <Button 
                                                variant="contained" 
                                                className={classes.claimBtn}
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
                </div>
            )}

            {/* Remaining Targets Table - Replacing Next Target */}
            {inviteData.remainingTargets && inviteData.remainingTargets.length > 0 && (
                <div className={classes.tableWrap}>
                    <Typography align="center" className={classes.sectionTitle} style={{ marginBottom: 10 }}>
                        Upcoming Targets
                    </Typography>
                    <TableContainer component={Paper} className={classes.tableContainer}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow style={{ backgroundColor: '#05c0b8' }}>
                                    <TableCell align="center" className={classes.th}>Target Reward</TableCell>
                                    <TableCell align="center" className={classes.th}>Required Invitees</TableCell>
                                    <TableCell align="center" className={classes.th}>Recharge Required</TableCell>
                                    <TableCell align="center" className={classes.th}>Progress</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inviteData.remainingTargets.map((target, index) => (
                                    <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F1F8E9' }}>
                                        <TableCell align="center" className={classes.td}>₹{target.reward}</TableCell>
                                        <TableCell align="center" className={classes.td}>
                                            {inviteData.qualifiedInvitees}/{target.invitees}
                                            <Typography variant="caption" display="block" style={{ color: 'black' }}>
                                                ({target.remaining} more needed)
                                            </Typography>
              </TableCell>
                                        <TableCell align="center" className={classes.td}>₹{target.rechargeAmount}</TableCell>
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
                </div>
            )}

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
                    <Container align="center" style={{ backgroundColor: 'black', opacity: '0.6', height: '100px', paddingTop: "10px", borderRadius: 10 }}>
                        <CircularProgress style={{ color: 'white' }} />
                        <Typography style={{ paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
          </Container>
                </Dialog>
            )}
          </div>
        </div>
    );
}

export default InvitationBonus; 
