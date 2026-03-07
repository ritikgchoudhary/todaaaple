import React from "react";
import { Typography, Grid, Button, Container } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Telegram from "../../images/telegram.png";
import WhatsApp from "../../images/whatsapp.png";
import Customer from "../../images/customer-service.png";
import { useHistory } from 'react-router-dom';

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
  section: {
    padding: "15px",
    margin: "15px 15px 0",
    backgroundColor: "#fff",
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
    border: '1px solid #f0f0f0',
    transition: 'transform 0.2s',
    '&:active': {
      transform: 'scale(0.98)'
    }
  },
  iconImage: {
    width: '45px',
    height: '45px',
    objectFit: 'contain',
    marginRight: '20px',
  },
  textContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#333",
  },
  sub: {
    fontSize: 13,
    color: "#05c0b8",
    marginTop: '2px',
    fontWeight: 500
  },
  actionButton: {
    backgroundColor: "rgba(5, 192, 184, 0.1)",
    color: "#05c0b8",
    textTransform: "none",
    fontWeight: 600,
    fontSize: 12,
    padding: "6px 16px",
    borderRadius: '20px',
    minWidth: 'auto',
  }
}));

const SupportItem = ({ href, icon, title, subtitle }) => {
  const classes = useStyles();

  return (
    <a href={href} className={classes.section} target="_blank" rel="noopener noreferrer">
      <img src={icon} alt={title} className={classes.iconImage} />
      <div className={classes.textContainer}>
        <Typography className={classes.title}>{title}</Typography>
        <Typography className={classes.sub}>{subtitle}</Typography>
      </div>
      <Button className={classes.actionButton} disableElevation>
        Open
      </Button>
    </a>
  );
};

const Help = () => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.goBack()} />
          <Typography className={classes.headerTitle}>Customer Service</Typography>
        </div>

        <div style={{ paddingBottom: '20px' }}>
          <SupportItem
            href="https://t.me/earningsource111"
            icon={Telegram}
            title="Telegram Channel"
            subtitle="Official Updates & News"
          />

          <SupportItem
            href="https://whatsapp.com/channel/0029VaqXwZ1DOQIQesUykz12"
            icon={WhatsApp}
            title="WhatsApp Channel"
            subtitle="Join Our Community"
          />

          <SupportItem
            href="https://wa.me/message/6F6ZZQERITWCK1"
            icon={Customer}
            title="Live Support"
            subtitle="Recharge & Withdrawal Help"
          />
        </div>

      </div>
    </div>
  )
}

export default Help;
