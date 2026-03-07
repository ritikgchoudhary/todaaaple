import React from 'react';
import {Typography, Grid,TableContainer,Table,TableRow,Container,TableCell,TableHead,TableBody, Paper} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import { useHistory } from "react-router-dom";

const InvitationRule = () => {
    const history = useHistory();
    
    
    return (
        <div style={{ backgroundColor: "white", minHeight: '100vh', paddingBottom: '100px' }}>
            <Grid container direction="row" alignItems="center" style={{ padding: '10px 20px', backgroundColor: '#05c0b8' }}>
                <Grid item xs={2}>
                    <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white' }} onClick={history.goBack} />
                </Grid>
                <Grid item xs={8}>
                    <Typography align="center" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Invitation Rules</Typography>
                </Grid>
            </Grid>

            <Container style={{ padding: '20px', backgroundColor: '#f5f5f5', marginTop: '10px', borderRadius: '10px' }}>
                <Typography align="center" style={{ fontSize: '16px', fontWeight: 'bold', color: '#05c0b8', marginBottom: '15px' }}>
                    Reward Rules
                </Typography>
                
                <TableContainer component={Paper} style={{ marginBottom: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: '#05c0b8' }}>
                                <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Number of Invitees</TableCell>
                                <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Recharge Amount</TableCell>
                                <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Reward</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center" style={{ color: 'black' }}>1</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹300</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹55</TableCell>
                            </TableRow>
                            <TableRow style={{ backgroundColor: '#F1F8E9' }}>
                                <TableCell align="center" style={{ color: 'black' }}>3</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹400</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹155</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ color: 'black' }}>10</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹500</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹555</TableCell>
                            </TableRow>
                            <TableRow style={{ backgroundColor: '#F1F8E9' }}>
                                <TableCell align="center" style={{ color: 'black' }}>30</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹800</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1,555</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ color: 'black' }}>50</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹2,775</TableCell>
                            </TableRow>
                            <TableRow style={{ backgroundColor: '#F1F8E9' }}>
                                <TableCell align="center" style={{ color: 'black' }}>75</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹4,165</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ color: 'black' }}>100</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹5,555</TableCell>
                            </TableRow>
                            <TableRow style={{ backgroundColor: '#F1F8E9' }}>
                                <TableCell align="center" style={{ color: 'black' }}>200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹11,111</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ color: 'black' }}>500</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹27,777</TableCell>
                            </TableRow>
                            <TableRow style={{ backgroundColor: '#F1F8E9' }}>
                                <TableCell align="center" style={{ color: 'black' }}>1000</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹55,555</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="center" style={{ color: 'black' }}>2000</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1,11,111</TableCell>
                            </TableRow>
                            <TableRow style={{ backgroundColor: '#F1F8E9' }}>
                                <TableCell align="center" style={{ color: 'black' }}>5000</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹1200</TableCell>
                                <TableCell align="center" style={{ color: 'black' }}>₹2,77,777</TableCell>
                            </TableRow>

                     
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography align="left" style={{ fontSize: '16px', fontWeight: 'bold', color: '#05c0b8', marginTop: '20px', marginBottom: '10px' }}>
                    Terms and Conditions:
                </Typography>
                <Typography align="left" style={{ fontSize: '14px', color: 'black', marginTop: '10px' }}>
                    1. Each invited friend must complete a minimum recharge of ₹300.
                </Typography>
                <Typography align="left" style={{ fontSize: '14px', color: 'black', marginTop: '10px' }}>
                    2. Rewards will be credited instantly after the invited friend completes the recharge.
                </Typography>
                <Typography align="left" style={{ fontSize: '14px', color: 'black', marginTop: '10px' }}>
                    3. The invited friend must be a new user who has never registered before.
                </Typography>
                <Typography align="left" style={{ fontSize: '14px', color: 'black', marginTop: '10px' }}>
                    4. Both inviter and invitee will receive rewards upon successful completion.
                </Typography>
                <Typography align="left" style={{ fontSize: '14px', color: 'black', marginTop: '10px' }}>
                    5. Activity period: 2000-01-01 to 2099-01-01
                </Typography>
                <Typography align="left" style={{ fontSize: '14px', color: 'black', marginTop: '10px' }}>
                    6. The platform reserves the right to modify rules or terminate the activity.
                </Typography>
            </Container>

           
        </div>
    );
}

export default InvitationRule; 
