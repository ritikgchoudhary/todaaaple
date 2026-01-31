import React,{useState, useEffect} from 'react';
import {Typography, Grid, IconButton, List, ListItem } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { Link } from "react-router-dom";



const About = () => {
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
            <Grid container direction="row" justify="" alignItems="center"style={{paddingLeft: '20px',paddingRight: '20px'}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>                  
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>About us</Typography>
                 </Grid>
            </Grid>
            <List component="nav" aria-label="main mailbox folders" >
            <Link to='/about-us/privacy' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button style={{paddingLeft:'20px'}}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
          <Typography>Privacy Policy</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        <Link to='/about-us/RDA' style={{textDecoration: 'none', color: 'black'}}>

        <ListItem button style={{paddingLeft:'20px'}}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>Risk Disclosure Agreement</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        <Link to='/about-us/app-statement' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button style={{paddingLeft:'20px'}}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>App Statement</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        <Link to='/about-us/about' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button style={{paddingLeft:'20px'}}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>About us</Typography>
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

export default About ; 
