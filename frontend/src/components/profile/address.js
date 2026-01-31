import React,{useState, useEffect} from 'react';
import {Typography, Grid, Container, FilledInput, InputLabel,FormControl,Backdrop,CircularProgress,Dialog} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth";






const MyAddress = () => {
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState();

  useEffect(() => {
    const loggedInUser =  localStorage.getItem("user");
      if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          const response = JSON.parse(request.response);
          setUser(response);
        }
      };
      request.open("GET", `http://server-dev.ap-south-1.elasticbeanstalk.com/getUser/${foundUser.result.id}`, true);
      request.send();
     
    }else{
      console.log('not logged in');
      window.location.replace("/login");

    }
    
  }, [user]); 
  const dispatch = useDispatch();
  const history = useHistory();
  const [otp, setOtp] = useState();
  const [counter, setCounter] = useState(90);
    const [open, setOpen] = React.useState(false);
    const initialState = { name: '', ifsc: '', account: '', confirm: '', state: '', city: '', address: '',email: ''};
    const [formData, setFormData] = useState(initialState);
    const [isLoading, setLoading] = useState(false);
    const [openDialog, setDialog] = React.useState({open: false, body: ''});
    const [canRun, setRun] = useState(false);

    if(canRun) counter > 0 &&  setTimeout(() => setCounter(counter - 1), 1000) ;


    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id});
      console.log(formData)
    };
    const dialogClose = () => {
      setDialog({ ...openDialog, open: false});
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(() => true);
    setOpen(() => true);
    try {

        const { data } = await api.address(formData);
        dispatch({ type: "address", data: data });
        history.push("/profile");
      
    } catch (error) {
     setDialog({ ...openDialog, open: true, body: error.response.data.error})
    }
    setLoading(() => false);
    setOpen(() => false);
     };

    const sendOTP = (e) => {
      if(formData.phone.length !== 10){
        setDialog({ ...openDialog, open: true, body: 'Please Enter Valid Number !'})
      }else{
      setCounter(90);
      setRun(true); 
      var code = Math.floor(100000 + Math.random() * 900000);
      console.log(code);
      setOtp(code);
      var request = new XMLHttpRequest();
      request.open("GET", `http://mysms.msg24.in/api/mt/SendSMS?APIKey=TB4MxbgO4EqzAwFkutLXaA&senderid=RNITBP&channel=Trans&DCS=0&flashsms=0&number=91${formData.phone}&text=Your%20OTP%20is%20${code}&route=15`, true);
      request.send();
      }      
      
    
    }
    return (
        <div style={{paddingBottom: '50px'}}>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>My Address</Typography>
                 </Grid>
            </Grid>
            {isLoading ? (
              <Backdrop open={open} >
              <CircularProgress color="inherit" />
            </Backdrop>
            ) : null}
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
                
            <Typography style={{paddingLeft: '30px',paddingTop: '10px',paddingBottom: '15px',paddingRight: '20px', }}>Add bank card</Typography>
            {user && !user[0].address ? 
            <Container style={{padding: '15px', margin: '15px'}}>
            <Typography>Name: {user[0].address[0] && user[0].address[0].name}</Typography>
            <Typography>City: {user[0].address[0] && user[0].address[0].city}</Typography>
            <Typography>Address: {user[0].address[0] && user[0].address[0].address}</Typography>
            <Typography>State: {user[0].address[0] && user[0].address[0].state}</Typography>
            <Typography>Phone: {user[0].address[0] && user[0].address[0].phone}</Typography>
            </Container>
               : null} 
            
            <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                  <Grid item xs={4}>
                    <Typography>Actual Name: </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <FormControl fullWidth
                      
                      variant="filled"
                     
                    >
                      <InputLabel  >
                      Enter your name
                      </InputLabel>
                      <FilledInput
                        fullWidth='true'
                        name="name"
                        id="filled"
                       onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                  <Grid item xs={4}>
                    <Typography>Mobile Number</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <FormControl fullWidth
                      
                      variant="filled"
                     
                    >
                      <InputLabel  >
                      Enter Mobile Number
                      </InputLabel>
                      <FilledInput
                        fullWidth='true'
                        name="phone"
                        type='phone'
                        id="filled"
                        onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                
                
                
                
                <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                  <Grid item xs={4}>
                    <Typography>State</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <FormControl fullWidth
                      
                      variant="filled"
                     
                    >
                      <InputLabel  >
                      Enter State Name
                      </InputLabel>
                      <FilledInput
                        fullWidth='true'
                        name="state"
                        id="filled"
                        onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                  <Grid item xs={4}>
                    <Typography>City</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <FormControl fullWidth
                      
                      variant="filled"
                     
                    >
                      <InputLabel  >
                      Enter City Name
                      </InputLabel>
                      <FilledInput
                        fullWidth='true'
                        name="city"
                        
                        id="filled"
                        onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                  <Grid item xs={4}>
                    <Typography>Address</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <FormControl fullWidth
                      
                      variant="filled"
                     
                    >
                      <InputLabel  >
                      Enter Your Address
                      </InputLabel>
                      <FilledInput
                        fullWidth='true'
                        name="address"
                        id="filled"
                        onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                
                
                    
                          <Container onClick={handleSubmit} style={{paddingTop:'12px',margin:'20px', backgroundColor:'#05c0b8',height: '50px', borderRadius: '10px'}}>
                          <Grid container direction="row" justify="space-evenly">
                              <Grid item>
                                  <Typography style={{ color: "white", fontWeight: "bold" }}>Add Now</Typography>
                              </Grid>
                              </Grid>
                          </Container>
            
            </div>
            
            
        
    )
}

export default MyAddress ; 
