import React,  { useEffect, useState } from 'react';
import {Typography, Grid} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Record from './Record';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import * as api from "../../../api/auth";
import { useParams } from "react-router";
import SapreRecord from "./sapreRecord";
import BconeRecord from "./bconeRecord";
import EmerdRecord from "./emerdRecord";


const FullRecord = () => {
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
      axios.get(`${URL}/getFullRecord/`)
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
                <Link to="../wingo">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>                  
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" >{params.game === '0' ? 'Parity' : params.game === '1' ? 'Sapre': params.game === '2' ? 'Bcone': 'Emerd'} Record History</Typography>
                 </Grid>
            </Grid>
            {parseInt(params.game) === 0 ?
      <Record record = {record}/>
      :
      null
      
      }
      {parseInt(params.game) === 1 ?
      <SapreRecord record = {record}/>
      :
      null
      
      }
      {parseInt(params.game) === 2 ?
      <BconeRecord record = {record}/>
      :
      null
      
      }
      {parseInt(params.game) === 3 ?
      <EmerdRecord record = {record}/>
      :
      null
      
      }
            
            
        </div>
    )
}

export default FullRecord ; 
