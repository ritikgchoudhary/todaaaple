import React from 'react';
import {Typography, Grid } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";



const AboutUs = () => {

    return (
        <div>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" variant="h6">About us</Typography>
                 </Grid>
            </Grid>
            <Typography align="center"  display="block" >Company Introduction</Typography>
            <Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>THE GOOE is an online  business that engages in full payment and pre-payment booking/unsubscription business according to the rules and conditions that we have established to regulate the business. We have tie-up with some other reputed companies to provide best and satisfactory services to our clients/customers. Our company is one of the best among to follow laws and we have certain restrictions to prevent online fraud with our clients we do not allow. Minors under the age of 18 are not permitted to participate in THE GOOE Advance Booking/unsubscribing. Note: Being responsible trader we advised our client to readout our Privacy Statement, Risk Disclosure Agreement and Risk Agreement carefully to minimize their risk.
Note: Being responsible trader we advised our client to readout our Privacy Statement, Risk Disclosure Agreement and Risk Agreement carefully to minimize their risk.</Typography>
            <Typography align="center"  display="block" >Contact us</Typography>
            <Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>After-sales Service E-mail:
After-sales Service Hours: 10am-5pm from Monday to Friday.
If you can’t get our reply, please wait patiently.</Typography>
            

            
        </div>
    )
}

export default AboutUs ; 
