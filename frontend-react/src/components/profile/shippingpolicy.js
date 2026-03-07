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

const ShippingPolicy = () => {
    const classes = useStyles();
    const history = useHistory();

    return (
        <div className={classes.page}>
            <div className={classes.frame}>
                <div className={classes.header}>
                    <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.goBack()} />
                    <Typography className={classes.headerTitle}>Shipping & Delivery Policy</Typography>
                </div>

                <Container className={classes.content}>
                    <Typography paragraph>
                        This Shipping & Delivery Policy is part of our Terms and Conditions ("Terms") and should be therefore read alongside our main Terms: https://www.thegooe.com/terms
                    </Typography>

                    <Typography variant="h6">TERMS AND CONDITIONS</Typography>
                    <Typography paragraph>
                        Please carefully review our Shipping & Delivery Policy when purchasing our products. This policy will apply to any order you place with us.
                    </Typography>

                    <Typography variant="h6">WHAT ARE MY SHIPPING & DELIVERY OPTIONS?</Typography>
                    <Typography paragraph>
                        We offer various shipping options. In some cases a third-party supplier may be managing our inventory and will be responsible for shipping your products.
                        <br />
                        By Courier Delivery Services 4 - 5 Days or Within a Week.
                    </Typography>

                    <Typography variant="h6">DO YOU DELIVER INTERNATIONALLY?</Typography>
                    <Typography paragraph>
                        We do not offer international shipping.
                    </Typography>

                    <Typography variant="h6">QUESTIONS ABOUT RETURNS?</Typography>
                    <Typography paragraph>
                        If you have questions about returns, please review our Return Policy: https://www.thegooe.com/refund.
                    </Typography>

                    <Typography variant="h6">HOW CAN YOU CONTACT US ABOUT THIS POLICY?</Typography>
                    <Typography paragraph>
                        User agrees that neither Company nor its group companies, directors, officers or employee shall be liable for any direct or/and indirect or/and incidental or/and special or/and consequential or/and exemplary damages, resulting from the use or/and the inability to use the service or/and for cost of procurement of substitute goods or/and services or resulting from any goods or/and data or/and information or/and services purchased or/and obtained or/and messages received or/and transactions entered into through or/and from the service or/and resulting from unauthorized access to or/and alteration of user's transmissions or/and data or/and arising from any other matter relating to the service, including but not limited to, damages for loss of profits or/and use or/and data or other intangible, even if Company has been advised of the possibility of such damages.
                    </Typography>
                    <Typography paragraph>
                        User further agrees that Company shall not be liable for any damages arising from interruption, suspension or termination of service, including but not limited to direct or/and indirect or/and incidental or/and special consequential or/and exemplary damages, whether such interruption or/and suspension or/and termination was justified or not, negligent or intentional, inadvertent or advertent.
                    </Typography>
                    <Typography paragraph>
                        User agrees that Company shall not be responsible or liable to user, or anyone, for the statements or conduct of any third party of the service. In sum, in no event shall Company's total liability to the User for all damages or/and losses or/and causes of action exceed the amount paid by the User to Company, if any, that is related to the cause of action.
                    </Typography>

                    <Typography variant="h6">DISCLAIMER OF CONSEQUENTIAL DAMAGES</Typography>
                    <Typography paragraph>
                        If you have any further questions or comments, you may contact us by: https://www.thegooe.com/contact
                    </Typography>

                </Container>
            </div>
        </div>
    )
}

export default ShippingPolicy;
