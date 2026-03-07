import React from 'react';
import {Typography, Grid } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";



const Refund = () => {

  
  return (
    <div>
        <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
            <Grid item xs={3}>  
            <Link to="../">
            <ArrowBackIosIcon style={{fontSize:'20px'}} />
            </Link>
            
                            
             </Grid>
             <Grid item xs={7}>                    
            <Typography align="center" variant="h6"><b>Refund Policy</b></Typography>
             </Grid>
        </Grid>
        <Typography align="center"  display="block"  style={{fontSize:'14px', padding: '20px'}}>
        With our simple returns process, you can shop online worry-free.



If something doesn’t work out, you can send most items back within 30 days of delivery.
<br />
<br />

<ul>
  <li>Start the return process within 30 days of receiving your item.</li>
  <li>Refund will be processed in under 3-5 working days. Refund will be credited to customer original payment method or source.</li>
  <li>Product must be in new or unused condition, with all original product inserts and accessories.</li>
  <li>Shipping costs will be the responsibility of the customer in cases of buyer’s remorse returns, such as an item didn’t fit, didn’t like the color/quality, changed your mind, ordered by mistake, bought it somewhere else, etc.</li>
  <li>We will refund the full cost of the merchandise and shipping charges if the return is a result of our error or defective product.</li>
  <li>Ship the product as soon as possible so it arrives at our facility within 45 days of receipt of the item.  (See Product-Specific Return Policies for exceptions)</li>
  <li>We inspect all returned items and will refund you based on the condition of the item. We award a partial refund for opened or used products.</li>

</ul>


<br />
<br />

<h5>
<b>How to Return an Item</b></h5>
<br />
<p>
Log into My Account to fill out our return initiation form to receive your shipping label and return instructions. Don’t have an account? Check out our step by step guide, How to Return an Item.

</p>
<br />
<h5><b>Defective Product and Returns Due to Our Error</b></h5>

<br />
<p>If there are mistakes with your order, or products arrive defective/damaged at the time of receipt, we’ll make it right by:</p>





















Sending you replacement parts or accessories

Replacing the product or

Issue a refund** 

And we’ll also cover the cost of any return shipping

If the product is not defective, return shipping fees will apply and/or a partial refund may be issued



** See our Product-Specific Return Policies for specific items exceptions and policies.



Products Returned After 30 days

Did you miss the 30-day return window? Great news! You may still start a return after 30 days, but you may get a partial refund depending on the following:



Condition of the merchandise

Cost of the original and/or return shipping charges deduction from your refund

If we send you a replacement item, we need to receive the original item at our warehouse within 30 days of you starting the return process. Otherwise, we will charge you full price for the replacement.



Please contact Customer Care if you need to return an item outside the 30-return time frame.

 

Return Policy Rules and Exceptions

On the following:



Non-Returnable Items

Product-Specific Return Policies

Oversized Item Return Policy

International Returns

Refund Policy

Holiday Return Policy
        </Typography>
        
        

        
    </div>
)
}

export default Refund ; 
