import React, {useState, useEffect} from "react";
import {Typography, Grid, Paper, Container, Chip, Dialog} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import useStyles from "../home/style/game";
import * as api from "../../api/auth";
import { useHistory } from "react-router-dom";
import axios from 'axios';



const Invite = () => {
    const [isAuth, setAuth] = useState(false);
    const history = useHistory();
    const URL =  api.url;


  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
       
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          setUser(response.data);
          
    })
      .catch((error) => {
        console.log(error);
        history.push('/login');
    });
     
    }else{
      history.push('/login');

    }    
    
  }, []); 
    const classes = useStyles();
    const [user, setUser] = useState();

    const [openDialog, setDialog] = React.useState({open: false, body: ''});
    
    const dialogClose = () => {
        setDialog({ ...openDialog, open: false});
    };

    const copy = () => {
      const message = `TODDAPPLES TRUSTED & LONG TERM PLATFORM  🥳
Minimum recharge 200
Minimum withdrawal 230
Refferal bonus 100🥳🥳

3 times official prediction 

⏱️10:30 am - WING 3 MIN
⏱️2:30 pm  BIG/SMALL 3 MIN 
⏱️7:30  WINGO 3 MIN 

High salary 🥳🥳

10% first deposit bonus 

GAME LINK 🔗
https://toddapple.live/login/${user[0].id}`;
      
      navigator.clipboard.writeText(message);
      setDialog({ ...openDialog, open: true, body: 'Copied Successfully' });
  }
    
    return (
        <div style={{backgroundColor: '#62ce94', height: '1000px'}}>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>Invite Friends</Typography>
                 </Grid>
            </Grid>
            <Dialog
                    open={openDialog.open}
                    onClose={dialogClose}
                    PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                    },
                    }}
                
                    
                >
                    <Container style={{backgroundColor: 'black', opacity: '0.6',height: '50px'}}>
                <Typography style={{paddingTop: '10px', color: "white" }}>{openDialog.body}</Typography>
                </Container>
                
                
              </Dialog>
            <Container className={classes.invite}>
                <Grid container direction="column" justify="space-between" alignItems="center" style={{paddingTop: '400px',}}>
                    <Grid item>
                        <Typography>.</Typography>
                    </Grid>
                    <Grid item>
                        <Paper className={classes.qr}>
                          <Typography>.</Typography>
                        </Paper>
                        <Typography variant="h3" align="center" style={{color: '#ffc81f', paddingTop: '10px'}}>{user && user[0].id}</Typography>
                        <Typography align="center">My Invite Code</Typography>

                    </Grid>
                </Grid>
            </Container>
            <Container  style={{paddingTop: '10px',marginTop: '20px', backgroundColor: 'white', height: '50px'}}>
            <Grid container direction="row" justify="space-between" alignItems='center'>
              <Grid item>
                  <Typography style={{ color: "#05c0b8"}}>Invite Friends</Typography>
              </Grid>

              <Grid item>
              <Chip  label="Copy" onClick={copy} style={{backgroundColor:'#00b8a9', color: 'white'}}></Chip>
              </Grid>
            </Grid>
            </Container>

            
        </div>
    )
}

export default Invite ; 
