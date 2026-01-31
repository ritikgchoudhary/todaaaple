import React, {useState, useEffect} from "react";
import { Container, Grid, Typography, List, ListItem } from "@material-ui/core";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import * as api from "../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";

const ApplyRecord = () => {
    const [record, setRecord] = useState();
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
        <div>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../mypromotion">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>Apply Record</Typography>
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
            {record && record[0].bonusRecord && record[0].bonusRecord.map(record => (
            <List component="nav" aria-label="main mailbox folders"  >
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
                </Grid>
                <Grid item xs={3}>
                <Typography style={{color: 'green'}}>success</Typography>
                </Grid>
                </Grid>
                
                </ListItem>
            </List>
            ))}
            
        </div>
    )
}

export default ApplyRecord;
