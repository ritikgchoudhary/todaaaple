import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, Container } from '@material-ui/core/';
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

const About = () => {
  const classes = useStyles();
  const [isAuth, setAuth] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setAuth(JSON.parse(loggedInUser));
    } else {
      history.push('/login');
    }
  }, []);

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../profile')} />
          <Typography className={classes.headerTitle}>About Us</Typography>
        </div>

        <List component="nav" aria-label="main mailbox folders" style={{ padding: 0 }}>
          <Link to='/about-us/privacy' style={{ textDecoration: 'none', color: 'black' }}>
            <ListItem button className={classes.listItem}>
              <Typography className={classes.linkText}>Privacy Policy</Typography>
              <ArrowForwardIosIcon style={{ color: "#ccc", fontSize: "16px" }} />
            </ListItem>
          </Link>

          <Link to='/about-us/RDA' style={{ textDecoration: 'none', color: 'black' }}>
            <ListItem button className={classes.listItem}>
              <Typography className={classes.linkText}>Risk Disclosure Agreement</Typography>
              <ArrowForwardIosIcon style={{ color: "#ccc", fontSize: "16px" }} />
            </ListItem>
          </Link>

          <Link to='/about-us/app-statement' style={{ textDecoration: 'none', color: 'black' }}>
            <ListItem button className={classes.listItem}>
              <Typography className={classes.linkText}>App Statement</Typography>
              <ArrowForwardIosIcon style={{ color: "#ccc", fontSize: "16px" }} />
            </ListItem>
          </Link>

          <Link to='/about-us/about' style={{ textDecoration: 'none', color: 'black' }}>
            <ListItem button className={classes.listItem}>
              <Typography className={classes.linkText}>About us</Typography>
              <ArrowForwardIosIcon style={{ color: "#ccc", fontSize: "16px" }} />
            </ListItem>
          </Link>
        </List>
      </div>
    </div>
  );
}

export default About;
