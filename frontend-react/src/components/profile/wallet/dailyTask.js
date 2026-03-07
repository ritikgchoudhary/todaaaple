import React, {useState, useEffect}from 'react';
import {Typography, Grid,TableContainer,Table,TableRow,Container,TableCell,TableHead,TableBody,Dialog,CircularProgress, Button,DialogContent} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

const MyDailyTask = () => {
    const dispatch = useDispatch();
    const [isAuth, setAuth] = useState(false);
    const history = useHistory();
    const URL =  api.url;
    const [invite,setInvite] = useState();
    
    const [openDialog, setDialog] = React.useState({open: false, body: ''});
    const [loader, setLoader] = React.useState(true);
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
    axios.get(`${URL}/getDailyTask/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          
          setInvite(response.data);
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

  const handleSubmit = async (e,id) => {
    e.preventDefault();
   
    setLoader(true);
    const loggedInUser =  localStorage.getItem("user");
    const foundUser = JSON.parse(loggedInUser);
    
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/claimDailyTask/${foundUser.result.id}/${id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          history.goBack();
          setDialog({...openDialog, open: true, body: `Successfuly Redeemed`});
          
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
        <div>
          <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        
      >
       
        <DialogContent>
        <Typography align="center" style={{ fontSize: '20px',fontWeight: 'bold',paddingBottom: '20px'}}>Daily Task System</Typography>
        
          <Typography align="left" style={{ fontSize: '14px',fontWeight: 'bold',paddingBottom: '20px',paddingTop: '20px'}}>Complete target invitation to earn money</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>For 200 earning: When you invite 3 Active members. If the total recharge amount done by your members reaches 1,000 then you will be eligible for earning.</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>For 500 earning: When you invite 5 Active members. If the total recharge amount done by your members reaches 1,500 then you will be eligible for earning.</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>For 1200 earning: When you invite 10 Active members. If the total recharge amount done by your members reaches 3,000 then you will be eligible for earning.</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>For 2000 earning: When you invite 15 Active members. If the total recharge amount done by your members reaches 5,000 then you will be eligible for earning.</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>For 3000 earning: When you invite 20 Active members. If the total recharge amount done by your members reaches 7,500 then you will be eligible for earning.</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>For 5500 earning: When you invite 35 Active members. If the total recharge amount done by your members reaches 12,500 then you will be eligible for earning.</Typography>

          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>For 8000 earning: When you invite 50 Active members. If the total recharge amount done by your members reaches 20,000 then you will be eligible for earning.</Typography>

          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>200 की कमाई के लिए: जब आप 3 सदस्यों को आमंत्रित करते हैं। यदि आपके सदस्यों द्वारा किया गया कुल रिचार्ज राशि 1,000 तक पहुंच जाती है तो आप कमाई के पात्र होंगे।</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>500 की कमाई के लिए: जब आप 5 सदस्यों को आमंत्रित करते हैं। यदि आपके सदस्यों द्वारा किया गया कुल रिचार्ज राशि 1,500 तक पहुंच जाती है तो आप कमाई के पात्र होंगे।</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>1200 की कमाई के लिए: जब आप 10 सदस्यों को आमंत्रित करते हैं। यदि आपके सदस्यों द्वारा किया गया कुल रिचार्ज राशि 3,000 तक पहुंच जाती है तो आप कमाई के पात्र होंगे।</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>2000 की कमाई के लिए: जब आप 15 सदस्यों को आमंत्रित करते हैं। यदि आपके सदस्यों द्वारा किया गया कुल रिचार्ज राशि 5,000 तक पहुंच जाती है तो आप कमाई के पात्र होंगे।</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>3000 की कमाई के लिए: जब आप 20 सदस्यों को आमंत्रित करते हैं। यदि आपके सदस्यों द्वारा किया गया कुल रिचार्ज राशि 7,500 तक पहुंच जाती है तो आप कमाई के पात्र होंगे।</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>5500 की कमाई के लिए: जब आप 35 सदस्यों को आमंत्रित करते हैं। यदि आपके सदस्यों द्वारा किया गया कुल रिचार्ज राशि 12,500 तक पहुंच जाती है तो आप कमाई के पात्र होंगे।</Typography>
          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>8000 की कमाई के लिए: जब आप 50 सदस्यों को आमंत्रित करते हैं। यदि आपके सदस्यों द्वारा किया गया कुल रिचार्ज राशि 20,000 तक पहुंच जाती है तो आप कमाई के पात्र होंगे।</Typography>

          <Typography align="left" style={{ fontSize: '12px',paddingBottom: '20px'}}>आपको अपना प्रमोशन लेवल बोनस और यह कमाई अतिरिक्त मिलेगी।</Typography>


          <Typography align="left" style={{ fontSize: '14px',paddingBottom: '20px'}}>Daily Task Reset Everyday</Typography>

           </DialogContent>
        {/* <DialogActions>
          <Button onClick={ruleClose} color="primary" >
            OK
          </Button>
         
        </DialogActions> */}
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
                <Container  align="center" style={{backgroundColor: 'black', opacity: '0.6',height: '100px',paddingTop: "10px"}}>
                <CircularProgress style={{color: 'white',}} />
                <Typography style={{paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
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
                <Typography style={{padding: '10px', color: "black" }}>{openDialog.body}</Typography>
                </Container>
                
                
              </Dialog>
            
            <Grid container direction="row" justify="" alignItems="center"style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px', color:'black'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" style={{color: 'black'}}>My Daily Task</Typography>
                 </Grid>
            </Grid>
            <Typography align='center'>New Invitation: {invite && invite[0].members}</Typography>
            <TableContainer >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
             
              <TableCell align="center" style={{fontWeight: 'bold'}}>Active Invite</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Total Recharged</TableCell>
              <TableCell style={{ fontWeight: 'bold'}}>Claim</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {invite && invite.map(row => (
              <TableRow key={row.id} >
              {/* <TableCell align='center' component="th" scope="row" >
                {row.invites.current} of {row.invites.target}
                <Container>
                  
                    <Typography>{row.eligible ? '✅' : ''}</Typography>

                </Container>
                
              </TableCell> */}
              <TableCell align="center" >{row.active.current} of {row.active.target}
              <Typography style={{fontSize: '8px',color: 'green',fontWeight: 'bold'}}>{row.active.current === row.active.target? 'Completed': ''}</Typography>
              </TableCell>
              <TableCell align="center" style={{fontSize: '10px'}}>₹{row.bid.current} of ₹{row.bid.target}
              <Typography style={{fontSize: '8px',color: 'green',fontWeight: 'bold'}}>{row.bid.current === row.bid.target? 'Completed': ''}</Typography>
              </TableCell>
              <TableCell >
                {
                    row.eligible ? row.claimed ? <Typography style={{fontSize: '10px',fontWeight: 'bold',color: 'red'}}> ₹{row.salary} Claimed</Typography> :
                    <div>
                         <Button onClick={(e)=>handleSubmit(e,row.id)} variant="contained" style={{backgroundColor: 'green',color: 'white',fontSize: '10px'}}>
                    Claim ₹{row.salary}
                    </Button>
                    </div>
                    :<div>
                        <Typography>₹{row.salary}</Typography>
                        <Typography style={{fontSize: '8px'}}>Please complete steps</Typography>
                    </div> 
                }
                    
                
              
                
               
                
             
              </TableCell>
            </TableRow>
            ))}
            
          </TableBody>
        </Table>
      </TableContainer>
      <Container style={{paddingTop: '20px'}}>
         
          <Container align="center">
            <Button
              variant="outlined"
              align="center"
              style={{ color: "green", }}
              onClick={openRule}
            >
              How it works?
            </Button>
          </Container>
        </Container>
           
            
        
            
           

            
        </div>
    )
}

export default MyDailyTask ; 
