import React, {useState, useEffect}from 'react';
import {Typography, Grid } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";



const AppStatement = () => {
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
                <Link to="../about-us">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>App Statement</Typography>
                 </Grid>
            </Grid>
            <Typography align="center"  display="block" style={{fontSize:'10px'}}>Frany-Shop is an app that lets you to access online business of the Veymo Fashions Private Limited which is incorporated company under Indian Companies Act. This app accesses your information to provide you better services and to protect your personal information. We promise to comply with relevant laws and regulations, provide you with latest versions of. If you agree to the content above/privacy statement of Frany-Shop press ok button to continue…</Typography>

            
        </div>
    )
}

export default AppStatement ; 
