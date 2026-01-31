import React, {useState, useEffect} from 'react';
import {Typography, Grid,FormControl,InputLabel,CircularProgress,FilledInput, Button, Container, Dialog} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as api from "../../../api/auth";
import { useHistory } from "react-router-dom";
import axios from 'axios';

const ModifyPassword = () => {
    const URL =  api.url;
    const history = useHistory();
    const dispatch = useDispatch();
    const [user, setUser] = useState();
    const [loader, setLoader] = React.useState(false);
    const [isAuth, setAuth] = useState(false);

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
      const [openDialog, setDialog] = React.useState({open: false, body: ''});
      


      const [name, setName] = useState({current: '', new: ''});

      const handleChange =(e) => {
          setName({...name,type: 'password', [e.target.name]: e.target.value });
          console.log(name);
      }
      const handleSubmit =async (e) => {
          
        setLoader(true);
        const AuthStr = 'Bearer '.concat(isAuth.token);   
            setName({...name, auth: AuthStr});
            try {
                const { data } = await api.accountSecurity(name);
                dispatch({ type: "accSeq", data: data });
                history.push("/accountSecurity");
              
            } catch (error) {
             setLoader(false);
             setDialog({ ...openDialog, open: true, body: error.response.data.error})
            }
            setLoader(false);

          
      }
      const dialogClose = () => {
        setDialog({ ...openDialog, open: false});
      };
    return (
        <div>
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
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../accountSecurity">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>                  
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" >Modify Password</Typography>
                 </Grid>
            </Grid>
            <Typography style={{padding: '15px'}}>Current Name: {user && user[0].username}</Typography>
            <form  noValidate autoComplete="off" align="center" style={{padding: '15px'}}>
            <FormControl fullWidth variant="outlined" >
                      <InputLabel  >
                      Current Password
                      </InputLabel>
                      <FilledInput
                        fullWidth='true'
                        name="password"
                        id="filled"
                       onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl> 
                    <FormControl fullWidth variant="outlined" style={{marginTop: '20px'}}>
                      <InputLabel  >
                      Confirm Password
                      </InputLabel>
                      <FilledInput
                        fullWidth='true'
                        name="new"
                        id="filled"
                       onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>            
                     </form>
            <Container align="center">
            <Button variant="contained" onClick={handleSubmit} color="primary" style={{marginTop: '30px'}}> 
            Modify Password
            </Button>
            </Container>
           



            
        </div>
    )
}

export default ModifyPassword;
