import React,  { useEffect, useState }from 'react';
import {Typography, Grid,Dialog,Container,CircularProgress} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import axios from 'axios';
import * as api from "../../api/auth.js";
import { useParams } from "react-router";
import { useHistory } from 'react-router-dom';
import PlayHistory from './playHistory';



const FullMinesBidHistory = () => {
    const history = useHistory();
    const URL =  api.url;
        const [bidHistory, setHistory] = useState();
    const [loader, setLoader] = React.useState(false);

  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
    const foundUser = JSON.parse(loggedInUser);
    
    const AuthStr = 'Bearer '.concat(foundUser.token);
    setLoader(true); 
    axios.get(`${URL}/getMinesFullBidHistory/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
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
                 <Grid item xs={4}>                    
                <Typography align="center" > Play History</Typography>
                 </Grid>
            </Grid>
            <PlayHistory bidHistory = {bidHistory}/>
            
            
        </div>
    )
}

export default FullMinesBidHistory ; 
