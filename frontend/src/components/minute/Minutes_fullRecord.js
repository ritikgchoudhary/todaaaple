import React,  { useEffect, useState } from 'react';
import {Typography, Grid} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Record from './Minutes_Record.jsx';
import axios from 'axios';
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth.js";
import { useParams } from 'react-router-dom/cjs/react-router-dom.min.js';


const MinutesFullRecord = () => {
  const URL =  api.url;
  const params = useParams();
  const history = useHistory();
    const [isAuth, setAuth] = useState(false);
    const [record, setRecord] = useState();

    useEffect(() => {
      const loggedInUser = localStorage.getItem("user");
      if (loggedInUser) {
        const foundUser = JSON.parse(loggedInUser);
        setAuth(foundUser);
        console.log('logged in');
      } else {
        console.log('not logged in');
        window.location.replace("/login");
      }
    }, []);
  
    useEffect(() => {
      axios.get(`${URL}/minute${params.id}_getFullRecord/`)
        .then(response => {
          setRecord(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, [params.id]);

    return (
        <div style={{paddingBottom: '80px'}}>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: '#05c0b8'}}>
                <Grid item xs={4}>  
                
                <ArrowBackIosIcon style={{fontSize:'20px',color: 'white'}} onClick={history.goBack} />
               
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" style={{color: 'white'}}>{`${params.id} Minutes`} Full Record</Typography>
                 </Grid>
            </Grid>
            <Record record = {record}/>
            
            
        </div>
    )
}

export default MinutesFullRecord ; 
