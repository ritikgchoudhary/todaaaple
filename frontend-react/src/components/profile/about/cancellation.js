import React from "react";
import { Typography, Grid } from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Link } from "react-router-dom";

const Cancellation = () => {
  return (
    <div>
      <Grid
        container
        direction="row"
        justify=""
        alignItems="center"
        style={{
          paddingLeft: "20px",
          paddingTop: "15px",
          paddingBottom: "15px",
          paddingRight: "20px",
          backgroundColor: "white",
        }}
      >
        <Grid item xs={2}>
          <Link to="../">
            <ArrowBackIosIcon style={{ fontSize: "20px" }} />
          </Link>
        </Grid>
        <Grid item xs={8}>
          <Typography align="center" variant="h6" style={{marginLeft:"5%"}}>
            <b>Cancellation Policy</b>
          </Typography>
        </Grid>
      </Grid>
      <Typography
        align="center"
        display="block"
        style={{ fontSize: "14px", padding: "20px" }}
      >
        At TheGooeShop Exclusives we believe in keeping our customers
        happy...always. Our return policies are created with you in mind and
        ensure that you are satisfied every step of the way .However, should an
        unfortunate event arise where you may have to return a product for
        refund or replacement, we have laid out an easy process to assist you
        with it.
        <br />
        <br />
        Once you make the payment, we will send the product/s to you in the
        quickest possible time. However, if you want to cancel an order, you
        have to do it within 24 hours from the time of ordering. If you fail to
        cancel within 24 hours, or, if the product already gets dispatched from
        our warehouse, you won’t be eligible for cancellation.
        <br />
        <br />
        If your order is eligible for cancellation and is cancelled, we will
        debit a cancellation charge of 2%. The balance amount shall be refunded
        in the same mode as your mode of payment. The refund might take 7 to 10
        working days to process, depending on our payment gateway
        <br />
        <br />
        Please contact Customer Care if you need to return an item outside the
        30-return time frame.
        <br />
        <br />
        <b>Return Policy Rules and Exceptions</b>
        <br />
        <br />
        <b>On the following:</b>
        <ul>
          <li>Non-Returnable Items</li>
          <li>Product-Specific Return Policies</li>
          <li>Oversized Item Return Policy</li>
          <li>International Returns</li>
          <li>Refund Policy</li>
          <li>Holiday Return Policy</li>
        </ul>
      </Typography>
    </div>
  );
};

export default Cancellation;
