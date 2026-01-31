import React,{useState} from 'react';
import {Typography, Grid,FormControl,InputLabel,CircularProgress,FilledInput, Button, Container, Dialog} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import SmsIcon from '@material-ui/icons/Sms';
import axios from 'axios';
import * as api from "../../api/auth";



const Forget = () => {
    const URL =  api.url;
    const history = useHistory();
    const [loader, setLoader] = useState(false);
    const [validated, setValidated] = useState(false);
    const [openDialog, setDialog] = useState({open: false, body: ''});
    const [counter, setCounter] = useState(90);
    const initialState = { phone: 0, password: "", code: '', confirm: ""};
    const [formData, setFormData] = useState(initialState);
    const [otp, setOtp] = useState();
    const [canRun, setRun] = useState(false);
    if(canRun) counter > 0 &&  setTimeout(() => setCounter(counter - 1), 1000) ;
//     const SITE_KEY = "6Le-ej8mAAAAAL_Fl83Pp_iZ5ZLKpyQ8KWuTTF83";

 
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
      const sendOTP = async(e) => {
        if(formData.phone.length !== 10){
          setDialog({ ...openDialog, open: true, body: 'Please Enter Valid Number !'})
        }else{
        setCounter(90);
        setRun(true); 

        const data = {
          
          phone: formData.phone,
        };
        await axios.post(`${URL}/sendOTPFor`, data);

    }
    }
    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoader(true);
        try {
            const { data } = await api.reset(formData);
            setLoader(false);

            alert('Password Changed Successfully');
            history.push("/login");
        } catch (error) {
            setLoader(false);

            setDialog({ ...openDialog, open: true, body: error.response.data.error})

        }
        setLoader(false);

    } 
      const handleVerify = async (e) => {
        e.preventDefault();
        setLoader(true);
        
        try {
          setValidated(true);
        } catch (error) {
         setDialog({ ...openDialog, open: true, body: error.response.data.error})
        }
        setLoader(false);
      };
    const handleChange = (e)=>{
        setFormData({ ...formData, [e.target.name]: e.target.value});
        console.log(formData)
    } 
    
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
                <Link to="../login">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>                  
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" >Forget Password</Typography>
                 </Grid>
        </Grid>
        { !validated ? 
        <div>
              <Grid container direction="row" alignItems="center" style={{padding:'20px'}}>
                  <Grid item xs={2}>
                     <Typography>+91</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <FormControl fullWidth
                      
                      variant="filled"
                       
                    >
                      <InputLabel  >
                      Mobile number/Account
                      </InputLabel>
                      <FilledInput
                       
                        fullWidth='true'
                        name="phone"
                        type="number"
                        id="filled"
                        onChange={handleChange}
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              <Grid container direction="row" alignItems="center" style={{padding:'20px'}}>
                    <Grid item xs={2}>
                      <SmsIcon  />
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
                        style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}

                        
                      />
                    </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                    <Container style={{backgroundColor: otp == null ? '#00b8a9' : 'green', height: '30px', width: '55px'}}>
                      <Button onClick={counter === 0 ? sendOTP : otp != null ? null : sendOTP} style={{paddingTop: '1px',marginLeft: '-22px', color: 'white', textTransform: 'none'}}>{canRun ? counter === 0 ? 'Resend': counter : 'OTP'}</Button>
                    </Container>
                    </Grid>
                  </Grid>
                  <Container style={{backgroundColor: '#00b8a9', height: '50px', width: '220px', marginTop: '30px'}} onClick={handleVerify}>
                <Typography  align="center" ><Button  style={{paddingTop: '12px',color: 'white', textTransform: 'none'}}>Verify</Button></Typography>
              </Container>
        </div>
        :
        <div>
            <Typography align="center"  display="block" style={{paddingTop: '30px', paddingBottom: '30px',fontSize:'20px'}}>Reset Password</Typography>
            <form  noValidate autoComplete="off" align="center" style={{padding: '15px'}}>
            <FormControl fullWidth variant="outlined" >
                      <InputLabel  >
                      New Password
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
                      Confirm New Password
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
           }
            
        </div>
        
    )
}

export default Forget;
