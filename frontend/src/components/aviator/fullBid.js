import React,  { useEffect, useState }from 'react';
import {Typography, Grid,Dialog,Container,CircularProgress} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import BidHistory from './BidHistory';
import axios from 'axios';
import * as api from "../../api/auth";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";




const AviatorFullBidHistory = () => {
  const history = useHistory();
    const URL =  api.url;
    const params = useParams();
    const [isAuth, setAuth] = useState(false);
    const [bidHistory, setHistory] = useState();
    const [loader, setLoader] = React.useState(false);
  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
    setLoader(true); 
    axios.get(`${URL}/getAviatorFullBidHistory/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
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
               
                <ArrowBackIosIcon onClick={history.goBack} style={{fontSize:'20px'}} />
                              
                 </Grid>
                 <Grid item >                    
                <Typography align="center" >Aviator Bid History</Typography>
                 </Grid>
            </Grid>
            <BidHistory bidHistory = {bidHistory}/>
            
            
        </div>
    )
}

export default AviatorFullBidHistory ; 
