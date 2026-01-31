import React, {useState, useEffect}from 'react';
import {Typography, Grid, Container, Chip, Paper} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { Link } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";


const MyWallet = () => {
    const [isAuth, setAuth] = useState(false);
    const history = useHistory();
    const URL =  api.url;


    const [user, setUser] = useState([{balance: 0.0}]);

  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
       
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          setUser(response.data);
          if(response.data.block){
            localStorage.removeItem("user");
            window.location.replace("/login");
          
          }
    })
      .catch((error) => {
        console.log(error);
        history.push('/login');
    });
     
    }else{
      history.push('/login');

    }
    
  }, []); 
    const [level, setLevel] = React.useState(1);
    const handleLevel = (level) => async (event) =>  {
        setLevel(level);
    }
    return (
        <div>
            <Container style={{backgroundColor: '#00b8a9', minHeight: '400px'}}>
            <Grid container direction="row" justify="" alignItems="center"style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: '#00b8a9'}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px', color:'black'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" style={{color: 'black'}}>My Wallet</Typography>
                 </Grid>
            </Grid>
            
          <Grid item>
            <Grid container direction="row" justify='space-between' style={{padding: '10px'}}>
              
              <Grid item>
                <Typography style={{ color: "white", fontWeight: "bold" }}>
                  {user && user[0].username}
                </Typography>
              </Grid>
              <Grid item>
                <AccountCircleIcon
                  style={{ color: "white", fontSize: '40px' }}
                />
              </Grid>
            </Grid>
          </Grid>
            <Paper  style={{ backgroundColor:'#e6f8f7', borderRadius: '20px'}}>
                    <Grid container direction="row" justify="space-between" alignItems="center">
                        <Grid item style={{padding: '15px'}}>
                            <Typography style={{ fontSize:'28px', color: '#00b8a9', fontWeight: 'bold' }}>₹ {user && user[0].balance.toFixed(2)}</Typography>
                            <Typography style={{ fontSize:'18px' }}>Total Assets</Typography>
                        </Grid>
        

                    </Grid>
                    <Typography style={{ fontSize:'18px', padding: '15px', paddingTop: '20px'}}>Cashable: {user && (user[0].withWallet < user[0].balance) ? user[0].withWallet.toFixed(2): user[0].balance.toFixed(2)}</Typography>
                    <Grid container direction="row" justify="space-evenly" alignItems="center" style={{padding: '15px'}}>
                        <a href={`https://pay.toddapple.live/placeOrder3/${user && user[0].id}/${user && user[0].token}`} style={{textDecoration: 'none', color: 'black'}}>
                        <Grid item>
                        <Typography style={{ fontSize:'18px'}}>Pre-Order</Typography>
                        </Grid>
                        </a>
                        <Grid item>
                        <Typography style={{ fontSize:'18px'}}>|</Typography>
                        </Grid>
                        <Link to='/withdrawal' style={{textDecoration: 'none', color: 'black'}}>
                        <Grid item>
                        <Typography style={{ fontSize:'18px'}}>Withdrawal</Typography>
                        </Grid>
                        </Link>
        

                    </Grid>

            </Paper>
            
            </Container>

            
        </div>
    )
}

export default MyWallet ; 
