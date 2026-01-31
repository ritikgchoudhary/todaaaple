import React, {useState, useEffect}from 'react';
import {Typography, Grid,FormControl,InputLabel,FilledInput,Container,Button,MenuItem,Select,Dialog,CircularProgress} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

const MyRedEnvelop = () => {
    const dispatch = useDispatch();
    const [isAuth, setAuth] = useState(false);
    const history = useHistory();
    const URL =  api.url;


    const [user, setUser] = useState([{balance: 0.0}]);
    const [formData, setFormData] = useState({amount: 0,type: 'Fixed Amount',qty: 0,auth:''});
    const [otp, setOtp] = useState();
    const [canRun, setRun] = useState(false);
    const [counter, setCounter] = useState(90);
    const [openDialog, setDialog] = React.useState({open: false, body: ''});
    const [loader, setLoader] = React.useState(false);
    //const SITE_KEY = "6Le-ej8mAAAAAL_Fl83Pp_iZ5ZLKpyQ8KWuTTF83";

 
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

    const dialogClose = () => {
      setDialog({ ...openDialog, open: false});
    };
    
    if(canRun) counter > 0 &&  setTimeout(() => setCounter(counter - 1), 1000) ;
    const sendOTP = async(e) => {
      setCounter(90);
      setRun(true); 
      const data = {
        
        phone: user[0].phone,
      };
      await axios.post(`${URL}/sendOTPEnv`, data);
      
      // window.grecaptcha.ready(() => {
      //   window.grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(async token => {
          
      //   });
      // });
      
    
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

  const handleChange = (e) => {
    const AuthStr = 'Bearer '.concat(isAuth.token);
    
 
      
    setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id,auth: AuthStr});
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
                    
      const { data } = await api.createEnvelop(formData);
      dispatch({ type: "createEnvelop", data: data });
      setLoader(false);
      //setDialog({...openDialog, open: true, body: 'Red Envelope Created Successfuly'});
      history.push("/redEnvelopeHistory");
  
  } catch (error) {
    
      setLoader(false);
      setDialog({...openDialog, open: true, body: error.response.data.error});

  }
    

   
    
    setLoader(false);

    
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
                        // backgroundColor: 'transparent',
                        boxShadow: 'none',
                    },
                    }}
                
                    
                >
                    <Container style={{
                      // backgroundColor: 'black', opacity: '0.6', height: '50px'
                      }}>
                <Typography style={{padding: '10px', color: "black" }}>{openDialog.body}</Typography>
                </Container>
                
                
              </Dialog>
            
            <Grid container direction="row" justify="" alignItems="center"style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px', color:'black'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" style={{color: 'black'}}>Red Envelope</Typography>
                 </Grid>
            </Grid>
            {/* <Typography style={{fontSize: '15px',align: 'center'}}>Available Balance ₹{user && user[0].balance.toFixed(2)}</Typography> */}
            <Grid container direction="row" justify="space-around" alignItems="center"style={{paddingLeft: '20px',paddingTop: '30px',paddingBottom: '5px',paddingRight: '20px', backgroundColor: 'white'}}>
            <Grid item  xs={4}>                    
                <Typography style={{fontSize: '12px'}}>Red Envelope Type</Typography>
                 </Grid>
                 <Grid item xs={6}>
                 <Container style={{ width: "150px" }}>
                 <FormControl fullWidth variant="filled">
                 <InputLabel id="demo-simple-select-label">Type</InputLabel>
                  <Select
                    displayEmpty
                    fullWidth='true'
                    value={formData.type}
                    defaultValue="Fixed Amount"
                    name='type'
                    onChange={handleChange}
                    style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                  >
                    
                    <MenuItem value='Fixed amount'>Fixed Amount</MenuItem>
                    <MenuItem value='Lucky Draw'>Lucky Draw</MenuItem>
                  
                  </Select>
                </FormControl>
                </Container>
             </Grid>
                 
            </Grid>
            <Grid container direction="row" justify="space-around" alignItems="center"style={{paddingLeft: '20px',paddingBottom: '5px',paddingRight: '20px', backgroundColor: 'white'}}>
            <Grid item  xs={4}>                    
                <Typography style={{fontSize: '12px'}}>Total Bonus Amount</Typography>
                 </Grid>
                 <Grid item  xs={6}>
             <FormControl fullWidth
                      
                      variant="filled"
                      
                    >
                      <InputLabel   >
                      Bonus Amount
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
            <Grid container direction="row" justify="space-around" alignItems="center"style={{paddingLeft: '20px',paddingBottom: '5px',paddingRight: '20px', backgroundColor: 'white'}}>
            <Grid item  xs={4}>                    
                <Typography style={{fontSize: '12px'}}>Number of Envelope</Typography>
                 </Grid>
                 <Grid item  xs={6}>
             <FormControl fullWidth
                      
                      variant="filled"
                      
                    >
                      <InputLabel   >
                      Red Envelope Count
                      </InputLabel>
                      <FilledInput
                        type="number"
                        fullWidth='true'
                        name="qty"
                        id="filled"
                        onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>
             </Grid>
                 
            </Grid>
            <Grid container direction="row" justify="space-around" alignItems="center"style={{paddingLeft: '20px',paddingBottom: '5px',paddingRight: '20px', backgroundColor: 'white'}}>
            {/* <Grid item>                    
                <Typography style={{fontSize: '15px'}}>Enter OTP</Typography>
                 </Grid> */}

                 
            <Grid item>
                    <FormControl
                      fullWidth
                      variant="filled"
                    >
                      <InputLabel htmlFor="filled-adornment-password">
                       OTP
                      </InputLabel>
                      <FilledInput
                        type="number"
                        name="code"
                        id="filled-adornment-password"
                        min={6}
                        max={6}
                        onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}

                        
                      />
                    </FormControl>
                    </Grid>
                    <Grid item >
                    <Container style={{backgroundColor: otp == null ? '#00b8a9' : 'green', height: '30px', width: '55px'}}>
                      <Button onClick={counter === 0 ? sendOTP : otp != null ? null : sendOTP} style={{paddingTop: '1px',marginLeft: '-22px', color: 'white', textTransform: 'none'}}>{canRun ? counter === 0 ? 'Resend': counter : 'OTP'}</Button>
                    </Container>
                    </Grid>
                 
            </Grid>

           

           <Container style={{height: '100px'}}></Container>

              <Container
        style={{
          backgroundColor: "#00b8a9",
          height: "50px",
          width: "100%",
          borderRadius: "20px",
        }}
        onClick={handleSubmit}
      >
        <Typography align="center">
          <Button
            type="submit"
            style={{
              paddingTop: "12px",
              color: "white",
              textTransform: "none",
            }}
          >
            Submit
          </Button>
        </Typography>
      </Container>
      {/* </form> */}
      <Link
        to="/redEnvelopeHistory"
        style={{ textDecoration: "none", color: "black" }}
      >
        <Container
          style={{
            backgroundColor: "grey",
            marginTop: "20px",
            marginBottom: "100px",
            height: "50px",
            width: "100%",
            borderRadius: "20px",
          }}
        >
          <Typography align="center">
            <Button
              type="submit"
              style={{
                paddingTop: "12px",
                color: "white",
                textTransform: "none",
              }}
            >
              Historical Records
            </Button>
          </Typography>
        </Container>
      </Link>
            
        
            
           

            
        </div>
    )
}

export default MyRedEnvelop ; 
