import React, { useState, useEffect } from 'react';
import { Typography, Grid, Container } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    page: {
        minHeight: "100vh",
        backgroundColor: "#F1F5F9",
        display: "flex",
        justifyContent: "center",
        paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
    },
    frame: {
        width: "100%",
        maxWidth: 500,
        minHeight: "100vh",
        backgroundColor: "#fff",
        position: 'relative',
        paddingBottom: '20px'
    },
    header: {
        backgroundColor: '#05c0b8',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    headerTitle: {
        color: 'white',
        flexGrow: 1,
        textAlign: 'center',
        fontWeight: 600,
        marginRight: '20px'
    },
    content: {
        padding: '20px',
        '& p': {
            fontSize: '13px',
            color: '#333',
            lineHeight: '1.6',
            marginBottom: '15px',
            textAlign: 'justify'
        },
        '& h6': {
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '20px',
            marginBottom: '10px',
            color: '#05c0b8'
        }
    }
}));

const AboutUs = () => {
    const classes = useStyles();
    const history = useHistory();

    return (
        <div className={classes.page}>
            <div className={classes.frame}>
                <div className={classes.header}>
                    <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.goBack()} />
                    <Typography className={classes.headerTitle}>About Us</Typography>
                </div>

                <Container className={classes.content}>
                    <Typography variant="h6">Company Introduction</Typography>
                    <Typography paragraph>
                        THE GOOE is an online business that engages in full payment and pre-payment booking/unsubscription business according to the rules and conditions that we have established to regulate the business. We have tie-ups with some other reputed companies to provide best and satisfactory services to our clients/customers. Our company is one of the best among those that follow laws, and we have certain restrictions to prevent online fraud with our clients.
                    </Typography>
                    <Typography paragraph>
                        Minors under the age of 18 are not permitted to participate in THE GOOE Advance Booking/unsubscribing.
                    </Typography>
                    <Typography paragraph>
                        <strong>Note:</strong> Being a responsible trader, we advise our clients to read out our Privacy Statement, Risk Disclosure Agreement and Risk Agreement carefully to minimize their risk.
                    </Typography>

                    <Typography variant="h6">Contact Us</Typography>
                    <Typography paragraph>
                        <strong>After-sales Service E-mail:</strong><br />
                        After-sales Service Hours: 10am-5pm from Monday to Friday.
                        If you can’t get our reply, please wait patiently.
                    </Typography>
                </Container>
            </div>
        </div>
    )
}

export default AboutUs;
