import React, {useState, useEffect}from 'react';
import {Typography, Grid, IconButton, List, ListItem } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { Link } from "react-router-dom";



const AccountSecurity = () => {
  const [isAuth, setAuth] = useState(false);
  

  useEffect(() => {
    
      const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      console.log('logged in');
     
    }else{
      console.log('not logged in');
      window.location.replace("/login");

    }
    
  }, []); 
    return (
        <div>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>                  
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" >Account Security</Typography>
                 </Grid>
            </Grid>
            <Typography align="center"  display="block" style={{paddingTop: '30px', paddingBottom: '30px',fontSize:'20px'}}>Account Security</Typography>

            <List component="nav" aria-label="main mailbox folders" >
            <Link to='/accountSecurity/name' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button style={{paddingLeft:'20px'}}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
          <Typography>Modify the name</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        <Link to='/accountSecurity/password' style={{textDecoration: 'none', color: 'black'}}>

        <ListItem button style={{paddingLeft:'20px'}}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>Modify the login password</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        <Link to='/accountSecurityhttps://pay.toddapple.live/placeOrder3' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button style={{paddingLeft:'20px'}}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>Modify payment password</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        

        </List>

            
        </div>
    )
}

export default AccountSecurity ; 
