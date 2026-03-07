import React,  { useEffect, useState }from 'react';
import {Typography, Grid,Dialog,Container,CircularProgress} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import BidHistory from './BidHistory';
import axios from 'axios';
import * as api from "../../api/auth";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";




const CricketFullBidHistory = () => {
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
    var apiCall = 'cricket_getBidHistory';
    if(params.id){
      
      apiCall = 'cricket_getCurrentBidHistory';
    }
    axios.get(`${URL}/${apiCall}/${params.id}/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
         setLoader(false);
          
         
          if(params.id){
            if(response.data.bid !== undefined)
            setHistory([response.data]);
          }else{
            setHistory(response.data.reverse());
          }
    })
      .catch((error) => {
        setLoader(false);
    });

     
    }else{
      window.location.replace("/login");

    }
    
  },[]); 
  const [level, setLevel] = React.useState('odds');
  const handleLevel = (level) => async (event) => {
      setLevel(level);
  };
   
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
                <Grid item xs={2}>  
               
                <ArrowBackIosIcon onClick={history.goBack} style={{fontSize:'20px'}} />
                              
                 </Grid>
                 <Grid item xs={10} > 
                 {
                  params.id ?
                  <Typography style={{fontWeight: 'bold',fontSize: '12px'}}>{params.team1+' vs '+params.team2}</Typography>
                  
                   :
                   <Typography style={{fontWeight: 'bold',fontSize: '15px'}}>Cricket Bet History</Typography>


                 }                   
                 </Grid>

            </Grid>
            <Grid container direction="row" style={{ padding: "10px" }}>
          <Grid item xs={4} onClick={handleLevel('odds')}>
            <Container
              style={{
                width: "100%",
                height: "30px",
                border: "1px solid",
                borderColor: "#05c0b8",
                backgroundColor: level === 'odds' ? "#05c0b8" : "white",
              }}
            >
              <Typography
                align="center"
                style={{
                  color: level === 'odds'? "white" : "black",
                  paddingTop: "3px",
                }}
              >
                Odds
              </Typography>
            </Container>
          </Grid>
          <Grid item xs={4} onClick={handleLevel('fancy')}>
            <Container
              style={{
                width: "100%",
                height: "30px",
                border: "1px solid",
                borderColor: "#05c0b8",
                backgroundColor: level === 'fancy' ? "#05c0b8" : "white",
              }}
            >
              <Typography
                align="center"
                style={{
                  color: level === 'fancy' ? "white" : "black",
                  paddingTop: "3px",
                }}
              >
                 Fancy
              </Typography>
            </Container>
          </Grid>
          <Grid item xs={4} onClick={handleLevel('fancy2')}>
            <Container
              style={{
                width: "100%",
                height: "30px",
                border: "1px solid",
                borderColor: "#05c0b8",
                backgroundColor: level === 'fancy2' ? "#05c0b8" : "white",
              }}
            >
              <Typography
                align="center"
                style={{
                  color: level === 'fancy2' ? "white" : "black",
                  paddingTop: "3px",
                }}
              >
                 Fancy 2
              </Typography>
            </Container>
          </Grid>
          
        </Grid>
        <BidHistory bidHistory = {bidHistory && bidHistory} userId = {isAuth && isAuth.result && isAuth.result.id} level={level === 'odds' ? 'history' : level === 'fancy' ? 'fancyHistory' : 'fancy2History'}/>

            
            
            
        </div>
    )
}

export default CricketFullBidHistory ; 
