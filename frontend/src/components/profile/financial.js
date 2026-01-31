import React, {useState, useEffect}from 'react';
import {Typography, Grid, Container} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";



const Financial = () => {
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
                <Typography align="center" st>Financial Details</Typography>
                 </Grid>
            </Grid>
            <Container  style={{paddingTop:'12px',marginTop:'10px', backgroundColor:'#05c0b8',height: '50px'}}>
                    <Grid container direction="row" justify="space-evenly">
                        <Grid item>
                            <Typography style={{ color: "white", fontWeight: "bold" }}>Create Time</Typography>
                        </Grid>
                        <Grid item>
                            <Typography style={{ color: "white",fontWeight: "bold"}}>Financial Types</Typography>
                        </Grid>
                        <Grid item>
                            <Typography style={{ color: "white",fontWeight: "bold"}}>Amount</Typography>
                        </Grid>

                    </Grid>

            </Container>

            
        </div>
    )
}

export default Financial ; 
