import React,  { useEffect, useState }from 'react';
import {Typography, Grid,Dialog,Container,CircularProgress,Chip, DialogContent} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import BidHistory from './BidHistory';
import { Link } from "react-router-dom";
import axios from 'axios';
import * as api from "../../../api/auth.js";
import { useParams } from "react-router";




const FullBidHistory = () => {
    
    const URL =  api.url;
    const params = useParams();
    const [isAuth, setAuth] = useState(false);
    const [bidHistory, setHistory] = useState();
    const [loader, setLoader] = React.useState(false);
    const [ruleDialog, setRuleDialog] = React.useState(false);
    const [openDialogBonus, setDialogBonus] = React.useState({ open: false, body: "" });

    const setDialogHow = (e) => {
      e.preventDefault();
      setRuleDialog(true)
    }

 
    const dialogCloseBonus = () => {
      setDialogBonus({ ...openDialogBonus, open: false });
    };
  
    const ruleClose = () => {
      setRuleDialog(false);
    };
  
    const handleClaimBonus = (e) => {
      e.preventDefault();
      setLoader(true);
      const loggedInUser = localStorage.getItem("user");
      const foundUser = JSON.parse(loggedInUser);
        
        const AuthStr = "Bearer ".concat(foundUser.token);
      
      axios
      .get(`${URL}/claimPeriodStreakBonus/${foundUser.result.id}/${params.game}`, {
        headers: { Authorization: AuthStr },
      })
      .then((response) => {
        setLoader(false);
        setDialogBonus({open: true, body: response.data})
        
        
      })
      .catch((error) => {
        
        
      });
    }

  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
    setLoader(true); 
    axios.get(`${URL}/getFullBidHistory/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
         setLoader(false);
          setHistory(response.data);
    })
      .catch((error) => {
        setLoader(false);
    });

     
    }else{
      window.location.replace("/login");

    }
    
  },[]); 
    
   
    return (
        <div style={{paddingBottom: '80px'}}>
          <Dialog
                    open={openDialogBonus.open}
                    onClose={dialogCloseBonus}
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
                <Typography style={{padding: '10px', color: "black" }}>{openDialogBonus.body}</Typography>
                </Container>
                
                
              </Dialog>
          <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        >
       
        <DialogContent>
        <Typography align="center" style={{ fontSize: '20px',fontWeight: 'bold',paddingBottom: '20px'}}>How to Claim Win Streak Bonus</Typography>
       
          <Typography align="left" style={{ fontSize: '16px',fontWeight: 'bold',paddingBottom: '20px',paddingTop: '20px'}}>1. 3 Periods all bids won, you will get 50 (Minimum bid 100 rupees)</Typography>
          <Typography align="left" style={{ fontSize: '16px',fontWeight: 'bold',paddingBottom: '20px',paddingTop: '20px'}}>1. 5 Periods all bids won, you will get 200 (Minimum bid 100 rupees)</Typography>
          <Typography align="left" style={{ fontSize: '16px',fontWeight: 'bold',paddingBottom: '20px',paddingTop: '20px'}}>1. 8 Periods all bids won, you will get 1500 (Minimum bid 100 rupees)</Typography>
          <Typography align="left" style={{ fontSize: '16px',fontWeight: 'bold',paddingBottom: '20px',paddingTop: '20px'}}>Note: If you place multiple bids on same period then you have to win all bids.</Typography>

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
          <Container  align="center" style={{backgroundColor: 'black', opacity: '0.6',height: '100px',paddingTop: "10px"}}>
          <CircularProgress style={{color: 'white',}} />
           <Typography style={{paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
          </Container>
          
          
        </Dialog>

            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../wingo">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>                  
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" >{params.game === '0' ? 'Parity' : params.game === '1' ? 'Sapre': params.game === '2' ? 'Bcone': 'Emerd'} Bid History</Typography>
                 </Grid>
            </Grid>
              {/* <Grid container direction="row" justifyContent='center'>
                <Grid item>
                <Chip
                onClick={(e) => handleClaimBonus(e)}
                  label="Claim Win Streak Bonus"
                  style={{ backgroundColor: "#00b8a9", color: "white" }}
                ></Chip>
                </Grid>
                <Grid item style={{paddingLeft: '5px'}}>
                <Chip
                onClick={(e) => setDialogHow(e)}
                  label="How ?"
                  style={{ backgroundColor: "grey", color: "white" }}
                ></Chip>
                </Grid>

              </Grid> */}
            <BidHistory bidHistory = {bidHistory} game = {parseInt(params.game)}/>
            
            
        </div>
    )
}

export default FullBidHistory ; 
