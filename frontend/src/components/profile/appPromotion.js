import React, {useState, useEffect} from "react";
import {Typography,Dialog, Grid, Container, Button,FilledInput,InputLabel,FormControl,CircularProgress} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as api from "../../api/auth";
import { useHistory } from "react-router-dom";
import axios from 'axios';




const ApplyPromotion = () => {
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState([{bonus: 'Loading'}]);
  const [loader, setLoader] = React.useState(false);
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
    const dispatch = useDispatch();

    const [error, setError] = useState("");
    const [formData, setFormData] = useState({amount: 0});
    const [openDialog, setDialog] = React.useState({open: false, body: ''});

    const showDialog = (body) => (event) => {
      if (
        event.type === "keydown" &&
        (event.key === "Tab" || event.key === "Shift")
      ) {
        return;
      }
      setDialog({ ...openDialog, open: true, body: body });
    };
  
    const dialogClose = () => {
      setDialog({ ...openDialog, open: false, body: ''});
    };
    const handleChange = (e) => {
      
        setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id});
      };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const AuthStr = 'Bearer '.concat(isAuth.token);
        setFormData({...formData, auth: AuthStr});
        try {
            setLoader(true);
            const { data } = await api.applyBonus(formData);
            dispatch({ type: "applyBonus", data: data });
            history.push("/mypromotion");
         
        } catch (error) {
            setLoader(false);
            setDialog({...openDialog, open: true, body: error.response.data.error});

        }
        setLoader(false);

        
      };
    
   
    return (
        <div>
            <Grid container direction="row" justify="" alignItems="center"style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../mypromotion">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>Apply To Balance</Typography>
                 </Grid>
            </Grid>
            <Typography variant="h5" style={{paddingLeft: '35px', paddingTop: '15px'}}>My Bonus</Typography>
            <Typography variant="h5" style={{paddingLeft: '35px',fontWeight: 'bold'}}>₹ {user && user[0].bonus}</Typography>
            <Typography  style={{paddingLeft: '35px', paddingTop: '15px'}}>Max-Value of single Apply: ₹200000</Typography>
            <Typography  style={{paddingLeft: '35px'}}>Min-Value of single Apply: ₹10</Typography>
            <Typography  style={{paddingLeft: '22px', paddingTop: '20px',fontWeight: 'bold'}}>Apply Amount</Typography>
            <Grid container direction="row" justify="flex-start" alignItems="center" style={{paddingLeft: '22px',paddingTop: '20px'}}>
             <Grid item><Typography style={{fontWeight: 'bold'}}>₹</Typography></Grid>
             <Grid item>
             <FormControl fullWidth
                      
                      variant="filled"
                      
                    >
                      <InputLabel   >
                      Enter Amount
                      </InputLabel>
                      <FilledInput
                        type="number"
                        fullWidth='true'
                        name="amount"
                        id="filled"
                        onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>
             </Grid>
            </Grid>
            <Typography  style={{paddingLeft: '28px',paddingTop: '5px'}}>Limit 1 TImes per day for Apply Bonus to Balance!</Typography>
            <Typography  style={{paddingLeft: '22px',fontWeight: 'bold',paddingTop: '5px'}}>Service Time</Typography>
            <Typography  style={{paddingLeft: '28px',paddingTop: '5px'}}>Monday 10:00-17:00</Typography>
            <Typography  style={{paddingLeft: '28px'}}>Tuesday 10:00-17:00</Typography>
            <Typography  style={{paddingLeft: '28px'}}>Wednesday 10:00-17:00</Typography>
            <Typography  style={{paddingLeft: '28px'}}>Thursday 10:00-17:00</Typography>
            <Typography  style={{paddingLeft: '28px'}}>Friday 10:00-17:00</Typography>

            <Container style={{backgroundColor: '#00b8a9', height: '50px', width: '100%', marginLeft: '30px',marginTop: '30px',marginBottom: '5px',marginRight: '30px',borderRadius: '8px'}}>
                <Typography  align="center" ><Button type="submit" onClick={handleSubmit} style={{paddingTop: '12px',color: 'white', textTransform: 'none'}}>Submit</Button></Typography>
              </Container>
              <Container style={{backgroundColor: 'grey', height: '50px', width: '100%', marginLeft: '30px',marginTop: '10px',marginBottom: '90px',marginRight: '30px',borderRadius: '8px'}}>
                <Typography align="center" style={{paddingTop: '12px',color: 'white'}}>Records</Typography>
              </Container>
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
     




            
        </div>
    )
}

export default ApplyPromotion
