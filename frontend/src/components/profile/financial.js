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
    paddingBottom: '20px',
    display: 'flex',
    flexDirection: 'column'
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
  tableHeader: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderBottom: '1px solid #ddd'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: '13px',
    color: '#666'
  },
  noData: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    flexDirection: 'column',
    marginTop: '50px'
  }
}));

const Financial = () => {
  const classes = useStyles();
  const history = useHistory();
  const [isAuth, setAuth] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setAuth(JSON.parse(loggedInUser));
    } else {
      history.push("/login");
    }
  }, []);

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../profile')} />
          <Typography className={classes.headerTitle}>Financial Details</Typography>
        </div>

        <Grid container className={classes.tableHeader}>
          <Grid item xs={4}>
            <Typography className={classes.headerText}>Create Time</Typography>
          </Grid>
          <Grid item xs={4} style={{ textAlign: 'center' }}>
            <Typography className={classes.headerText}>Type</Typography>
          </Grid>
          <Grid item xs={4} style={{ textAlign: 'right' }}>
            <Typography className={classes.headerText}>Amount</Typography>
          </Grid>
        </Grid>

        <div className={classes.noData}>
          <Typography>No financial records found</Typography>
        </div>
      </div>
    </div>
  )
}

export default Financial;
