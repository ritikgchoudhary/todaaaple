import React, {useState, useEffect} from "react";
import {Typography,Dialog, Grid, Container, Button,FilledInput,InputLabel,FormControl,CircularProgress,Paper,Tabs,Tab,Box} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as api from "../../../api/auth";
import { useHistory } from "react-router-dom";
import axios from 'axios';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const Withdrawal = () => {
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState();
  const [loader, setLoader] = React.useState(false);
  const [isBlocked, setBlock] = useState({open: false, msg: ''});
  const URL =  api.url;
  const [withdrawal, setWithdrawal] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [trcDialog, setTrcDialog] = useState({open: false, amount: 0});
  const [trcAddress, setTrcAddress] = useState('');

  // USDT conversion rate (1 USDT = 95 INR)
  const USDT_RATE = 95;
  const MIN_USDT = 10;
  const USDT_FEE_PERCENT = 3; // 3%
  const MIN_USDT_FEE = 3; // Minimum 3 USDT fee

  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
       
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/getUserWithdrawal/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
                .then(response => {
                    setUser(response.data.user);
                    setWithdrawal({amount: response.data.canWithdraw, recharge: response.data.latestRecharge, bid: response.data.bidsAfterRecharge});
                    if(response.data.user[0].block){
                        setBlock({...isBlocked, open: true, msg: response.data.user[0].block})
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
    const history = useHistory();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({amount: 0});
    const [usdtFormData, setUsdtFormData] = useState({amount: 0});
    
    const [openDialog, setDialog] = React.useState({open: false, body: ''});

    const dialogClose = () => {
      setDialog({ ...openDialog, open: false});
    };

    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

    // Calculate USDT withdrawal fee
    const calculateUsdtFee = (amount) => {
      const percentageFee = (amount * USDT_FEE_PERCENT) / 100;
      return Math.max(percentageFee, MIN_USDT_FEE);
    };

    const handleChange = (e) => {
      const AuthStr = 'Bearer '.concat(isAuth.token);   
               
        setFormData({ ...formData, [e.target.name]: e.target.value, userId: user[0].id,auth: AuthStr});
      };

    const handleUsdtChange = (e) => {
      const AuthStr = 'Bearer '.concat(isAuth.token);   
               
        setUsdtFormData({ ...usdtFormData, [e.target.name]: e.target.value, userId: user[0].id,auth: AuthStr});
      };

    const handleTrcDialogClose = () => {
      setTrcDialog({open: false, amount: 0});
      setTrcAddress('');
    };

    const handleTrcSubmit = async () => {
      if (!trcAddress.trim()) {
        setDialog({...openDialog, open: true, body: 'Please enter a valid TRC20 wallet address'});
        return;
      }

      if(parseInt(trcDialog.amount) < 10){
        setDialog({...openDialog, open: true, body: 'Minimum 10 USDT required'});
      }else{
        if( user[0].demo === true){
          setDialog({...openDialog, open: true, body: 'Withdrawal not allowed in your account!'});

        }else{
           //setDialog({...openDialog, open: true, body: 'Bank Holiday due to Eid'});

          setLoader(true);
    
          try {
              // Add fee information to form data (inclusive calculation)
              const withdrawalData = {
                ...usdtFormData,
                fee: trcDialog.fee,
                netAmount: trcDialog.netAmount, // Amount user will receive
                totalAmount: trcDialog.amount, // Amount deducted from balance
                currency: 'USDT'
              };
              
              const { data } = await api.applyWithdrawalUSDT(withdrawalData);
              dispatch({ type: "applyWithdrawalUSDT", data: data });
              setLoader(false);
              //history.push("/wallet");
              setTrcDialog({open: false, amount: 0});
              setDialog({...openDialog, open: true, body: `USDT withdrawal request submitted successfully!\nYou will receive: ${trcDialog.netAmount.toFixed(2)} USDT\nTo address: ${trcAddress}\nFee deducted: ${trcDialog.fee.toFixed(2)} USDT`});
              setTrcAddress('');
          } catch (error) {
            setLoader(false);
              setDialog({...openDialog, open: true, body: error.response.data.error});
  
          }
          setLoader(false);
        }
        
      }
      
    };

    const handleSubmit = async (e) => {
        
        e.preventDefault();
       
        // setDialog({...openDialog, open: true, body: "We are updating our plateform. Functionality like recharge, withdrawal will be temporary paused. You can place bid and earn. We are sorry for any inconvenience caused. ThankYou !"})
       
        if(parseInt(formData.amount) < 230){
          setDialog({...openDialog, open: true, body: 'Minimum ₹230'});
        }else{
          if(parseInt(formData.amount) > user[0].withWallet){

            setDialog({...openDialog, open: true, body: 'Insufficient Fund'});
  
          }else{
            if(user[0].bank[0] == null){
              setDialog({...openDialog, open: true, body: 'Please Add UPI or a bank account first'});

            }else{
              if( user[0].demo === true){
                setDialog({...openDialog, open: true, body: 'Withdrawal not allowed in your account!'});

              }else{
                 //setDialog({...openDialog, open: true, body: 'Bank Holiday due to Eid'});

                setLoader(true);
          
                try {
                    
                    const { data } = await api.applyWithdrawal(formData);
                    dispatch({ type: "applyWithdrawal", data: data });
                    setLoader(false);
                    history.push("/wallet");
                
                } catch (error) {
                  setLoader(false);
                    setDialog({...openDialog, open: true, body: error.response.data.error});
        
                }
                setLoader(false);
              }
              
            }
            
          }
        }
      };

    const handleUsdtSubmit = async (e) => {
      e.preventDefault();
      
      const usdtAmount = parseFloat(usdtFormData.amount);
      const fee = calculateUsdtFee(usdtAmount);
      const netAmountReceived = usdtAmount - fee; // Amount user will actually receive
      const inrEquivalent = usdtAmount * USDT_RATE; // Only check against withdrawal amount, not withdrawal + fee
      
      if(usdtAmount < MIN_USDT){
        setDialog({...openDialog, open: true, body: `Minimum ${MIN_USDT} USDT required`});
      }else{
        if(inrEquivalent > user[0].balance){
          setDialog({...openDialog, open: true, body: `Insufficient Fund. Required: ₹${inrEquivalent.toFixed(2)}`});
        }else{
          if( user[0].demo === true){
            setDialog({...openDialog, open: true, body: 'Withdrawal not allowed in your account!'});
          }else{
            // Open TRC20 address dialog with fee information
            setTrcDialog({open: true, amount: usdtAmount, fee: fee, netAmount: netAmountReceived});
          }
        }
      }
    };
    
   
    return (
        <div>
          <Dialog
          open={isBlocked.open}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container  align="center" style={{backgroundColor: 'black', opacity: '0.6',height: '80px',paddingTop: "10px"}}>
           <Typography style={{paddingTop: '10px', color: "white" }}>{isBlocked.msg}</Typography>
          </Container>
          
          
        </Dialog>
            <Grid container direction="row" justify="" alignItems="center"style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../wallet">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>Withdrawal</Typography>
                 </Grid>
            </Grid>
            <Typography variant="h6" style={{paddingLeft: '35px', paddingTop: '15px', color: '#00b8a9'}}>My Balance ₹{user && user[0].balance.toFixed(2)}</Typography>
            
            {/* Tab Switcher */}
            <Paper style={{margin: '20px', marginBottom: '10px'}}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="INR Withdrawal" />
                <Tab label="USDT Withdrawal" />
              </Tabs>
            </Paper>

            {/* INR Withdrawal Tab */}
            <TabPanel value={tabValue} index={0}>
              { 
                user && user[0].bank && user[0].bank.length !== 0 ?<Paper style={{marginLeft: '20px',marginRight: '20px',backgroundColor: 'white',padding: '10px',borderRadius: '10px'}}>
                <Grid container direction="row" justify="space-between" alignItems="center">
                <Grid item><Typography style={{fontWeight: 'bold'}}>{user && user[0].bank[0].name}</Typography></Grid>
                <Grid item><Typography style={{fontSize: '15px'}}>Limit 230 ~ 50000</Typography></Grid>
                </Grid>
                <Typography>Account: XXXXXX{user && user[0].bank[0].account.substr(-4)}</Typography>
                </Paper> : <div></div>
              }
              <Typography variant="h5" style={{paddingLeft: '35px',fontWeight: 'bold'}}></Typography>
              <Typography  style={{paddingLeft: '35px', paddingTop: '15px'}}>Amount: ₹0 - ₹1000, fee ₹30</Typography>
              <Typography  style={{paddingLeft: '35px'}}>Amount: ₹1000 and above, fee 3%</Typography>
              <Typography  style={{paddingLeft: '22px', paddingTop: '20px',fontWeight: 'bold'}}>Withdrawal Amount</Typography>
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
              <Typography  style={{paddingLeft: '28px',paddingTop: '5px', fontWeight: 'bold'}}>Now you can withdrawal 3 times a day</Typography>

              {/* <Typography  style={{paddingLeft: '28px',paddingTop: '5px'}}>withdrawn fee(tax - inclusive) ₹{fee}</Typography> */}
              <Typography  style={{paddingLeft: '22px', paddingTop: '20px',fontWeight: 'bold'}}>Single Withdrawal Limit</Typography>
              <Typography  style={{paddingLeft: '28px',paddingTop: '5px'}}>maximum amount: ₹50000</Typography>
              <Typography  style={{paddingLeft: '28px',paddingTop: '5px'}}>minimum amount: ₹230</Typography>            
              <Typography  style={{paddingLeft: '22px',fontWeight: 'bold',paddingTop: '5px',color: "black"}}>Service Time</Typography>
              <Typography  style={{paddingLeft: '28px',paddingTop: '5px',color: "black"}}>Monday 11:30-17:30</Typography>
              <Typography  style={{paddingLeft: '28px',color: "black"}}>Tuesday 11:30-17:30</Typography>
              <Typography  style={{paddingLeft: '28px',color: "black"}}>Wednesday 11:30-17:30</Typography>
              <Typography  style={{paddingLeft: '28px',color: "black"}}>Thursday 11:30-17:30</Typography>
              <Typography  style={{paddingLeft: '28px',color: "black"}}>Friday 11:30-17:30</Typography>

              <Typography style={{paddingLeft: '28px',paddingTop: '5px'}}>
                You need to play total bids equal to your last recharge amount
                <br />
                <span style={{fontSize: '14px'}}>आपको अपनी अंतिम रिचार्ज राशि के बराबर कुल बिड खेलने की आवश्यकता है</span>
              </Typography>
              <Typography style={{paddingLeft: '28px',paddingTop: '5px'}}>
                Last recharge amount is ₹{withdrawal.recharge}, play ₹{(withdrawal.recharge - withdrawal.bid) < 0 ? 0 : (withdrawal.recharge - withdrawal.bid)} more amount bids to withdraw
                <br />
                <span style={{fontSize: '14px'}}>अंतिम रिचार्ज राशि ₹{withdrawal.recharge} है, निकासी के लिए ₹{(withdrawal.recharge - withdrawal.bid) < 0 ? 0 : (withdrawal.recharge - withdrawal.bid)} और अधिक राशि की बिड खेलें</span>
              </Typography>
              
              <Paper onClick={handleSubmit} style={{backgroundColor: '#00b8a9',margin: '15px', height: '50px',borderRadius: '8px'}}>
                  <Typography  align="center" ><Button type="submit"  style={{paddingTop: '12px',color: 'white', textTransform: 'none'}}>Withdrawal</Button></Typography>
                </Paper>
            </TabPanel>

            {/* USDT Withdrawal Tab */}
            <TabPanel value={tabValue} index={1}>
              <Paper style={{marginLeft: '20px',marginRight: '20px',backgroundColor: 'white',padding: '10px',borderRadius: '10px',marginBottom: '15px'}}>
                <Grid container direction="row" justify="space-between" alignItems="center">
                <Grid item><Typography style={{fontWeight: 'bold'}}>USDT (TRC20)</Typography></Grid>
                <Grid item><Typography style={{fontSize: '15px'}}>Rate: 1 USDT = ₹{USDT_RATE}</Typography></Grid>
                </Grid>
              </Paper>
              
              <Typography  style={{paddingLeft: '35px', paddingTop: '15px'}}>Conversion Rate: 1 USDT = ₹{USDT_RATE}</Typography>
              <Typography  style={{paddingLeft: '35px'}}>Minimum: {MIN_USDT} USDT</Typography>
              <Typography  style={{paddingLeft: '35px'}}>Withdrawal Fee: {USDT_FEE_PERCENT}% (deducted from withdrawal amount)</Typography>
              <Typography  style={{paddingLeft: '35px', fontSize: '14px', color: '#666'}}>Minimum fee: {MIN_USDT_FEE} USDT</Typography>
              <Typography  style={{paddingLeft: '22px', paddingTop: '20px',fontWeight: 'bold'}}>USDT Withdrawal Amount</Typography>
              <Grid container direction="row" justify="flex-start" alignItems="center" style={{paddingLeft: '22px',paddingTop: '20px'}}>
               <Grid item><Typography style={{fontWeight: 'bold'}}>USDT</Typography></Grid>
               <Grid item>
               <FormControl fullWidth
                        
                        variant="filled"
                        
                      >
                        <InputLabel   >
                        Enter USDT Amount
                        </InputLabel>
                        <FilledInput
                          type="number"
                          fullWidth='true'
                          name="amount"
                          id="filled-usdt"
                          onChange={handleUsdtChange}
                          style={{backgroundColor: 'white', textUnderlineOffset: 'none'}}
                          inputProps={{step: "0.01", min: "0"}}
                        />
                      </FormControl>
               </Grid>
              </Grid>
              {usdtFormData.amount > 0 && (
                <>
                  <Typography style={{paddingLeft: '28px',paddingTop: '5px', color: '#00b8a9'}}>
                    Withdrawal Amount: {parseFloat(usdtFormData.amount || 0).toFixed(2)} USDT
                  </Typography>
                  <Typography style={{paddingLeft: '28px', color: '#f39c12'}}>
                    Fee: {calculateUsdtFee(parseFloat(usdtFormData.amount || 0)).toFixed(2)} USDT
                  </Typography>
                  <Typography style={{paddingLeft: '28px', color: '#e74c3c', fontWeight: 'bold'}}>
                    Net Amount You'll Receive: {(parseFloat(usdtFormData.amount || 0) - calculateUsdtFee(parseFloat(usdtFormData.amount || 0))).toFixed(2)} USDT
                  </Typography>
                  <Typography style={{paddingLeft: '28px', color: '#666', fontSize: '14px'}}>
                    Total Deducted from Balance: ₹{(parseFloat(usdtFormData.amount || 0) * USDT_RATE).toFixed(2)}
                  </Typography>
                </>
              )}
              
              <Typography  style={{paddingLeft: '22px', paddingTop: '20px',fontWeight: 'bold'}}>USDT Withdrawal Limits</Typography>
              <Typography  style={{paddingLeft: '28px',paddingTop: '5px'}}>minimum amount: {MIN_USDT} USDT</Typography>
              <Typography  style={{paddingLeft: '28px',paddingTop: '5px'}}>maximum amount: {Math.floor(50000 / USDT_RATE)} USDT</Typography>            
              
              <Typography style={{paddingLeft: '28px',paddingTop: '15px'}}>
                • USDT will be sent to your TRC20 wallet address
                <br />
                • Processing time: 24-48 hours
                <br />
                • Network fee may apply
              </Typography>
              
              <Paper onClick={handleUsdtSubmit} style={{backgroundColor: '#f39c12',margin: '15px', height: '50px',borderRadius: '8px'}}>
                  <Typography  align="center" ><Button type="submit"  style={{paddingTop: '12px',color: 'white', textTransform: 'none'}}>Withdraw USDT</Button></Typography>
                </Paper>
            </TabPanel>

            <Link to="/withdrawalHistory"  style={{textDecoration: 'none', color: 'black'}}>
              <Paper style={{backgroundColor: 'grey',margin: '15px',marginBottom: '100px', height: '50px',borderRadius: '8px'}}>
                <Typography align="center" style={{paddingTop: '12px',color: 'white'}}>Historical</Typography>
              </Paper>
            </Link>

            {/* TRC20 Address Dialog - positioned higher on mobile so it doesn't sit over bottom nav */}
            <Dialog
              open={trcDialog.open}
              onClose={handleTrcDialogClose}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                style: {
                  alignSelf: 'flex-start',
                  marginTop: 'max(env(safe-area-inset-top), 24px)',
                  marginBottom: 24,
                  maxHeight: 'calc(100vh - 80px)',
                  overflow: 'auto',
                },
              }}
            >
              <Container style={{padding: '20px'}}>
                <Typography variant="h6" style={{marginBottom: '15px'}}>Enter TRC20 Wallet Address</Typography>
                <Paper style={{padding: '15px', marginBottom: '15px', backgroundColor: '#f8f9fa'}}>
                  <Typography style={{marginBottom: '5px', color: '#666'}}>
                    <strong>Withdrawal Amount:</strong> {trcDialog.amount} USDT
                  </Typography>
                  <Typography style={{marginBottom: '5px', color: '#f39c12'}}>
                    <strong>Fee ({USDT_FEE_PERCENT}%):</strong> {trcDialog.fee && trcDialog.fee.toFixed(2)} USDT
                  </Typography>
                  <Typography style={{color: '#00b8a9', fontWeight: 'bold', marginBottom: '5px'}}>
                    <strong>Net Amount You'll Receive:</strong> {trcDialog.netAmount && trcDialog.netAmount.toFixed(2)} USDT
                  </Typography>
                  <Typography style={{color: '#666', fontSize: '14px'}}>
                    <strong>Deducted from Balance:</strong> ₹{trcDialog.amount && (trcDialog.amount * USDT_RATE).toFixed(2)}
                  </Typography>
                </Paper>
                <FormControl fullWidth variant="filled" style={{marginBottom: '20px'}}>
                  <InputLabel>TRC20 Wallet Address</InputLabel>
                  <FilledInput
                    type="text"
                    fullWidth
                    value={trcAddress}
                    onChange={(e) => {
                      setTrcAddress(e.target.value);
                      setUsdtFormData({ ...usdtFormData, walletAddress: e.target.value });
                    }}
                    style={{backgroundColor: 'white'}}
                    placeholder="Enter your TRC20 wallet address"
                  />
                </FormControl>
                <Typography style={{fontSize: '12px', color: '#888', marginBottom: '20px'}}>
                  Please double-check your TRC20 address. Incorrect addresses may result in loss of funds.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      onClick={handleTrcDialogClose}
                      style={{textTransform: 'none'}}
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={handleTrcSubmit}
                      style={{backgroundColor: '#f39c12', color: 'white', textTransform: 'none'}}
                    >
                      Confirm
                    </Button>
                  </Grid>
                </Grid>
              </Container>
            </Dialog>

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
                        boxShadow: 'none',
                        alignSelf: 'flex-start',
                        marginTop: 'max(env(safe-area-inset-top), 24px)',
                        marginBottom: 24,
                        maxHeight: 'calc(100vh - 80px)',
                        overflow: 'auto',
                    },
                    }}
                >
                    <Container style={{
                      // backgroundColor: 'black', opacity: '0.6', height: '50px'
                      }}>
                <Typography style={{padding: '10px', color: "black" }}>{openDialog.body}</Typography>
                </Container>
                
                
              </Dialog>
              
        </div>
    )
}

export default Withdrawal
