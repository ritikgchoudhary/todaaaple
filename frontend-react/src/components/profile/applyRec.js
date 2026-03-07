import React, { useState, useEffect } from "react";
import { Container, Grid, Typography, List, ListItem, Paper } from "@material-ui/core";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth";
import axios from 'axios';
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
    recordItem: {
        borderBottom: '1px solid #eee',
        padding: '15px',
        backgroundColor: 'white'
    },
    statusSuccess: {
        color: '#4caf50',
        fontWeight: 'bold',
        fontSize: '13px'
    }
}));

const ApplyRecord = () => {
    const classes = useStyles();
    const [record, setRecord] = useState();
    const history = useHistory();
    const URL = api.url;

    useEffect(() => {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
            const foundUser = JSON.parse(loggedInUser);
            const AuthStr = 'Bearer '.concat(foundUser.token);
            axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
                .then(response => {
                    setRecord(response.data);
                })
                .catch((error) => {
                    console.log(error);
                    history.push('/login');
                });
        } else {
            history.push('/login');
        }
    }, []);

    return (
        <div className={classes.page}>
            <div className={classes.frame}>
                <div className={classes.header}>
                    <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../mypromotion')} />
                    <Typography className={classes.headerTitle}>Apply Record</Typography>
                </div>

                <Grid container style={{ padding: '15px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                    <Grid item xs={5}>
                        <Typography variant="caption" style={{ fontWeight: 'bold', color: '#666' }}>DATE</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="caption" style={{ fontWeight: 'bold', color: '#666' }}>AMOUNT</Typography>
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: 'right' }}>
                        <Typography variant="caption" style={{ fontWeight: 'bold', color: '#666' }}>STATUS</Typography>
                    </Grid>
                </Grid>

                {record && record[0].bonusRecord && record[0].bonusRecord.length > 0 ? (
                    record[0].bonusRecord.map((item, index) => (
                        <div key={index} className={classes.recordItem}>
                            <Grid container alignItems="center">
                                <Grid item xs={5}>
                                    <Typography style={{ fontSize: '13px', color: '#333' }}>
                                        {new Date(item.date).toLocaleDateString()}
                                    </Typography>
                                    <Typography style={{ fontSize: '11px', color: '#999' }}>
                                        {new Date(item.date).toLocaleTimeString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography style={{ fontWeight: "bold", fontSize: '14px' }}>₹{item.amount}</Typography>
                                </Grid>
                                <Grid item xs={3} style={{ textAlign: 'right' }}>
                                    <Typography className={classes.statusSuccess}>Success</Typography>
                                </Grid>
                            </Grid>
                        </div>
                    ))
                ) : (
                    <Container style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
                        <Typography>No records found</Typography>
                    </Container>
                )}
            </div>
        </div>
    )
}

export default ApplyRecord;
