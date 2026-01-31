import React, {useState, useEffect}from 'react';
import {Typography, Grid,TableContainer,Table,TableRow,Container,TableCell,TableHead,TableBody,Dialog,CircularProgress, Button,DialogContent, Paper} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

const InvitationRecord = () => {
    const dispatch = useDispatch();
    const [isAuth, setAuth] = useState(false);
    const history = useHistory();
    const URL =  api.url;
    const [inviteRecords, setInviteRecords] = useState([]);
    const [loader, setLoader] = useState(true);
    
    const [openDialog, setDialog] = React.useState({open: false, body: ''});
    const [ruleDialog, setRule] = React.useState(false);
    const ruleClose = () => {
      setRule(false);
    };
    const openRule = () => {
      setRule(true);
    };
  
    const dialogClose = () => {
      setDialog({ ...openDialog, open: false});
    };
    
    

                

  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
       
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/getInvitationRecords/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          
          setInviteRecords(response.data);
          setLoader(false);
          
    })
      .catch((error) => {
        
        
    });
     
    }else{
      history.push('/login');

    }
    
  }, []); 

//   const handleChange = (e) => {
//     const AuthStr = 'Bearer '.concat(isAuth.token);
//     setFormData({...formData, auth: AuthStr});
      
//     setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id});
//     console.log(formData);
//   };

  const handleClaim = async (e, id) => {
    e.preventDefault();
    setLoader(true);
    const loggedInUser =  localStorage.getItem("user");
    const foundUser = JSON.parse(loggedInUser);
    
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/claimInvitationBonus/${foundUser.result.id}/${id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          setLoader(false);
          alert('Successfully Redeemed');
    })
      .catch((error) => {
        
        
    });
    // axios.get(`${URL}/getSalaryTask/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
    //   .then(response => {
          
    //       setInvite(response.data);
    //       setLoader(false);
          
    // })
    //   .catch((error) => {
        
        
    // });
    

   
    
   

    
  };
    
    return (
        <div style={{ backgroundColor: "white", minHeight: '100vh', paddingBottom: '100px' }}>
            <Grid container direction="row" alignItems="center" style={{ padding: '10px 20px', backgroundColor: '#05c0b8' }}>
                <Grid item xs={2}>
                    <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white' }} onClick={history.goBack} />
                </Grid>
                <Grid item xs={8}>
                    <Typography align="center" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>Invitation Record</Typography>
                </Grid>
            </Grid>

    

            <TableContainer component={Paper} style={{ marginTop: '10px', marginBottom: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow style={{ backgroundColor: '#05c0b8' }}>
                            <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Invitee Name</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Date Invited</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold', color: 'white' }}>Total Recharge</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inviteRecords && inviteRecords.length > 0 ? (
                            inviteRecords.map((record, index) => (
                                <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F1F8E9' }}>
                                    <TableCell align="center" style={{ color: 'black' }}>{record.name}</TableCell>
                                    <TableCell align="center" style={{ color: 'black' }}>{record.dateInvited}</TableCell>
                                    <TableCell align="center" style={{ color: 'black' }}>{record.totalRecharge}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center" style={{ color: 'black', padding: '20px' }}>
                                    <Typography variant="body1">No invitation records found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {loader && (
                <Dialog open={loader} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
                    <Container align="center" style={{ backgroundColor: 'black', opacity: '0.6', height: '100px', paddingTop: "10px" }}>
                        <CircularProgress style={{ color: 'white' }} />
                        <Typography style={{ paddingTop: '10px', color: "white" }}>Loading Records...</Typography>
                    </Container>
                </Dialog>
            )}
        </div>
    );
};

export default InvitationRecord; 
