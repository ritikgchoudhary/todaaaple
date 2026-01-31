import React,{useState, useEffect} from 'react';
import {Typography, Grid, Container, FilledInput, InputLabel,FormControl,Button,CircularProgress,Dialog, Paper} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import {Payment, Person, LocalPhone, AccountBalance,LocationCity, Business,Email} from "@material-ui/icons"
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth";
import SmsIcon from '@material-ui/icons/Sms';
import axios from 'axios';


const MyBank = () => {
  const URL =  api.url;
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState();
  const history = useHistory();
  const [isEdit, setEdit] = useState(false);

// const SITE_KEY = "6Le-ej8mAAAAAL_Fl83Pp_iZ5ZLKpyQ8KWuTTF83";

 
// useEffect(() => {
//   const loadScriptByURL = (id, url, callback) => {
//     const isScriptExist = document.getElementById(id);
 
//     if (!isScriptExist) {
//       var script = document.createElement("script");
//       script.type = "text/javascript";
//       script.src = url;
//       script.id = id;
//       script.onload = function () {
//         if (callback) callback();
//       };
//       document.body.appendChild(script);
//     }
 
//     if (isScriptExist && callback) callback();
//   }
 
//   // load the script by passing the URL
//   loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`, function () {
    
//   });
// }, []);
  const handleEdit = () => {
    setEdit(true);
  }

  const handleEditClose = () => {
    setEdit(false);
  }


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
  const dispatch = useDispatch();
  //const [clicked, setClicked] = useState(false);
  
  const [counter, setCounter] = useState(90);
  const initialState = {phone: '', name: '', ifsc: '', account: '', confirm: '', state: '', city: '', address: '',email: '', code: '',upi: ''};
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setLoading] = useState(false);
  const [openDialog, setDialog] = React.useState({open: false, body: ''});
  const [canRun, setRun] = useState(false);
  const [otpDialog, setOtpDialog] = React.useState({open: false, body: ''});

   
     const otpdialogClose = () => {
       setOtpDialog({ ...otpDialog, open: false, body: ''});
     };
    if(canRun) counter > 0 &&  setTimeout(() => setCounter(counter - 1), 1000) ;


    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id, userPhone: isAuth.result.phone});
      
      //setUpi({...upi, [e.target.name]: e.target.value});
    };
    const dialogClose = () => {
      setDialog({ ...openDialog, open: false});
    };
    // const UPIChange = (e) => {
    //   setUpi({...upi, [e.target.name]: e.target.value, userId: isAuth.result.id, userPhone: isAuth.result.phone})
    // }
    // const handleUPI = async (e) => {
    //   e.preventDefault();
    //   if(!upi.upi.includes('@') || upi.upi.length < 5){
    //     setDialog({ ...openDialog, open: true, body: 'Invalid UPI'})
    //   }else{
    //   setLoading(() => true);
      
    //   try {
        
    //     setOtpDialog({otpDialog, open: true});
    //     // const { data } = await api.upi(upi);
    //     // dispatch({ type: "upi", data: data });
    //     // history.push("/profile");
      
    //   } catch (error) {
    //   setDialog({ ...openDialog, open: true, body: error.response.data.error})
    //   }
    //   setLoading(() => false);
    //   }


    // }
    const submitOTP = async() => {
      setLoading(() => true);
      
      
      try {
        
          const { data } = await api.bank(formData);
          dispatch({ type: "bank", data: data });
          history.push("/profile");
        // if(level === 0){
        //   const AuthStr = 'Bearer '.concat(isAuth.token);   
        //   setUpi({...upi, auth: AuthStr});
        //   const { data } = await api.upi(upi);
        //   dispatch({ type: "upi", data: data });
        //   history.push("/profile");
        // }
        // else{
        //   

        // }
        
      
      } catch (error) {
      setDialog({ ...openDialog, open: true, body: error.response.data.error})
      }
      
      setLoading(() => false);
      
    }
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(() => true);
      const AuthStr = 'Bearer '.concat(isAuth.token);   
      setFormData({...formData, auth: AuthStr}); 
      if(formData.name === '' || formData.phone === '' || formData.ifsc === ''|| formData.account === '' || formData.confirm === '' || formData.state === '' || formData.city === '' || formData.address === '' || formData.email === '' || formData.account !== formData.confirm) {
        setDialog({ ...openDialog, open: true, body: 'Please Enter all fields correctly'})
      }else{
        if(!formData.upi.includes('@') || formData.upi.length < 5){
          setLoading(() => true);
              setDialog({ ...openDialog, open: true, body: 'Invalid UPI'})
            }else{
              try {

        
                setOtpDialog({otpDialog, open: true});
                // const { data } = await api.upi(upi);
                // dispatch({ type: "upi", data: data });
                // history.push("/profile");
              
              } catch (error) {
             setDialog({ ...openDialog, open: true, body: error.response.data.error})
            }
            }
        
        
      }
      
    setLoading(() => false);
   
    };
     
    const sendOTP = async(e) => {
      setCounter(90);
      setRun(true); 
      
      const data = {
        
        phone:  `${user[0].phone}`,
      };
      await axios.post(`${URL}/sendOTPBank`, data);
       
      
    
    }
    const [level, setLevel] = React.useState(0);
    const handleLevel = (level) => async (event) =>  {
        setLevel(level);
    }
    return (
      <div style={{minHeight: '100vh', paddingBottom: '100px', backgroundColor: 'white'}}>
          <Dialog
          open={isLoading}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container align="center" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)', height: '100px', paddingTop: "10px"}}>
            <CircularProgress style={{color: 'white'}} />
            <Typography style={{paddingTop: '10px', color: "white"}}>Please Wait!</Typography>
          </Container>
          </Dialog>
          <Dialog
            open={otpDialog.open}
            onClose={otpdialogClose}
          >
            <Container>
              <Typography style={{paddingTop: '10px'}} align="center">Enter OTP</Typography>
              <Grid container direction="row" alignItems="center" style={{padding:'20px'}}>
                <Grid item xs={2}>
                  <SmsIcon />
                </Grid>
                <Grid item xs={8}>
                  <FormControl
                    fullWidth
                    variant="filled"
                  >
                    <InputLabel htmlFor="filled-adornment-password">
                      Verification Code
                    </InputLabel>
                    <FilledInput
                      type="number"
                      name="code"
                      id="filled-adornment-password"
                      min={6}
                      max={6}
                      onChange={handleChange}
                      style={{backgroundColor: 'white'}}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <Container style={{backgroundColor: '#05c0b8', height: '30px', width: '55px'}}>
                    <Button onClick={counter === 0 ? sendOTP : counter === 90 ? sendOTP : null} style={{paddingTop: '1px', marginLeft: '-22px', color: 'white', textTransform: 'none'}}>{canRun ? counter === 0 ? 'Resend': counter : 'OTP'}</Button>
                  </Container>
                </Grid>
              </Grid>
              <Container align="center">
                <Button 
                  variant="contained" 
                  style={{backgroundColor: '#05c0b8', color: 'white', marginBottom: '10px'}} 
                  onClick={submitOTP}
                >
                  Submit
                </Button>
              </Container>
            </Container>
          </Dialog> 
          <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px', paddingTop: '15px', paddingBottom: '15px', paddingRight: '20px', backgroundColor: '#05c0b8'}}>
            <Grid item xs={4}>  
              <ArrowBackIosIcon style={{fontSize:'20px', color: 'white'}} onClick={history.goBack} />
            </Grid>
            <Grid item xs={4}>                    
              <Typography align="center" style={{color: 'white'}}>My Bank Card</Typography>
            </Grid>
          </Grid>
           
          <Dialog
            open={openDialog.open}
            onClose={dialogClose}
            PaperProps={{
              style: {
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Container style={{padding: '20px'}}>
              <Typography style={{color: "black"}}>{openDialog.body}</Typography>
            </Container>
          </Dialog>

          {user && user[0].bank[0] && user[0].bank[0] != null? 
            <Paper style={{padding: '15px', margin: '15px', backgroundColor: '#05c0b8', color: 'white', borderRadius: '10px'}} >
              <Typography align="center" style={{fontWeight: 'bold'}}>Your Bank Details</Typography>
              <Typography>Name: {user && user[0].bank[0].name}</Typography>
              <Typography>Account: {user && user[0].bank[0].account}</Typography>
              <Typography>IFSC: {user && user[0].bank[0].ifsc}</Typography>
              <Typography>UPI: {user && user[0].bank[0].upi}</Typography>
              <Typography>Address: {user && user[0].bank[0].state}</Typography>
            </Paper>
          : null} 
          
          {isEdit ? 
            <div>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <Person style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>Actual Name: </Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}}>
                      Enter your name
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="name"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <LocalPhone style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>Mobile Number</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}}>
                      Enter Mobile Number
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="phone"
                      type='phone'
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <AccountBalance style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>IFSC CODE</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}} >
                      Enter IFSC CODE
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="ifsc"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <AccountBalance style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>Account Number</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}} >
                      Enter Account Number
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="account"
                      type="number"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <AccountBalance style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>Confirm Account Number</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}} >
                      Confirm Account Number
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="confirm"
                      type="number"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <LocationCity style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>State</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}} >
                      Enter State Name
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="state"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <Business style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>City</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}} >
                      Enter City Name
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="city"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <LocationCity style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>Address</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}} >
                      Enter Your Address
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="address"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <Email style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>Email</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}}>
                      Enter Email Address 
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="email"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container direction="row" alignItems="center" style={{paddingRight: '25px', paddingLeft: '25px'}}>
                <Grid item xs={2}>
                  <Payment style={{color: '#05c0b8'}}/>
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: 'black'}}>UPI</Typography>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth
                    variant="filled"
                  >
                    <InputLabel style={{color: 'black'}} >
                      Enter UPI ID 
                    </InputLabel>
                    <FilledInput
                      fullWidth='true'
                      name="upi"
                      id="filled"
                      onChange={handleChange}
                      style={{color: 'black', backgroundColor: 'white', borderBottom: '1px solid #05c0b8'}}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Paper 
                onClick={handleSubmit} 
                style={{
                  paddingTop:'12px',
                  margin:'20px', 
                  backgroundColor:'#05c0b8',
                  height: '50px', 
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <Grid container direction="row" justify="space-evenly">
                  <Grid item>
                    <Typography style={{ color: "white", fontWeight: "bold" }}>Update Now</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </div> 
            : 
            <div>
              <Paper 
                onClick={handleEdit} 
                style={{
                  padding: '15px', 
                  margin: '15px',
                  height: '100px', 
                  backgroundColor: 'white', 
                  alignContent: 'center',
                  border: '1px solid #05c0b8',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <Container style={{
                  height: '45px',
                  width: '45px',
                  border: '2px dashed', 
                  borderColor:'#05c0b8',  
                  alignContent: 'center'
                }}>
                  <Typography align='center' style={{fontWeight: 'bold', color: '#05c0b8', fontSize: '24px'}}>+</Typography>
                </Container>
                <Typography align='center' style={{paddingTop: '10px', color: '#05c0b8'}}>Edit or Add Bank</Typography>
              </Paper>
            </div>
          }
        </div>
    )
}

export default MyBank; 
