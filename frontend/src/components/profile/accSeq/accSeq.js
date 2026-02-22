import React, { useState, useEffect } from 'react';
import { Typography, Grid, List, ListItem, Container, Paper } from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
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
  listItem: {
    borderBottom: '1px solid #f0f0f0',
    padding: '20px',
    '&:hover': {
      backgroundColor: '#f9f9f9'
    }
  },
  linkText: {
    flexGrow: 1,
    fontSize: '16px',
    color: '#333'
  }
}));

const AccountSecurity = () => {
  const classes = useStyles();
  const [isAuth, setAuth] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
    } else {
      history.push('/login');
    }
  }, []);

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../profile')} />
          <Typography className={classes.headerTitle}>Account Security</Typography>
        </div>

        <List component="nav" aria-label="main mailbox folders" style={{ padding: 0 }}>
          <Link to='/accountSecurity/name' style={{ textDecoration: 'none', color: 'black' }}>
            <ListItem button className={classes.listItem}>
              <Typography className={classes.linkText}>Modify Name</Typography>
              <ArrowForwardIosIcon style={{ color: "#ccc", fontSize: "16px" }} />
            </ListItem>
          </Link>

          <Link to='/accountSecurity/password' style={{ textDecoration: 'none', color: 'black' }}>
            <ListItem button className={classes.listItem}>
              <Typography className={classes.linkText}>Modify Login Password</Typography>
              <ArrowForwardIosIcon style={{ color: "#ccc", fontSize: "16px" }} />
            </ListItem>
          </Link>

          <Link to='/accountSecurity/payment' style={{ textDecoration: 'none', color: 'black' }}>
            <ListItem button className={classes.listItem}>
              <Typography className={classes.linkText}>Modify Payment Password</Typography>
              <ArrowForwardIosIcon style={{ color: "#ccc", fontSize: "16px" }} />
            </ListItem>
          </Link>
        </List>
      </div>
    </div>
  );
}

export default AccountSecurity;
