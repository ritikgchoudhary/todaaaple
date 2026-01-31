import React, {useState, useEffect}from 'react';
import {Paper,Container,Typography,Grid,Dialog,CircularProgress} from '@material-ui/core/';
import useStyles from "../home/style/game";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useParams } from "react-router";
import * as api from "../../api/auth";
import { useHistory } from "react-router-dom";
import axios from 'axios';





const Envelop = () => {

  const params = useParams();
    const [isAuth, setAuth] = useState(false);
    const [user, setUser] = useState();
    const [result, setResult] = useState();
    const [amount, setAmount] = useState(0);
    const [loader, setLoader] = useState(false);
    const history = useHistory();
    const URL =  api.url;

    useEffect(() => {
      setLoader(true);
      const loggedInUser =  localStorage.getItem("user");
      if (loggedInUser) {
        const foundUser = JSON.parse(loggedInUser);
        setAuth(foundUser);
        const AuthStr = 'Bearer '.concat(foundUser.token);
        axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
          .then(response => {
              setUser(response.data);
              if(response.data[0].block){
              }
        })
          .catch((error) => {
            console.log(error);
            history.push('/login');
        });

      var red = new XMLHttpRequest();
        red.onreadystatechange = function () {
          if (red.readyState === 4 && red.status === 200) {
            const response = JSON.parse(red.response);
            
            setResult(response);
            setLoader(false);
          }
        };
        
        red.open("GET", `${URL}/validateEnvelop/${params.id}/${foundUser.result.id}`, true);
        red.send();
         
    }else{
      window.location.replace("/login");

    }
   
    
  }, []);

    const classes = useStyles();

    const claimEnvelop = async() => {
        setLoader(true);
        var red = new XMLHttpRequest();
        red.onreadystatechange = function () {
          if (red.readyState === 4 && red.status === 200) {
            const response = JSON.parse(red.response);
            
            setAmount(response.amount);
            setLoader(false);

          }
        };
        red.open("GET", `${URL}/claimEnvelop/${params.id}/${isAuth && isAuth.result.id}`, true);
        red.send();
      
      //setLoader(false);
      
    }
    return (
        <div style={{backgroundColor: '#fefce5', minHeight: '900px'}}>
           <Dialog
          open={loader}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container  align="center" style={{backgroundColor: 'black', opacity: '0.6',height: '100px',paddingTop: "10px"}}>
          <CircularProgress style={{color: 'white',}} />
           <Typography style={{paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
          </Container>
          
          
        </Dialog>
            <Container className={classes.red}>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px',position: "fixed"}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>Red Envelop</Typography>
                 </Grid>
            </Grid>
                <Typography>.</Typography>
            </Container>
            <Container style={{width: '240px', height: '45px', backgroundColor: '#80c493',borderRadius: '10px'}}>
             <Typography align='center' style={{paddingTop: '10px', color: 'white'}}>Red Envelop</Typography>
            </Container>
            <Paper style={{margin: '10px'}}>
              {result && !result.expired ? 
              <div style={{padding: '20px'}}>
              <Container style={{height: '100px', width: '100px',backgroundColor: amount !== 0 ? 'white' : '#efa230', borderRadius: '50px'}} onClick={amount === 0 ? claimEnvelop : null}>
                  <Typography align='center' style={{color: amount !== 0 ? 'green' : 'white', fontSize:'20px', fontWeight: 'bold', paddingTop: '35px'}}>{amount !== 0 ? `₹${amount.toFixed(2)}` : 'Claim'}</Typography>
              </Container>
              </div>
               : 
                <div>   
             <Typography align="center" variant='h4' style={{paddingTop: '30px', color: "#80c493" }}>
                 FINISHED
             </Typography>
             <Typography align="center" variant='h4' style={{paddingBottom: '30px',color: "#80c493" }}>
             I'm sorry you're late!
             </Typography>
             </div>
                }
             
            </Paper>

            
        </div>
    )
}

export default Envelop ; 
