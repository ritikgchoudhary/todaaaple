import React, {useState, useEffect} from "react";
import { Container, Grid, Typography, List, ListItem, Paper } from "@material-ui/core";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link, useParams } from "react-router-dom";
import axios from 'axios';
import * as api from "../../../api/auth";
import { useHistory } from "react-router-dom";
const RechargeHistory = () => {
    const params = useParams();
    const [record, setRecord] = useState();
    const [isAuth, setAuth] = useState(false);
    const [memberRecharge, setMemberRecharge] = useState({balance: 0});
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
          setRecord(response.data);
          if(response.data[0].block){
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
   
    
    return (
        <div style={{backgroundColor: "#fafafa",paddingBottom: '80px'}}>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4} onClick={history.goBack}>  
                
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
               
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>Historical Records</Typography>
                 </Grid>
            </Grid>
            <Grid container direction="row" style={{padding: '10px'}}>
                <Grid item xs={5}>
                    <Typography>Date</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography>Amount</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography>Status</Typography>
                </Grid>
            </Grid>
            {record && record[0].rechargeHistory && record[0].rechargeHistory.map(record => (
            <List component="nav" aria-label="main mailbox folders" >
                
            <ListItem >   
                <Grid
                container
                alignItems="center"
                justify="space-between"
                direction="row"
                >
                <Grid item xs={5}>
                    <Typography style={{fontSize:'10px'}}>{new Date(record.date).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={4}>
                <Typography style={{fontWeight: "bold",}}>₹{(record.amount)}</Typography>
                {
                    record && record.usdt ? 
                    <Typography style={{fontWeight: "bold", fontSize: '12px', color: '#f39c12'}}>{record.usdt} USDT</Typography>
                    : <div></div>
                }
                {
                    record && record.type === 'Bonus' ?                  <Typography style={{fontWeight: "bold",}}>Bonus</Typography>
                   : <div></div>

                }
                </Grid>
                <Grid item xs={3}>
                <Typography style={{color: 'green'}}>Success</Typography>
                </Grid>
                </Grid>
                
                </ListItem>
                
            </List>
            ))}
            
        </div>
    )
}

export default RechargeHistory;
