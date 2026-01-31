import React from 'react';
import {Typography, Grid } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";



const ShippingPolicy = () => {

    return (
        <div>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" variant="h6">Shipping & Delivery Policy</Typography>
                 </Grid>
            </Grid>
            <Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>
            This Shipping & Delivery Policy is part of our Terms and Conditions ("Terms") and should be therefore read alongside our main Terms:https://www.thegooe.com/terms
            </Typography>
            <Typography align="center"  display="block" >TERMS AND CONDITIONS</Typography>
            <Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>
            Please carefully review our Shipping & Delivery Policy when purchasing our products. This policy will apply to any order you place with us.

</Typography>
<Typography align="center"  display="block" >WHAT ARE MY SHIPPING & DELIVERY OPTIONS?</Typography>
<Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>
We offer various shipping options. In some cases a third-party supplier may be managing our inventory and will be responsible for shipping your products
By Courier Delivery Services 4 -5 Days or Within a Week.

</Typography>
<Typography align="center"  display="block" >DO YOU DELIVER INTERNATIONALLY?
</Typography>
<Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>
We do not offer international shipping.
</Typography>

<Typography align="center"  display="block" >QUESTIONS ABOUT RETURNS?
</Typography>
<Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>
If you have questions about returns, please review our Return Policy: https://www.thegooe.com/refund.
</Typography>
<Typography align="center"  display="block" >HOW CAN YOU CONTACT US ABOUT THIS POLICY?
</Typography>
<Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px'}}>
User agrees that neither Company nor its group companies, directors, officers or employee shall be liable for any direct or/and indirect or/and incidental or/and special or/and consequential or/and exemplary damages, resulting from the use or/and the inability to use the service or/and for cost of procurement of substitute goods or/and services or resulting from any goods or/and data or/and information or/and services purchased or/and obtained or/and messages received or/and transactions entered into through or/and from the service or/and resulting from unauthorized access to or/and alteration of user's transmissions or/and data or/and arising from any other matter relating to the service, including but not limited to, damages for loss of profits or/and use or/and data or other intangible, even if Company has been advised of the possibility of such damages.

User further agrees that Company shall not be liable for any damages arising from interruption, suspension or termination of service, including but not limited to direct or/and indirect or/and incidental or/and special consequential or/and exemplary damages, whether such interruption or/and suspension or/and termination was justified or not, negligent or intentional, inadvertent or advertent.

User agrees that Company shall not be responsible or liable to user, or anyone, for the statements or conduct of any third party of the service. In sum, in no event shall Company's total liability to the User for all damages or/and losses or/and causes of action exceed the amount paid by the User to Company, if any, that is related to the cause of action.
</Typography>

<Typography align="center"  display="block" >DISCLAIMER OF CONSEQUENTIAL DAMAGES

</Typography>
<Typography align="center"  display="block"  style={{fontSize:'10px', padding: '20px',paddingBottom: '60px'}}>
If you have any further questions or comments, you may contact us by:https://www.thegooe.com/contact</Typography>








            

            
        </div>
    )
}

export default ShippingPolicy ; 
