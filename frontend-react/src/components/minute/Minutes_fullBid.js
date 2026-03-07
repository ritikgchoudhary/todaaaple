import React,  { useEffect, useState }from 'react';
import {Typography, Grid,Dialog,Container,CircularProgress, DialogContent, Chip} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import BidHistory from './Minutes_BidHistory.jsx';
import axios from 'axios';
import * as api from "../../api/auth.js";
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min.js';



const MinutesFullBidHistory = () => {
    const history = useHistory();
    const params = useParams();
    const URL =  api.url;
    const [bidHistory, setHistory] = useState();
    const [loader, setLoader] = React.useState(false);

    const navigateToWinStreak = () => {
      history.push(`/winstreak/${params.id}`);
    };

    useEffect(() => {
      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        const foundUser = JSON.parse(loggedInUser);
        const AuthStr = 'Bearer '.concat(foundUser.token);
        setLoader(true);
        
        // Fetch bid history only
        axios.get(`${URL}/minute${params.id}_getFullBidHistory/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
          .then(response => {
            setLoader(false);
            setHistory(response.data);
          })
          .catch((error) => {
            setLoader(false);
          });
      } else {
        window.location.replace("/login");
      }
    }, [params.id]);
    
   
    return (
        <div style={{paddingBottom: '80px', minHeight: '100vh'}}>
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

        <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: '#05c0b8'}}>
                <Grid item xs={4}>  
                
                <ArrowBackIosIcon style={{fontSize:'20px',color: 'white'}} onClick={history.goBack} />
               
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" style={{color: 'white'}}>{`${params.id} Minutes`} Bid History</Typography>
                 </Grid>
            </Grid>
             <Grid container direction="row" justifyContent='center' style={{paddingTop: '20px'}}>
                <Grid item>
                <Chip
                onClick={navigateToWinStreak}
                  label="Win Streak Progress"
                  style={{ backgroundColor: "#4caf50", color: "white" }}
                ></Chip>
                </Grid>

              </Grid>
            <BidHistory bidHistory = {bidHistory}/>
            
            
        </div>
    )
}

export default MinutesFullBidHistory ; 
