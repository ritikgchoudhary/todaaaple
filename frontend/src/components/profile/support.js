import React from "react";
import {Typography, Grid, Paper, Container, Chip, Dialog} from '@material-ui/core/';
import useStyles from "../home/style/game";
import Telegram from "../../images/telegram.png";
import WhatsApp from "../../images/whatsapp.png";
import Customer from "../../images/customer-service.png";



const Help = () => {



 
    const classes = useStyles();


   

   
    
    return (
        <div style={{backgroundColor: '#dbdbdb',height: '100vh'}}>
            
            <a href="https://t.me/earningsource111">
            <Container style={{height:'50px'}}></Container>
            <Container  style={{padding: '20px', backgroundColor: 'white', height: '80px'}}>
            <Grid container direction="row" justify="space-between" alignItems='center'>
              <Grid item>
                  <Typography style={{ color: "#05c0b8", fontWeight: 'bold'}}>Telegram Channel</Typography>
                  <Typography style={{ color: "black",fontSize: '12px'}}>Join our official Telegram channel</Typography>

              </Grid>

              <Grid item>
              <img src={Telegram} height={40}></img>
              </Grid>
            </Grid>
            </Container>
            </a>
            <a href="https://whatsapp.com/channel/0029VaqXwZ1DOQIQesUykz12">
            <Container  style={{paddingTop: '20px',marginTop: '20px', backgroundColor: 'white', height: '80px'}}>
            <Grid container direction="row" justify="space-between" alignItems='center'>
              <Grid item>
                  <Typography style={{ color: "#05c0b8", fontWeight: 'bold'}}>WhatsApp Channel</Typography>
                  <Typography style={{ color: "black",fontSize: '12px'}}>Join our official Whatsapp channel</Typography>

              </Grid>

              <Grid item>
              <img src={WhatsApp} height={40}></img>
              </Grid>
            </Grid>
            </Container>
            </a>
            <a href="https://wa.me/message/6F6ZZQERITWCK1">
            <Container  style={{paddingTop: '20px',marginTop: '20px', backgroundColor: 'white', height: '80px'}}>
            <Grid container direction="row" justify="space-between" alignItems='center'>
              <Grid item>
                  <Typography style={{ color: "#05c0b8", fontWeight: 'bold'}}>Help</Typography>
                  <Typography style={{ color: "black",fontSize: '12px'}}>Recharge, withdrawal & other queries</Typography>

              </Grid>

              <Grid item>
              <img src={Customer} height={40}></img>
              </Grid>
            </Grid>
            </Container>
            </a>
            
           
        </div>
    )
}

export default Help ; 
