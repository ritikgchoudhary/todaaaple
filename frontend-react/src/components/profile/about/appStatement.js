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
    }
  }
}));

const AppStatement = () => {
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
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.goBack()} />
          <Typography className={classes.headerTitle}>App Statement</Typography>
        </div>

        <Container className={classes.content}>
          <Typography paragraph>
            Frany-Shop is an app that lets you access online business of the Veymo Fashions Private Limited which is an incorporated company under the Indian Companies Act. This app accesses your information to provide you better services and to protect your personal information. We promise to comply with relevant laws and regulations, provide you with latest versions. If you agree to the content above/privacy statement of Frany-Shop, you may continue.
          </Typography>
        </Container>
      </div>
    </div>
  )
}

export default AppStatement;
