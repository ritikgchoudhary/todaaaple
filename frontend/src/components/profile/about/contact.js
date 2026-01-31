import React from 'react';
import {Typography, Grid } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";



const Contact = () => {

    return (
        <div>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" variant="h6">Contact Us</Typography>
                 </Grid>
            </Grid>
            <div className="container mt-3">
                <h6><b>E-mail:</b> gooethe2@gmail.com</h6>
                <h6 className="mt-3"><b>Mobile:</b> +919644629469</h6>
                <h6 className="mt-3"><b>Address:</b>107, ANKAPAT MARG KAJIPURA, UJJAIN, Ujjain, Madhya Pradesh, 456006</h6>
            </div>
            {/* <Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>E-mail: vgaconsultancy52@gmail.com
</Typography>
<Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>Mobile: +919644629469
</Typography>
<Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>Address: 176, Vallabh Nagar,456010, Ujjain, Madhya Pradesh, India
</Typography>
             */}

            
        </div>
    )
}

export default Contact ; 
