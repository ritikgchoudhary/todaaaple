import React, {useState, useEffect} from "react";
import { Container, Grid, Typography, List, ListItem } from "@material-ui/core";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import SettingsIcon from "@material-ui/icons/Settings";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Header from "../../images/myHeader.jpg";
import Wallet from "../../images/wallet.png";
import Ship from "../../images/ship.png";
import Return from "../../images/return.png";
import Order from "../../images/orders.png";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import { Link } from "react-router-dom";
import Telegram from "../../images/telegram.png";
import WhatsApp from "../../images/whatsapp.png";
import * as api from "../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";


const Profile = () => {
  const URL =  api.url;
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState([{balance: 0.0}]);
  const [isBlocked, setBlock] = useState({open: false, msg: ''});
  const history = useHistory();

  const removeRecaptcha = () => {
    const script = document.getElementById('recaptcha-script');
    if (script) {
        script.remove();
    }

    const recaptchaElems = document.getElementsByClassName('grecaptcha-badge');
    if (recaptchaElems.length) {
        recaptchaElems[0].remove();
    }
}
  useEffect(() => {
    removeRecaptcha();
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
       
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          setUser(response.data);
          if(response.data.block){
            setBlock({...isBlocked, open: true, msg: 'Account Suspended'});
            localStorage.removeItem("user");
            window.location.replace("/login");
          
          }
    })
      .catch((error) => {
        console.log(error);
        history.push('/login');
    });
     
    }else{
      history.push('/login');

    }
    
  }, []); 
  const [open, setOpen] = React.useState(false);
  
  const logOut = () => {
    localStorage.removeItem("user");
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
    const foundUser = JSON.parse(loggedInUser);
    }else{
      window.location.replace("/login");
    }
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
          open={isBlocked.open}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container  align="center" style={{backgroundColor: 'black', opacity: '0.6',height: '80px',paddingTop: "10px"}}>
           <Typography style={{paddingTop: '10px', color: "white" }}>{isBlocked.msg}</Typography>
          </Container>
          
          
        </Dialog>
      <Container disableGutters maxWidth={false} style={{ 
        backgroundImage: `url(${Header})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "120px"}}>
        <Grid
          container
          justify="space-between"
          direction="row"
          style={{ padding: "10px" }}
        >
          <Grid item>
            <Grid container direction="row">
              <Grid item>
                <AccountCircleIcon
                  style={{ color: "white", paddingRight: "10px" }}
                />
              </Grid>
              <Grid item>
                <Typography style={{ color: "white", fontWeight: "bold" }}>
                  {user && user[0].username}
                </Typography>
              </Grid>
            </Grid> 
          </Grid>
          <Grid item>
            <SettingsIcon style={{ color: "white" }} />
          </Grid>
        </Grid>

        <Grid
          container
          justify="space-evenly"
          direction="row"
          style={{ paddingTop: "20px", paddingBottom: "20px" }}
        >
          <Grid item>
            <Typography
              align="center"
              style={{ color: "white", fontWeight: "bold" }}
            >
              ₹ {user && user[0].balance.toFixed(2)}
            </Typography>
            <Typography style={{ color: "white" }}>Account Balance</Typography>
          </Grid>
          {/* <Grid item>
            <Typography
              align="center"
              style={{ color: "white", fontWeight: "bold" }}
            >
              
              ₹ {user && user[0] && (user[0].withWallet < user[0].balance) ? user[0].withWallet.toFixed(2): user[0].balance.toFixed(2)}
            </Typography>
            <Typography style={{ color: "white" }}>Withdrawal Amount</Typography>
          </Grid> */}
        </Grid>
      </Container>
      {/* <Container style={{ paddingTop: "20px" }}>
        <Grid container direction="row" justify="space-between">
          <Grid item>
            <Typography>My Orders</Typography>
          </Grid>
          <Grid item>
            <Typography style={{ color: "grey" }}>more ›</Typography>
          </Grid>
        </Grid>
      </Container> */}
      {/* <Grid container direction="row" justify="space-between" align="center" style={{ padding: "20px" }}>
        <Grid item>
          <img src={Wallet} alt="wallet" height='25px'></img>
          <Typography>Undeliver</Typography>
        </Grid>
        <Grid item>
        <img src={Ship} alt="wallet" height='25px'></img>
          <Typography>Shipping</Typography>
        </Grid>
        <Grid item>
        <img src={Return} alt="wallet" height='25px'></img>
          <Typography>Return</Typography>
        </Grid>
        <Grid item>
        <img src={Order} alt="wallet" height='25px'></img>
          <Typography>Orders</Typography>
        </Grid>

      </Grid> */}
      <Container>
      <List component="nav" aria-label="main mailbox folders" style={{marginLeft: '-15px', marginRight: '-15px'}} >
      <Link to='/agent-earning' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>Earning as a Agent</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>

        <Link to='/mySalary' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>My Daily Salary</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>

        <Link to='/invitationBonus' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>My Invitation Bonus</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>

        <Link to='/offer-history' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>My Offer history</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey" ,fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        
        
        <Link to='/redenvelope' style={{textDecoration: 'none', color: 'black'}}>

        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>Red Envelope</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey",fontSize: "15px"  }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        <Link to='/mypromotion' style={{textDecoration: 'none', color: 'black'}}>

        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>My Promotion</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey", fontSize: "15px" }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        <Link to='/wallet' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          
          <Grid item>
            <Typography>My Wallet</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey",fontSize: "15px"  }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        <Link to='/bank' style={{textDecoration: 'none', color: 'black'}}>

        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>My bank</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey",fontSize: "15px"  }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
       
        <Link to='/accountSecurity' style={{textDecoration: 'none', color: 'black'}}>

        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>Account Security</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey",fontSize: "15px"  }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
       
        <Link to='/about-us' style={{textDecoration: 'none', color: 'black'}}>
        <ListItem button>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>About us</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey",fontSize: "15px"  }} />
          </Grid>
        </Grid>
          
        </ListItem>
        </Link>
        
       
        <ListItem button style={{marginBottom: '50px'}} onClick={logOut}>
        <Grid
          container
          alignItems="center"
          justify="space-between"
          direction="row"
        >
          <Grid item>
            <Typography>Sign out</Typography>
          </Grid>
          <Grid item>
            <ArrowForwardIosIcon style={{ color: "grey",fontSize: "15px"  }} />
          </Grid>
        </Grid>
          
        </ListItem>

       
      </List>
      </Container>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        
      >
       
        <DialogContent style={{borderRadius: '20px'}}>
          <DialogContentText id="alert-dialog-description" style={{color: 'black'}}>
           Force Clear Cache ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" >
            Cancel
          </Button>
          <Button href="#" onClick={handleClose} color="secondary" autoFocus>
            Clear
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Profile;
