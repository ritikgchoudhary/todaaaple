import React,  { useEffect, useState } from 'react';
import {Typography, Grid} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Record from './BigSmall_Record.jsx';
import axios from 'axios';
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth.js";


const BigSmallFullRecord = () => {
  const URL =  api.url;
  
  const history = useHistory();
    const [isAuth, setAuth] = useState(false);

  useEffect(() => {
    
      const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      console.log('logged in');
     
    }else{
      console.log('not logged in');
      window.location.replace("/login");

    }
    
  }, []); 
    const [record, setRecord] = useState();
    useEffect(() => {
      axios.get(`${URL}/bigsmall_getFullRecord/`)
      .then(response => {
          setRecord(response.data);
    })
      .catch((error) => {
        console.log(error);
    });
      }, []);

    return (
        <div>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
               
                <ArrowBackIosIcon style={{fontSize:'20px'}} onClick={history.goBack} />
                  
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" >{'Big Small'} Record History</Typography>
                 </Grid>
            </Grid>
            <Record record = {record}/>
            
            
        </div>
    )
}

export default BigSmallFullRecord ; 
