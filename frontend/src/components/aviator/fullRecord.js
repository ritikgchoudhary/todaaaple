import React,  { useEffect, useState } from 'react';
import {Typography, Grid} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Record from './Record';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth.js";
import { useParams } from "react-router";
import AviatorRecord from './Record';



const AviatorFullRecord = () => {
  const URL =  api.url;
  const params = useParams();
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
      axios.get(`${URL}/getAviatorFullRecordData/`)
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
                
                <ArrowBackIosIcon onClick={history.goBack} style={{fontSize:'20px'}} />
                            
                 </Grid>
                 <Grid item >                    
                <Typography align="center" >Aviator Record History</Typography>
                 </Grid>
            </Grid>
            <AviatorRecord record = {record}/>
            
            
        </div>
    )
}

export default AviatorFullRecord ; 
