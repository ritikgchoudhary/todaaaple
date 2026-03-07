// import React, { useEffect, useState, useCallback } from "react";
// import {
//   Typography,
//   Container,
//   Grid,
//   Button,
//   Drawer,
//   Box,
//   FormControlLabel,
//   Checkbox,
//   CircularProgress,
//   Dialog,
//   DialogContent,
//   DialogActions,
//   AppBar,
//   Toolbar,
//   FormControl,
//   FilledInput,
//   IconButton,
//   OutlinedInput,
// } from "@material-ui/core";
// import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
// import Record from "./Minutes_Record.jsx";
// import useStyles from "../home/style/game";
// import BidHistory from "./Minutes_BidHistory.jsx";
// import * as api from "../../api/auth";
// import { useDispatch } from "react-redux";
// import { Link, useHistory, useParams } from "react-router-dom";
// import axios from "axios";
// import VGALOGO from "../../images/vga2.0.png";
// import Support from "../../images/customer-service.png";
// import N0 from "../../images/n0.png";
// import N1 from "../../images/n1.png";
// import N2 from "../../images/n2.png";
// import N3 from "../../images/n3.png";
// import N4 from "../../images/n4.png";
// import N5 from "../../images/n5.png";
// import N6 from "../../images/n6.png";
// import N7 from "../../images/n7.png";
// import N8 from "../../images/n8.png";
// import N9 from "../../images/n9.png";
// import Wallet from "../../images/wallet.png";
// import WinBadge from "../../images/winner.png";
// import Notification from "../../images/notification.png";
// import Timer from "../../images/timer1.png";
// import CloseIcon from "@material-ui/icons/Close";
// import AddIcon from "@material-ui/icons/Add";
// import RemoveIcon from "@material-ui/icons/Remove";
// import Confetti from 'react-confetti';

// const MinutesGamePage = () => {
//   const params = useParams();
//   const history = useHistory();
//   const classes = useStyles();
//   const dispatch = useDispatch();
//   const [canOpen, setCanOpen] = React.useState(false);
//   const [loader, setLoader] = React.useState(false);
//   const [timer, setTimer] = React.useState(0);
//   const [amount, setAmount] = useState(1000);

//   const [showNumber, setShowNumber] = useState({
//     selectedNumber: 1000,
//     number: 1,
//     multiNumber: 1,
//   });

//   const [record, setRecord] = useState();
//   const [user, setUser] = useState();
//   const [bidHistory, setHistory] = useState();
//   const [isAuth, setAuth] = useState(false);
//   const [isBlocked, setBlock] = useState({ open: false, msg: "" });
//   const URL = api.url;

//   const [windowSize, setWindowSize] = useState({
//     width: window.innerWidth,
//     height: window.innerHeight,
//   });

//   const [audio] = useState(new Audio('/sounds/fireworks.mp3'));

//   const handleChangeAmount = (e) => {
//     if (parseFloat(e.target.value)) {
//       setAmount(parseFloat(e.target.value));
//       setShowNumber({
//         ...showNumber,
//         selectedNumber: parseFloat(e.target.value),
//         multiNumber: 1,
//       });
//     } else {
//       setAmount(0);
//     }
//   };

//   const removeRecaptcha = () => {
//     const script = document.getElementById("recaptcha-script");
//     if (script) {
//       script.remove();
//     }

//     const recaptchaElems = document.getElementsByClassName("grecaptcha-badge");
//     if (recaptchaElems.length) {
//       recaptchaElems[0].remove();
//     }
//   };

//   const dialogCloseWin = () => {
//     setWinning({ open: false, body: "" });
//     audio.pause();
//     audio.currentTime = 0;
//   };

//   const refreshUserData = async () => {
//     const loggedInUser = localStorage.getItem("user");
//     if (loggedInUser) {
//       const foundUser = JSON.parse(loggedInUser);
//       setAuth(foundUser);
//       const AuthStr = "Bearer ".concat(foundUser.token);
//       axios
//         .get(`${URL}/getUserHome/${foundUser.result.id}/`, {
//           headers: { Authorization: AuthStr },
//         })
//         .then((response) => {
//           setUser(response.data);
//           if (response.data.block) {
//             setBlock({ ...isBlocked, open: true, msg: "Account Suspended" });
//             localStorage.removeItem("user");
//             window.location.replace("/login");
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//           history.push("/login");
//         });

//       // Get bid history
//       axios
//         .get(`${URL}/minute${params.id}_getBidHistory/${foundUser.result.id}/`, {
//           headers: { Authorization: AuthStr },
//         })
//         .then((response) => {
//           setHistory(response.data);
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } else {
//       console.log("not logged in");
//       window.location.replace("/login");
//     }
//   };

//   useEffect(() => {
//     setLoader(true);
//     removeRecaptcha();
//     const loggedInUser = localStorage.getItem("user");
//     if (loggedInUser) {
//       const foundUser = JSON.parse(loggedInUser);
//       setAuth(foundUser);
//       const AuthStr = "Bearer ".concat(foundUser.token);
//       axios
//         .get(`${URL}/getUserHome/${foundUser.result.id}/`, {
//           headers: { Authorization: AuthStr },
//         })
//         .then((response) => {
//           setUser(response.data);

//           if (response.data.block) {
//             setBlock({ ...isBlocked, open: true, msg: "Account Suspended" });
//             localStorage.removeItem("user");
//             window.location.replace("/login");
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//           history.push("/login");
//         });

//       // Get bid history
//       axios
//         .get(`${URL}/minute${params.id}_getBidHistory/${foundUser.result.id}/`, {
//           headers: { Authorization: AuthStr },
//         })
//         .then((response) => {
//           setHistory(response.data);
//         })
//         .catch((error) => {
//           console.log(error);
//         });
        
//       // Initialize game timer
//       axios.get(`${URL}/minute${params.id}_getTimer/`).then((response) => {
//         setGetTimer(response.data[0].date);
        
//         // Get game duration based on params.id
//         const getGameDuration = () => {
//           switch(params.id) {
//             case "1": return 60; // 1 minute game
//             case "3": return 180; // 3 minute game
//             case "5": return 300; // 5 minute game
//             default: return 60; // Default to 1 minute
//           }
//         };
        
//         const gameDuration = getGameDuration();
//         var time = response.data[0].date / 1000 + gameDuration;
//         var timeRemaining;

//         var myDate = new Date();
//         var startTimeEpoch = myDate.getTime() / 1000.0;
//         timeRemaining = time - startTimeEpoch;

//         setTimer(timeRemaining);
        
//         axios
//           .get(`${URL}/minute${params.id}_getRecord/`)
//           .then((response) => {
//             setRecord(response.data);
//             setLoader(false);
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//       });
//     } else {
//       console.log("not logged in");
//       window.location.replace("/login");
//     }
//   }, [params.id]);

//   const [getTimer, setGetTimer] = useState(0);

//   const calculateWinnings = async (history, result) => {
//     var winningAmount = 0;

//     if (history)
//       history &&
//         history.forEach((element) => {
//           if (element.period === result.id) {
//             if (element.winning > 0) {
//               winningAmount += element.winning;
//             }
//             if (element.winning === 0) {
//               winningAmount -= element.amount;
//             }
//           }
//         });

//     if (winningAmount > 0) {
//       setWinning({
//         ...openWinning,
//         open: true,
//         body: winningAmount.toFixed(2),
//         result,
//       });
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimer((prevTimer) => prevTimer - 1);
//     }, 1000);

//     return () => {
//       clearInterval(interval);
//     };
//   }, []);

//   const getCutoffTime = useCallback(() => {
//     switch(params.id) {
//       case "1": return 10; // 1 minute game - close at 10 seconds
//       case "3": return 30; // 3 minute game - close at 30 seconds
//       case "5": return 30; // 5 minute game - close at 30 seconds
//       default: return 10;
//     }
//   }, [params.id]);

//   useEffect(() => {
//     if (!canOpen) {
//       const cutoffTime = getCutoffTime();
//       if (timer > cutoffTime) setCanOpen(true);
//     }

//     if (timer <= getCutoffTime()) {
//       setState({ ...state, bottom: false });
//       setCanOpen(false);
//     }
    
//     // Get game duration based on params.id (1, 3, or 5 minutes)
//     const getGameDuration = () => {
//       switch(params.id) {
//         case "1": return 60; // 1 minute game
//         case "3": return 180; // 3 minute game
//         case "5": return 300; // 5 minute game
//         default: return 60; // Default to 1 minute
//       }
//     };
    
//     const gameDuration = getGameDuration();
    
//     if (Math.round(timer) % 30 == 0) {
//       var time = getTimer / 1000 + gameDuration;
//       var timeRemaining;

//       var myDate = new Date();
//       var startTimeEpoch = myDate.getTime() / 1000.0;
//       timeRemaining = time - startTimeEpoch;

//       setTimer(timeRemaining);
//     }
    
//     // Calculate when to fetch user data and bid history
//     // This should happen at approximately 5 seconds before the game ends
//     const fetchDataThreshold = gameDuration - 3;
//     if (Math.round(timer) === fetchDataThreshold) {
//       const loggedInUser = localStorage.getItem("user");
//       const foundUser = JSON.parse(loggedInUser);

//       const AuthStr = "Bearer ".concat(foundUser.token);
//       axios
//         .get(`${URL}/getUserHome/${foundUser.result.id}`, {
//           headers: { Authorization: AuthStr },
//         })
//         .then((response) => {
//           setUser(response.data);
//           axios
//             .get(`${URL}/minute${params.id}_getBidHistory/${foundUser.result.id}/`, {
//               headers: { Authorization: AuthStr },
//             })
//             .then((response) => {
//               setHistory(response.data);
//               calculateWinnings(response.data, record[0]);
//             });
//         });
//     }
    
//     if (timer < 0) {
//       setLoader(true);
//       axios.get(`${URL}/minute${params.id}_getTimer/`).then((response) => {
//         setGetTimer(response.data[0].date);
        
//         // Use the appropriate game duration based on params.id
//         var time = response.data[0].date / 1000 + getGameDuration();
//         var timeRemaining;

//         var myDate = new Date();
//         var startTimeEpoch = myDate.getTime() / 1000.0;
//         timeRemaining = time - startTimeEpoch;

//         setTimer(timeRemaining);
//         axios
//           .get(`${URL}/minute${params.id}_getRecord/`)
//           .then((response) => {
//             setRecord(response.data);
//             setLoader(false);
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//       });
//     }
//   }, [timer, params.id]);

//   const handleFormData = (bidOn, bidAmount) => async (event) => {
//     refreshUserData();
//     if (!checkState.checkedB) {
//       setDialog({
//         ...openDialog,
//         open: true,
//         body: "Please agree to presale rule first !",
//       });
//     } else {
//       setLoader(true);
//       const AuthStr = "Bearer ".concat(isAuth.token);
//       const bidData = {
//         bidOn: bidOn,
//         bidAmount: bidAmount,
//         userId: isAuth.result.id,
//         auth: AuthStr,
//       };
//       try {
//         if (bidHistory !== "No Data") {
//           bidHistory.forEach((element) => {
//             if (element.period === record[0].id + 1) {
//               if (element.select.includes("Green") && bidOn.includes("Red")) {
//                 setWarning({
//                   ...openWarning,
//                   open: true,
//                   body: "Be aware that placing bid in opposite colors in same period will not increase your withdrawal balance",
//                 });
//               }
//               if (element.select.includes("Red") && bidOn.includes("Green")) {
//                 setWarning({
//                   ...openWarning,
//                   open: true,
//                   body: "Be aware that placing bid in opposite colors in same period will not increase your withdrawal balance",
//                 });
//               }
//               if (element.select.includes("Big") && bidOn.includes("Small")) {
//                 setWarning({
//                   ...openWarning,
//                   open: true,
//                   body: "Be aware that placing bid in opposite big small in same period will not increase your withdrawal balance",
//                 });
//               }
//               if (element.select.includes("Small") && bidOn.includes("Big")) {
//                 setWarning({
//                   ...openWarning,
//                   open: true,
//                   body: "Be aware that placing bid in opposite big small in same period will not increase your withdrawal balance",
//                 });
//               }
//             }
//           });
//         }

//         setState({ ...state, bottom: false });
//         const { data } = await api[`minute${params.id}_bidData`](bidData);
//         dispatch({ type: "minute1_bidData", data: data });
//         refreshUserData();
//       } catch (error) {
//         console.log(error.message)
//         setDialog({
//           ...openDialog,
//           open: true,
//           body: error.response.data.error,
//         });
//       }

//       setLoader(false);
//     }
//   };

//   const [openDialog, setDialog] = React.useState({ open: false, body: "" });
//   const [openWarning, setWarning] = React.useState({ open: false, body: "" });

//   const showDialog = (body) => (event) => {
//     if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
//       return;
//     }
//     setDialog({ ...openDialog, open: true, body: body });
//   };

//   const dialogClose = () => {
//     setDialog({ ...openDialog, open: false, body: "" });
//   };

//   const handleNumber = (money) => (e) => {
//     setShowNumber({ ...showNumber, selectedNumber: money });
//     setAmount(money * showNumber.multiNumber);
//   };
//   const handleMulti = (number) => (e) => {
//     setShowNumber({ ...showNumber, number: number, multiNumber: number });
//     setAmount(showNumber.selectedNumber * showNumber.multiNumber);
//   };
//   const incShowNumber = () => {
//     const newMultiNumber = showNumber.multiNumber + 1;
//     setShowNumber({ ...showNumber, multiNumber: newMultiNumber });
//     setAmount(showNumber.selectedNumber * newMultiNumber);
//   };
//   const decShowNumber = () => {
//     if (showNumber.multiNumber > 1) {
//       const newMultiNumber = showNumber.multiNumber - 1;
//       setShowNumber({ ...showNumber, multiNumber: newMultiNumber });
//       setAmount(showNumber.selectedNumber * newMultiNumber);
//     }
//   };

//   const [state, setState] = React.useState({
//     color: "red",
//     title: "Join Red",
//     bottom: false,
//   });

//   const [openWinning, setWinning] = React.useState({ open: false, body: 10 });

//   const toggleDrawer = (color, title, anchor, open) => (event) => {
//     if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
//       return;
//     }

//     setState({ ...state, color, title, [anchor]: open });
//   };

//   const [checkState, checkSetState] = React.useState({
//     checkedB: false,
//   });

//   const handleCheckbox = (event) => {
//     checkSetState({ ...checkState, [event.target.name]: event.target.checked });
//   };
//   const confirmPresale = () => {
//     setPreSale(false);
//     checkSetState({ ...checkState, checkedB: true });
//   };
//   const [ruleDialog, setRule] = React.useState(false);
//   const ruleClose = () => {
//     setRule(false);
//   };
//   const openRule = () => {
//     setRule(true);
//   };
//   const [preSale, setPreSale] = React.useState(false);
//   const preSaleClose = () => {
//     setPreSale(false);
//   };
//   const openPreSale = () => {
//     setPreSale(true);
//   };
//   const closeWarning = () => {
//     setWarning(false);
//   };
//   const handleNav = (e, link) => {
//     e.preventDefault();
//     history.push(`/${link}`);
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       setWindowSize({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     if (openWinning.open) {
//       audio.currentTime = 0; // Reset audio to start
//       audio.play().catch(error => console.log('Audio playback failed:', error));
//     } else {
//       audio.pause();
//       audio.currentTime = 0;
//     }
//   }, [openWinning.open, audio]);

//   return (
//     <div style={{ 
//       backgroundColor: "#6C3A5C",
//       width: "100%",
//       overflowX: "hidden",
//       position: "relative",
//       minHeight: "100vh"
//     }}>
//           <Dialog
//           open={openWinning.open}
//           onClose={dialogCloseWin}
//           PaperProps={{
//             style: {
//               backgroundColor: 'transparent',
//               boxShadow: "none",
//             position: 'relative',
//             overflow: 'visible'
//             },
//           }}
//         >
//         {openWinning.open && (
//           <Confetti
//             width={windowSize.width}
//             height={windowSize.height}
//             numberOfPieces={200}
//             recycle={false}
//             style={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               width: '100%',
//               height: '100%',
//               pointerEvents: 'none',
//               zIndex: 1000
//             }}
//           />
//         )}
//           <Container
//           style={{
//             backgroundColor: '#6C3A5C',
//             width: '300px',
//             position: 'relative',
//             zIndex: 1001,
//             borderRadius: '16px',
//             boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
//             animation: 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
//             paddingTop: '16px'
//           }}
//           >
//             <IconButton
//               onClick={dialogCloseWin}
//               style={{
//                 position: 'absolute',
//                 right: '8px',
//                 top: '8px',
//                 color: 'white',
//                 padding: '8px',
//                 backgroundColor: 'rgba(255,255,255,0.1)',
//                 '&:hover': {
//                   backgroundColor: 'rgba(255,255,255,0.2)'
//                 }
//               }}
//             >
//               <CloseIcon fontSize="small" />
//             </IconButton>
//             <Typography align="center">
//             <img 
//               src={WinBadge} 
//               height={150} 
//               style={{
//                 transform: 'scale(1.1)',
//                 marginTop: '-20px',
//                 animation: 'bounce 1s infinite'
//               }}
//               alt="Winner Badge"
//             />
//             </Typography>
            
//           <Typography 
//             align='center' 
//             style={{
//               color: "white",
//               fontSize: '24px',
//               fontWeight: 'bold',
//               textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
//               animation: 'fadeIn 0.5s ease-out'
//             }}
//           >
//               Congratulations
//             </Typography>
//           <Typography 
//             align='center'
//             style={{
//               paddingTop: '20px',
//               color: "white",
//               fontSize: '12px',
//               fontWeight: 'bold',
//               opacity: 0.9
//             }}
//           >
//              {params.id} Minute Period - {openWinning.result && openWinning.result.id}
//             </Typography>
//           <Typography 
//             align='center'
//             style={{
//               color: "white",
//               fontSize: '16px',
//               fontWeight: 'bold',
//               margin: '8px 0'
//             }}
//           >
//               Result - {openWinning.result && openWinning.result.color}
//             </Typography>
//           <Typography 
//             align='center'
//             style={{
//               paddingTop: '10px',
//               color: "#52AE66",
//               fontSize: '32px',
//               fontWeight: 'bold',
//               textShadow: '0 2px 4px rgba(82,174,102,0.3)',
//               animation: 'pulse 1s infinite'
//             }}
//           >
//               +{openWinning.body}
//             </Typography>
//           <Typography 
//             align='center'
//             style={{
//               paddingBottom: '20px',
//               color: "white",
//               fontSize: '18px',
//               opacity: 0.9
//             }}
//           >
//               Total Winning
//             </Typography>
//           </Container>
//         </Dialog>
      
//       <style>
//         {`
//           @keyframes popIn {
//             0% { transform: scale(0.5); opacity: 0; }
//             100% { transform: scale(1); opacity: 1; }
//           }
          
//           @keyframes bounce {
//             0%, 100% { transform: translateY(0) scale(1.1); }
//             50% { transform: translateY(-10px) scale(1.1); }
//           }
          
//           @keyframes pulse {
//             0% { transform: scale(1); }
//             50% { transform: scale(1.05); }
//             100% { transform: scale(1); }
//           }
          
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(-10px); }
//             to { opacity: 1; transform: translateY(0); }
//           }
//         `}
//       </style>
      
//        <Dialog
//                     open={openWarning.open}
//                     onClose={closeWarning}
//                     PaperProps={{
//                     style: {
//                         // backgroundColor: 'transparent',
//                         boxShadow: 'none',
//                     },
//                     }}
                
                    
//                 >
//                     <Container style={{
//                       // backgroundColor: 'black', opacity: '0.6', height: '50px'
//                       }}>
//                 <Typography style={{padding: '10px', color: "black" }}>{openWarning.body}</Typography>
//                 </Container>
                
                
//               </Dialog>
//        <Dialog
//         open={ruleDialog}
//         onClose={ruleClose}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
        
//       >
       
//         <DialogContent>
//           <Typography align="left" style={{ fontSize: '12px'}}>Rules of guess:</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>In Big or Small bid plateform fee is 7%</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>3 minutes 1 issue, 2 minutes and 30 seconds to order, 30 seconds to show the lottery result. It opens all day. The total number of trade is 480 issues.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>If you spend 100 rupees to trade, after deducting 2 rupees service fee, your contract amount is 98 rupees:</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>If you place bed on Small (Number from 0 to 4) comes you will get (98*2) 196 rupees. and Numbers from 5 to 9, small win and you will get (98 * 2) 196 rupees.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>1,JOIN GREEN: if the result shows 1,3,7,9, you will get (98*2) 196 rupees;

// If the result shows 5, you will get (98*1.5) 147rupees.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2. JOIN RED: if the result shows 2,4,6,8, you will get (98*2) 196 rupees; If the result shows 0, you will get (98*1.5) 147 rupees.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>3. JOIN VIOLET: if the result shows 0 or 5, you will get (98*4.5) 441 rupees.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>4. SELECT NUMBER: if the result is the same as the number you selected, you will get (98*9) 882 rupees.</Typography>
//         </DialogContent>
//         {/* <DialogActions>
//           <Button onClick={ruleClose} color="primary" >
//             OK
//           </Button>
         
//         </DialogActions> */}
//       </Dialog>
//       <Dialog
//         open={preSale}
//         onClose={preSaleClose}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
        
//       >
       
//         <DialogContent>
//           <Typography align="left" style={{ fontSize: '12px',color: 'red'}}>Please confirm you are not from one of below states:</Typography>
//           <Typography align="left" style={{ fontSize: '12px', paddingBottom: '30px'}}>Andhra Pradesh, Bihar, Chhattisgarh, Gujarat, Haryana, Himachal Pradesh, Jammu and Kashmir, Jharkhand, Karnataka, Odisha, Rajasthan, Tamil Nadu, Tripura, Telangana, Uttar Pradesh, Uttarakhand</Typography>
//           <Typography align="left" style={{ fontSize: '12px', color: "red"}}>Presale management rule</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>In order to protect the legitimate rights and interests of users participating in the presale and maintain the normal operation order of the presale, the rules are formulated in accordance with relevant agreements and rules of national laws and regulations.</Typography>
//           <Typography align="left" style={{ fontSize: '12px',color: 'red'}}>Chapter 1 Definition</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>1.1      Presale definition: refers to a sales model in which a merchant provides a product or service plan, gathers consumer orders through presale product tools, and provides goods and / or services to consumers according to prior agreement.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>1.2      The presale model is a "deposit" model. "Deposit" refers to a fixed amount of presale commodity price pre-delivered. "The deposit" can participate in small games and have the opportunity to win more deposits. The deposit can be directly exchanged for commodities. The deposit is not redeemable.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>1.4                Presale system: Refers to the system product tools provided to support merchants for presale model sales.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>1.5                Presale commodity price: refers to the selling price of presale commodity. The price of presale goods is composed of two parts: deposit and final payment.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>1.6                Presale deposit: Refers to a certain amount of money that consumers pay in advance when purchasing presale goods, which is mainly used as a guarantee to purchase presale goods and determine the purchase quota.</Typography>
//           <Typography align="left" style={{ fontSize: '12px', paddingBottom: '30px'}}>1.7                Presale final payment: refers to the amount of money that the consumer still has to pay after the presale commodity price minus the deposit.</Typography>
//           <Typography align="left" style={{ fontSize: '12px',color: 'red'}}>Chapter 2 Presale management specifications</Typography>
//           <Typography align="left" style={{ fontSize: '12px',color: 'red'}}>2.1 Commodity management</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.1.1 Presale deposit time: up to 7 days can be set.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.1.2 Presale final payment time: The start time of the final payment is within 7 days.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.1.3 During the presale of commodities, the system does not support merchants to modify the price of pre-sold commodities (including deposits and balances), but the amount of remaining commodity inventory can be modified according to the actual situation of inventory.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.1.4 To avoid unnecessary disputes, If the presale product is a customized product, the merchant should clearly inform the consumer on the product page of the production cycle and delivery time of the product, and contact the consumer to confirm the delivery standard, delivery time, etc.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.1.5 For customized products, the merchant has not agreed with the consumer on the delivery time and delivery standard, the delivery standard proposed by the consumer is unclear or conflicts and after the merchant places an order, he(she) starts production and delivery without confirming with the consumer, if the consumer initiates a dispute as a result, the platform will treat it as a normal delivery time limit order fulfillment.</Typography>
//           <Typography align="left" style={{ fontSize: '12px',color: 'red'}}>2.2 Transaction management</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.2.1 Consumers who use the pre-sale system will lock in the pre-sale quota after placing an order for goods. If the pre-sale order is overtime, the system will automatically cancel it.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.2.2 During the presale period, the merchant shall not cancel the presale activities without reason. For presale activities that have generated orders, the merchant must not cancel the order without the consumer 's consent. If the consumer agrees, the merchant should double return the deposit paid by the consumer; if the consumer does not agree to cancel the order, the merchant should perform the contract according to the order.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.2.3 If the final payment of the presale order is not completed due to consumer reasons, the merchant can deduct the deposit paid by the consumer; if the merchant actively negotiates with the consumer to terminate the order before paying the final payment, the merchant shall double Return the deposit paid by the consumer.</Typography>
//           <Typography align="left" style={{ fontSize: '12px',color: 'red'}}>2.3 Delivery Management</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.3.1 Delivery time limit setting</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>If the merchant sets the delivery time limit through the presale system, it should be shipped within the set time limit.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>2.3.2 Shipping way</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>The third-party delivery the orders.</Typography>
//           <Typography align="left" style={{ fontSize: '12px'}}>Customers need to provide your name, address and phone number to facilitate third-party delivery orders.</Typography>
//           <Typography align="left" style={{ fontSize: '12px',color: 'red'}}>2.4 After-sales management</Typography>
//           <Typography align="left" style={{ fontSize: '12px',paddingBottom: '30px'}}>Presale products shall provide after-sales service in accordance with the "Regulations for After-sales Service of Platform Merchants".</Typography>
//           <Typography align="left" style={{ fontSize: '12px',fontWeight: 'bold' }}>Explanation</Typography>
//           <Typography align="left" style={{ fontSize: '12px' }}>Mall transaction mode</Typography>
//           <Typography align="left" style={{ fontSize: '12px' }}>There are two ways to buy in the mall, one is full purchase, and the other is deposit purchase.</Typography>
//           <Typography align="left" style={{ fontSize: '12px' }}>In the mode of full purchase, you can place an order directly and purchase goods in full payment.</Typography>
//           <Typography align="left" style={{ fontSize: '12px' }}>The deposit purchase mode will freeze the customer's deposit, and the customer will take delivery after completing the final payment within 7 days. Users who have paid a deposit will be given an extra point quiz game. According to the analysis of market fluctuations, they have the opportunity to win more points to deduct the payment or send red envelopes to friends.</Typography>
//           <Typography align="left" style={{ fontSize: '12px' }}>The pre-order model has many benefits for customers. The deposit not only generates an order for the customer, but also gives the customer an equal amount of red envelopes, which can be withdrawn immediately. Although the deposit is not refundable, the red envelope converted from the deposit can be withdrawn without any loss to the customer.</Typography>
//           <Typography align="left" style={{ fontSize: '12px' }}>1. After the customer pays the deposit and orders, a merchandise order is generated, and the mall began to prepare this order. This deposit cannot be returned. After the customer needs to make up the balance, the mall will ship the goods. If the customer does not make up the balance, the product order will always exist.</Typography>
//           <Typography align="left" style={{ fontSize: '12px' }}>2. After paying the deposit, the customer will be given a red envelope account with the same amount of deposit.</Typography>
//           <Typography align="left" style={{ fontSize: '12px' }}>1. The red envelope can be withdrawn directly, so that instead of losing money, the customer has added a commodity order generated by a deposit. And red envelopes can also be given to friends.</Typography>
//           <Typography align="left" style={{ fontSize: '12px',fontWeight: 'bold',paddingBottom:'30px'}}>2. If the customer uses the red envelope account to participate in the game, you can earn more red envelopes, but if the game loses, the red envelope will be gone, but his merchandise order is still there.</Typography>


//         </DialogContent>
//         <DialogActions>
//         <Typography align="left" style={{ fontSize: '12px',fontWeight: 'bold'}}>Note: I have carefully read all contents of this presale management rule, Risk Disclosure Agreement and Risk Agreement and I am agreed to continue with my own risk.</Typography>
//           <Button onClick={confirmPresale} color="primary" variant="filled">
//             Confirm
//           </Button>
         
//         </DialogActions>
//       </Dialog>
//       <Dialog
//           open={loader}
//           PaperProps={{
//             style: {
//               backgroundColor: 'transparent',
//               boxShadow: 'none',
//             },
//           }}
//         >
//           <Container  align="center" style={{backgroundColor: 'black', opacity: '0.6',height: '100px',paddingTop: "10px"}}>
//           <CircularProgress style={{color: 'white',}} />
//            <Typography style={{paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
//           </Container>
          
          
//         </Dialog>
//         <Dialog
//           open={isBlocked.open}
//           PaperProps={{
//             style: {
//               backgroundColor: 'transparent',
//               boxShadow: 'none',
//             },
//           }}
//         >
//           <Container  align="center" style={{backgroundColor: 'black', opacity: '0.6',height: '80px',paddingTop: "10px"}}>
//            <Typography style={{paddingTop: '10px', color: "white" }}>{isBlocked.msg}</Typography>
//           </Container>
          
          
//         </Dialog>
//         <AppBar position="fixed" style={{ backgroundColor: "#966587" }}>
//         <Toolbar>
//           <Grid
//             container
//             direction="row"
//             justifyContent="space-between"
//             alignItems="center"
//           >
//             <Grid item>
//               <Link to="../">
//                 <ArrowBackIosIcon
//                   style={{ fontSize: "20px", color: "#FFAC3E" }}
//                 />
//               </Link>
//             </Grid>
//             <Grid item xs={4}>
//               <img src={VGALOGO} height={40}></img>
//             </Grid>
//             <Grid item onClick={(e) => handleNav(e, "help")}>
//               <img src={Support} height={30}></img>
//             </Grid>
//           </Grid>
//           {/* <Link to="/">
//             <ArrowBackIosIcon style={{ fontSize: "20px", color: 'white'}} />
//           </Link>
//           <img src={VGALOGO} height={40}></img>
//           <Typography variant="h5" component="div" sx={{ flexGrow: 1 }} align="center" textAlign="center">
//             ToodApple
//           </Typography> */}
//         </Toolbar>
//       </AppBar>
//       <Box borderRadius={"0px 0px 20px 20px"} paddingTop={8}>
//         <Box
//           align={"center"}
//           bgcolor={"#966587"}
//           borderRadius={"8px"}
//           margin={2}
//           style={{
//             backgroundColor: 'rgba(150, 101, 135, 0.4)',
//             borderRadius: '15px',
//             margin: '16px',
//             backdropFilter: 'blur(10px)',
//             border: '1px solid rgba(255,255,255,0.1)',
//             padding: '20px 0',
//             boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
//           }}
//         >
//           <div>
//             <Typography
//               align="center"
//               variant="h5"
//               style={{ 
//                 color: "#FFAC3E", 
//                 fontWeight: "bold",
//                 marginBottom: '8px',
//                 fontSize: '24px'
//               }}
//             >
//               ₹{" "}
//               {user &&
//                 (
//                   user[0].balance + (user[0].integral ? user[0].integral : 0)
//                 ).toFixed(2)}
//             </Typography>

//             <Box 
//               display="flex" 
//               alignItems="center" 
//               justifyContent="center"
//               style={{ marginBottom: '12px' }}
//             >
//               <img 
//                 src={Wallet} 
//                 height={20}
//                 style={{ marginRight: '8px' }}
//               />
//               <Typography 
//                 style={{ 
//                   color: "rgba(255,255,255,0.9)",
//                   fontSize: '14px'
//                 }}
//               >
//                 Wallet Balance
//             </Typography>
//             </Box>

//             <Typography
//               style={{
//                 color: "rgba(255,255,255,0.7)",
//                 fontSize: "12px",
//                 fontWeight: "500",
//                 backgroundColor: 'rgba(255,255,255,0.1)',
//                 padding: '4px 12px',
//                 borderRadius: '12px',
//                 display: 'inline-block'
//               }}
//             >
//               ID {user && user[0].id}
//             </Typography>
//           </div>

//           <Grid
//             container
//             direction="row"
//             alignItems="center"
//             justify="space-around"
//             style={{ 
//               padding: '20px 20px 0 20px',
//               marginTop: '10px',
//               borderTop: '1px solid rgba(255,255,255,0.1)'
//             }}
//           >
//             <Grid item>
//               <a
//                 href={`https://pay.toddapple.live/placeOrder33/${user && user[0].id}/${user && user[0].token}`}
//                 style={{ textDecoration: "none" }}
//               >
//                 <Button
//                   style={{
//                     backgroundColor: '#A1E8CC',
//                     color: '#6C3A5C',
//                     borderRadius: "25px",
//                     textTransform: "none",
//                     fontSize: "15px",
//                     height: "40px",
//                     width: "130px",
//                     fontWeight: 600,
//                     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                     transition: 'all 0.3s ease',
//                     '&:hover': {
//                       backgroundColor: '#8FD4B5',
//                       transform: 'translateY(-2px)',
//                       boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
//                     }
//                   }}
//                 >
//                   Deposit
//                 </Button>
//               </a>
//             </Grid>
//             <Grid item>
//               <a
//                 href="/withdrawal"
//                 style={{ textDecoration: "none" }}
//               >
//                 <Button
//                   style={{
//                     backgroundColor: '#FF4B4B',
//                     color: "white",
//                     borderRadius: "25px",
//                     textTransform: "none",
//                     fontSize: "15px",
//                     height: "40px",
//                     width: "130px",
//                     fontWeight: 600,
//                     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                     transition: 'all 0.3s ease',
//                     '&:hover': {
//                       backgroundColor: '#E63E3E',
//                       transform: 'translateY(-2px)',
//                       boxShadow: '0 4px 6px rgba(0,0,0,0.15)'
//                     }
//                   }}
//                 >
//                   Withdraw
//                 </Button>
//               </a>
//             </Grid>
//           </Grid>
//         </Box>
//       </Box>
//       <Grid
//           container
//           direction="row"
//           alignItems="center"
//           justify="space-between"
//           style={{ paddingLeft: "18px", paddingRight: "18px" }}
//         >
//           <Grid item xs={2}>
//             <img src={Notification} height={30}></img>
//           </Grid>
//           <Grid item xs={10}>
//             <Typography style={{ fontSize: "10px", color: "white" }}>
//               Daily 2 times teacher prediction - 1:00 PM and 5:00 PM. Join our telegram group for predictions and tips to book more profits.
//             </Typography>
//           </Grid>
//         </Grid>
//         <Box
//         height={95}
//         sx={{
//           backgroundColor: !canOpen ? "" : "",
//           width: "100%",
//           overflow: "hidden"
//         }}
//       >
//         <Grid
//           container
//           spacing={2}
//           direction="row"
//           style={{
//             paddingTop: "20px",
//             paddingLeft: "20px",
//             paddingRight: "20px",
//           }}
//         >

//           <Grid item xs={4}>
//             <Link to="/wingo/1">
//             <Button
//               style={{
//                 backgroundColor: params.id === '1' ? "#A1E8CC" : "#966587",
//                 color: params.id ===  "1"? "#6C3A5C" :"white",
//                 borderRadius: " 17px 0px 17px 0px",
//                 textTransform: "none",
//                 fontSize: "16px",
//                 width: "100%",
//                 height: "50px",
//               }}
         
//             >
//               1 Minutes<img src={Timer} height={20} />
//             </Button>
//             </Link>
//           </Grid>
//           <Grid item xs={4}>
//           <Link to="/wingo/3">
//             <Button
//               style={{
//                 backgroundColor: params.id === "3" ? "#A1E8CC" : "#966587",
//                 color: params.id ===  "3"? "#6C3A5C" :"white",
//                 borderRadius: "17px",
//                 textTransform: "none",
//                 fontSize: "16px",
//                 height: "50px",
//                 width: "100%",
//                 boxShadow: "3",

//               }}

//             >
//               3 Minutes<img src={Timer} height={20} />
//             </Button>
//              </Link>
//           </Grid>
//           <Grid item xs={4}>
//           <Link to="/wingo/5"> 
//             <Button
//               style={{
//                 backgroundColor: params.id ===  "5"? "#A1E8CC" : "#966587",
//                 color: params.id ===  "5"? "#6C3A5C" :"white",
//                 borderRadius: "0px 17px 0px 17px",
//                 textTransform: "none",
//                 fontSize: "16px",
//                 width: "100%",
//                 height: "50px",
//               }}
  
//             >
//               5 Minutes <img src={Timer} height={20} />
//             </Button>
//             </Link>
//           </Grid>
//         </Grid>

       
//       </Box>
      

      
//       <Box className={classes.ticketCard} style={{
//         borderRadius: '10px',
       
        
//       }}>
//         <Container style={{ paddingTop: "10px" }}>
//           <Grid
//             container
//             spacing={0}
//             direction="row"
//             justifyContent="space-between"
//             bgcolor="red"
//           >
//             <Grid item>
//               <Container
//                 style={{
//                   marginTop: "10px",
//                   color: "#87551D",
//                   borderRadius: "25px",
//                   borderStyle: "solid",
//                   borderColor: "black",
//                   textTransform: "none",
//                   fontSize: "15px",
//                   width: "100%",

//                   textAlign: "center",
//                 }}
//               >
//                 🎯 How to play
//               </Container>

//               <Grid
//                 container
//                 spacing={0}
//                 direction="row"
//                 justify="space-between"
//                 style={{ paddingTop: "10px" }}
//               >
//                 {record && record.slice(0, 5).map((entry, index) => (
//                   <Grid item key={index}>
//                     <img 
//                       src={entry.number === 0 ? N0 :
//                            entry.number === 1 ? N1 :
//                            entry.number === 2 ? N2 :
//                            entry.number === 3 ? N3 :
//                            entry.number === 4 ? N4 :
//                            entry.number === 5 ? N5 :
//                            entry.number === 6 ? N6 :
//                            entry.number === 7 ? N7 :
//                            entry.number === 8 ? N8 :
//                            entry.number === 9 ? N9 : N0} 
//                       height={25} 
//                       alt={`Number ${entry.number}`}
//                     />
//                 </Grid>
//                 ))}
//               </Grid>
//             </Grid>
//             <Grid item>
//               <Typography
//                 align="center"
//                 style={{ color: "#87551D", fontWeight: "bold" }}
//               >
//                 Time remaining
//               </Typography>
//               <Grid container direction="row">
//                 {/* {timer < 0 ? <Typography>Loading</Typography> : 
//             <DIv */}
//                 <Grid item style={{ padding: "2px" }}>
//                   <Box
//                     display="flex"
//                     height={28}
//                     width={22}
//                     bgcolor="#6C3A5C"
//                     style={{ borderRadius: "4px" }}
//                   >
//                     <Box m="auto">
//                       <Typography style={{ fontSize: "20px", color: "white" }}>
//                         0
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Grid>
//                 <Grid item style={{ padding: "2px" }}>
//                   <Box
//                     display="flex"
//                     height={28}
//                     width={22}
//                     bgcolor="#6C3A5C"
//                     style={{ borderRadius: "4px" }}
//                   >
//                     <Box m="auto">
//                       <Typography style={{ fontSize: "20px", color: "white" }}>
//                         {timer < 0 ? "0" : Math.floor(timer / 60)}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Grid>
//                 <Grid item style={{ padding: "2px" }}>
//                   <Typography style={{ fontSize: "20px" }}>:</Typography>
//                 </Grid>
//                 <Grid item style={{ padding: "2px" }}>
//                   <Box
//                     display="flex"
//                     height={28}
//                     width={44}
//                     bgcolor="#6C3A5C"
//                     style={{ borderRadius: "4px" }}
//                   >
//                     <Box m="auto">
//                       <Typography style={{ fontSize: "20px", color: "white" }}>
//                         {timer < 0
//                           ? "0"
//                           : Math.round(timer - Math.floor(timer / 60) * 60) < 10
//                           ? "0" +
//                             Math.round(timer - Math.floor(timer / 60) * 60)
//                           : Math.round(timer - Math.floor(timer / 60) * 60)}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 {/* <Grid item style={{padding: '2px'}}>
//             <Box display="flex" height={28} width={22}  bgcolor='#6C3A5C' style={{borderRadius: '4px'}}>
//             <Box m="auto" >
//             <Typography style={{ fontSize: '20px'}}>0
            
//           </Typography>
//             </Box>
            
//           </Box>
//             </Grid> */}
//               </Grid>
//               <Typography
//                 align="center"
//                 style={{ color: "#87551D", fontWeight: "bold" }}
//               >
//                 {record && record[0].id + 1}
//               </Typography>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>
//       <Box
//         height={"260px"}
//         sx={{
//           backgroundColor: !canOpen ? "" : "",
//           width: "100%",
//           overflow: "hidden"
//         }}
//       >
//         <Grid
//           container
//           spacing={2}
//           direction="row"
//           style={{
//             paddingTop: "20px",
//             paddingLeft: "20px",
//             paddingRight: "20px",
//           }}
//         >
//           <Grid item xs={4}>
//             <Button
//               style={{
//                 backgroundColor: !canOpen ? "#dbdbdb" : "#0f8c2d",
//                 color: "white",
//                 borderRadius: " 0px 17px 0px 17px",
//                 textTransform: "none",
//                 fontSize: "18px",
//                 width: "100%",
//                 height: "50px",
//               }}
//               onClick={
//                 canOpen
//                   ? toggleDrawer("#0f8c2d", "Join Green", "bottom", true)
//                   : null
//               }
//             >
//               Green
//             </Button>
//           </Grid>
//           <Grid item xs={4}>
//             <Button
//               style={{
//                 backgroundColor: !canOpen ? "#dbdbdb" : "#a30d18",
//                 color: "white",
//                 borderRadius: "17px",
//                 textTransform: "none",
//                 fontSize: "18px",
//                 height: "50px",
//                 width: "100%",
//                 boxShadow: "3",
//               }}
//               onClick={
//                 canOpen
//                   ? toggleDrawer("#a30d18", "Join Red", "bottom", true)
//                   : null
//               }
//             >
//               Red
//             </Button>
//           </Grid>
//           <Grid item xs={4}>
//             <Button
//               style={{
//                 backgroundColor: !canOpen ? "#dbdbdb" : "#5f47a6",
//                 color: "white",
//                 borderRadius: "17px 0px 17px 0px",
//                 textTransform: "none",
//                 fontSize: "18px",
//                 width: "100%",
//                 height: "50px",
//               }}
//               onClick={
//                 canOpen
//                   ? toggleDrawer("#5f47a6", "Join Violet", "bottom", true)
//                   : null
//               }
//             >
//               Violet
//             </Button>
//           </Grid>
//         </Grid>

//         {canOpen ? (
//           <Box
//             bgcolor={"#966587"}
//             margin={"15px"}
//             height={160}
//             borderRadius={"10px"}
//           >
//             <Grid
//               container
//               spacing={0}
//               direction="row"
//               justify="space-evenly"
//               style={{ minHeight: "50px", paddingTop: "15px" }}
//             >
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 0", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // background: !canOpen ? "#dbdbdb" : "linear-gradient(90deg, #a30d18, #5f47a6)",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>0</Typography> */}
//                 <img src={N0} height={60} alt="n0" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 1", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#048522",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white",fontSize: '16px'  }}>1</Typography> */}
//                 <img src={N1} height={60} alt="n1" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 2", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#a30d18",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white",fontSize: '16px'  }}>2</Typography> */}
//                 <img src={N2} height={60} alt="n2" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 3", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#048522",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white", fontSize: '16px' }}>3</Typography> */}
//                 <img src={N3} height={60} alt="n3" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 4", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#a30d18",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>4</Typography> */}
//                 <img src={N4} height={60} alt="n4" />
//               </Grid>
//             </Grid>
//             <Grid
//               container
//               spacing={0}
//               direction="row"
//               justify="space-evenly"
//               style={{ minHeight: "50px", paddingTop: "10px" }}
//             >
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 5", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // background: !canOpen ? "#dbdbdb" : "linear-gradient(90deg, #048522, #5f47a6)",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>5</Typography> */}
//                 <img src={N5} height={60} alt="n5" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 6", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : " #a30d18",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>6</Typography> */}
//                 <img src={N6} height={60} alt="n6" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 7", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#048522",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>7</Typography> */}
//                 <img src={N7} height={60} alt="n7" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 8", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : " #a30d18",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>8</Typography> */}
//                 <img src={N8} height={60} alt="n8" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 9", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" :"#048522",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>9</Typography> */}
//                 <img src={N9} height={60} alt="n9" />
//               </Grid>
//             </Grid>
//           </Box>
//         ) : (
//           <Box
//             bgcolor={"#966587"}
//             margin={"15px"}
//             height={160}
//             borderRadius={"10px"}
//             position="relative"
//           >
//             <Grid
//               container
//               spacing={0}
//               direction="row"
//               justify="space-evenly"
//               style={{ minHeight: "50px", paddingTop: "15px" }}
//             >
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 0", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // background: !canOpen ? "#dbdbdb" : "linear-gradient(90deg, #a30d18, #5f47a6)",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>0</Typography> */}
//                 <img src={N0} height={60} alt="n0" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 1", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#048522",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white",fontSize: '16px'  }}>1</Typography> */}
//                 <img src={N1} height={60} alt="n1" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 2", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#a30d18",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white",fontSize: '16px'  }}>2</Typography> */}
//                 <img src={N2} height={60} alt="n2" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 3", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#048522",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white", fontSize: '16px' }}>3</Typography> */}
//                 <img src={N3} height={60} alt="n3" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 4", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "0px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#a30d18",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>4</Typography> */}
//                 <img src={N4} height={60} alt="n4" />
//               </Grid>
//             </Grid>
//             <Grid
//               container
//               spacing={0}
//               direction="row"
//               justify="space-evenly"
//               style={{ minHeight: "50px", paddingTop: "10px" }}
//             >
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 5", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // background: !canOpen ? "#dbdbdb" : "linear-gradient(90deg, #048522, #5f47a6)",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>5</Typography> */}
//                 <img src={N5} height={60} alt="n5" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 6", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : " #a30d18",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>6</Typography> */}
//                 <img src={N6} height={60} alt="n6" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 7", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : "#048522",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>7</Typography> */}
//                 <img src={N7} height={60} alt="n7" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#a30d18", "Select 8", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" : " #a30d18",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>8</Typography> */}
//                 <img src={N8} height={60} alt="n8" />
//               </Grid>
//               <Grid
//                 item
//                 container
//                 alignItems="center"
//                 justify="center"
//                 onClick={
//                   canOpen
//                     ? toggleDrawer("#048522", "Select 9", "bottom", true)
//                     : null
//                 }
//                 style={{
//                   height: "40px",
//                   width: "40px",
//                   borderRadius: "2px",
//                   padding: "20px",
//                   // backgroundColor: !canOpen ? "#dbdbdb" :"#048522",
//                 }}
//               >
//                 {/* <Typography style={{ color: "white" }}>9</Typography> */}
//                 <img src={N9} height={60} alt="n9" />
//               </Grid>
//             </Grid>
//             {!canOpen && (
//               <Box
//                 position="absolute"
//                 top={0}
//                 left={0}
//                 right={0}
//                 bottom={0}
//               display="flex" 
//               alignItems="center" 
//               justifyContent="center"
//                 bgcolor="rgba(150, 101, 135, 0.8)"
//                 backdropFilter="blur(8px)"
//                 WebkitBackdropFilter="blur(8px)"
//                 borderRadius="10px"
//                 style={{
//                   opacity: 0.9,
//                   transition: 'all 0.3s ease'
//                 }}
//           >
//             <Typography
//                 style={{ 
//                     fontSize: "50px", 
//                     fontWeight: "bold", 
//                     color: "white",
//                     textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
//                     opacity: 1
//                   }}
//                 >
//                   {loader ? "" : timer > 0 ? Math.round(timer) : '0'}
//             </Typography>
//             </Box>
//             )}
//           </Box>
//         )}
//       </Box>
//       <Grid
//         container
//         spacing={2}
//         direction="row"

//         style={{ paddingTop: "20px",paddingLeft: "20px",paddingRight:'20px'}}
//       >
//         <Grid item xs = {6}>
//           <Button
//             style={{
              
//               backgroundColor: !canOpen ? "#dbdbdb" : "#2196f3",
//               color: !canOpen ? 'white' :"white",
//               borderRadius: '25px',
//               textTransform: 'none',
//               fontSize: '14px',
//               width: '100%',
              
 
//             }}
//             onClick={
//               canOpen ? toggleDrawer("#2196f3", "Big", "bottom", true) : null
//             }
//           >
//             Big
//           </Button>
//         </Grid>
//         <Grid item xs = {6}>
//           <Button
//             style={{
             
//               backgroundColor: !canOpen ? "#dbdbdb" : "orange",
//               color: !canOpen ? 'white' :"white",
//               borderRadius: '25px',
//               textTransform: 'none',
//               fontSize: '14px',
//               width: '100%',
              
              

//             }}
//             onClick={
//               canOpen
//                 ? toggleDrawer("orange", "Small", "bottom", true)
//                 : null
//             }
//           >
//             Small
//           </Button>
//         </Grid>
       
//       </Grid>
//       <div>
//       <Dialog
//         open={openDialog.open}
//         onClose={dialogClose}
//         PaperProps={{
//           style: {
//             backgroundColor: 'transparent',
//             boxShadow: 'none',
//           },
//         }}
      
        
//       >
//         <Container style={{backgroundColor: 'black', opacity: '0.6',height: '50px'}}>
//         <Typography style={{paddingTop: '10px', color: "white" }}>{openDialog.body}</Typography>
//         </Container>
        
        
//       </Dialog>
//       <Drawer
//           anchor="bottom"
//           open={state["bottom"]}
//           onClose={toggleDrawer("", "", "bottom", false)}
//         PaperProps={{
//           style: {
//             borderTopLeftRadius: '24px',
//             borderTopRightRadius: '24px',
//             height: '60vh',
//             background: '#1A1A1A',
//             position: 'fixed',
//             bottom: 0,
//             left: 0,
//             right: 0
//           }
//         }}
//       >
//         <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//           {/* Header */}
//           <Box 
//             display="flex" 
//             height={50} 
//             bgcolor="#2D2D2D"
//             borderTopLeftRadius="24px"
//             borderTopRightRadius="24px"
//             position="relative"
//             boxShadow="0 2px 8px rgba(0,0,0,0.1)"
//             flexShrink={0}
//           >
//               <Box m="auto">
//               <Typography style={{ 
//                 color: "#FFFFFF", 
//                 fontSize: "16px", 
//                 fontWeight: "600",
//                 letterSpacing: "0.5px"
//               }}>
//                   {state.title}
//                 </Typography>
//               </Box>
//             <IconButton 
//               onClick={toggleDrawer("", "", "bottom", false)}
//                     style={{
//                 position: 'absolute', 
//                 right: 8, 
//                 top: 8,
//                 padding: '4px',
//                 color: '#FFFFFF',
//                 backgroundColor: 'rgba(255,255,255,0.1)',
//               }}
//             >
//               <CloseIcon fontSize="small" />
//             </IconButton>
//           </Box>

//           {/* Scrollable Content Area */}
//           <Box style={{ 
//             flex: 1,
//             overflowY: 'auto',
//             paddingBottom: '80px' // Add padding to prevent content from being hidden behind buttons
//           }}>
//             <Container style={{ 
//               padding: "12px 16px",
//             }}>
//               {/* Contract Money Section */}
//               <Typography variant="subtitle1" style={{ 
//                 marginBottom: "8px", 
//                 color: "#FFFFFF",
//                 fontWeight: "600",
//                 fontSize: "14px"
//               }}>
//                 Select Amount
//             </Typography>
//               <Grid container spacing={1} style={{ marginBottom: "12px" }}>
//                 {[1, 10, 500, 1000].map((value) => (
//                   <Grid item xs={3} key={value}>
//                   <Button
//                       variant="outlined"
//                       fullWidth
//                     style={{
//                         backgroundColor: showNumber.selectedNumber === value ? state.color : "#2D2D2D",
//                         color: "#FFFFFF",
//                         border: showNumber.selectedNumber === value ? "none" : "1px solid rgba(255,255,255,0.1)",
//                         borderRadius: "8px",
//                         textTransform: "none",
//                         height: "36px",
//                         fontSize: "13px",
//                         fontWeight: "600"
//                       }}
//                       onClick={handleNumber(value)}
//                     >
//                       ₹{value}
//                   </Button>
//                 </Grid>
//                 ))}
//                 </Grid>

//               {/* Number Selection Section */}
//               <Typography variant="subtitle1" style={{ 
//                 marginBottom: "8px", 
//                 color: "#FFFFFF",
//                 fontWeight: "600",
//                 fontSize: "14px"
//               }}>
//                 Number of Hands
//               </Typography>
//               <Grid container spacing={1} style={{ marginBottom: "12px" }}>
//                 {[3, 5, 10].map((value) => (
//                   <Grid item xs={4} key={value}>
//                   <Button
//                       variant="outlined"
//                       fullWidth
//                     style={{
//                         backgroundColor: showNumber.multiNumber === value ? state.color : "#2D2D2D",
//                         color: "#FFFFFF",
//                         border: showNumber.multiNumber === value ? "none" : "1px solid rgba(255,255,255,0.1)",
//                         borderRadius: "8px",
//                         textTransform: "none",
//                         height: "36px",
//                         fontSize: "13px",
//                         fontWeight: "600"
//                       }}
//                       onClick={handleMulti(value)}
//                     >
//                       {value}x
//                   </Button>
//                 </Grid>
//                 ))}
//                 </Grid>

//               {/* Amount Input Section */}
//               <Box style={{ marginBottom: "12px" }}>
//                 <Typography variant="subtitle1" style={{ 
//                   marginBottom: "8px", 
//                   color: "#FFFFFF",
//                   fontWeight: "600",
//                   fontSize: "14px"
//                 }}>
//                   Custom Amount
//                 </Typography>
//                 <Grid container alignItems="center" spacing={1}>
//                 <Grid item>
//                     <Typography style={{ 
//                       fontSize: "16px", 
//                       fontWeight: "600",
//                       color: "#FFFFFF",
//                       marginRight: "8px"
//                     }}>
//                   ₹
//                 </Typography>
//               </Grid>
//                   <Grid item xs>
//                     <FormControl fullWidth variant="outlined">
//                       <OutlinedInput
//                     value={amount}
//                     type="number"
//                     onChange={handleChangeAmount}
//                     style={{
//                           backgroundColor: "#2D2D2D",
//                           borderRadius: "8px",
//                           height: "40px",
//                           color: "#FFFFFF",
//                           fontSize: "14px",
//                           fontWeight: "600"
//                     }}
//                   />
//                 </FormControl>
//               </Grid>
//             </Grid>
//           </Box>

//               {/* Number Adjustment Section */}
//               <Box 
//                 display="flex" 
//                 alignItems="center"
//                 justifyContent="center" 
//             style={{ 
//                   marginBottom: "12px",
//                   backgroundColor: "#2D2D2D",
//                   borderRadius: "8px",
//                   padding: "6px"
//                 }}
//               >
//                 <IconButton 
//                   onClick={decShowNumber} 
//                   size="small"
//                   style={{ 
//                     backgroundColor: "rgba(255,255,255,0.1)",
//                     color: "#FFFFFF",
//                     padding: "6px"
//                   }}
//                 >
//                   <RemoveIcon fontSize="small" />
//                 </IconButton>
//                 <Typography style={{ 
//                   margin: "0 12px", 
//                   fontSize: "16px", 
//                   fontWeight: "600",
//                   color: "#FFFFFF"
//                 }}>
//                   {showNumber.multiNumber}
//             </Typography>
//                 <IconButton 
//                   onClick={incShowNumber} 
//                   size="small"
//                   style={{ 
//                     backgroundColor: "rgba(255,255,255,0.1)",
//                     color: "#FFFFFF",
//                     padding: "6px"
//                   }}
//                 >
//                   <AddIcon fontSize="small" />
//                 </IconButton>
//               </Box>

//               {/* Terms and Conditions */}
//               <Box style={{ marginBottom: "12px" }}>
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={checkState.checkedB}
//                       onChange={handleCheckbox}
//                       name="checkedB"
//                       color="primary"
//                       size="small"
//                       style={{ 
//                         color: state.color,
//                         padding: "4px"
//                       }}
//                     />
//                   }
//                   label={
//                     <Typography variant="body2" style={{ 
//                       color: "#FFFFFF",
//                       fontSize: "12px",
//                       opacity: 0.8
//                     }}>
//                       I agree to the{" "}
//                       <Link
//                         onClick={openPreSale}
//                   style={{
//                           color: state.color, 
//                           textDecoration: "none",
//                           fontWeight: "600"
//                         }}
//                       >
//                         Terms & Conditions
//                       </Link>
//                 </Typography>
//                   }
//                 />
//               </Box>

//               {/* Total Amount Display */}
//               <Box 
//                 display="flex" 
//                 justifyContent="space-between" 
//               alignItems="center"
//                   style={{
//                   marginBottom: "12px",
//                   padding: "10px 12px",
//                   backgroundColor: "#2D2D2D",
//                   borderRadius: "8px"
//                 }}
//               >
//                 <Typography style={{ 
//                   fontWeight: "600",
//                   color: "#FFFFFF",
//                   fontSize: "14px"
//                 }}>
//                   Total Amount
//                 </Typography>
//                 <Typography style={{ 
//                   fontWeight: "700", 
//                   fontSize: "16px",
//                   color: "#FFFFFF"
//                 }}>
//                   ₹{amount}
//                 </Typography>
//                   </Box>
//             </Container>
//                 </Box>

//           {/* Fixed Bottom Action Buttons */}
//           <Box
//             style={{
//               position: 'absolute',
//               bottom: 0,
//               left: 0,
//               right: 0,
//               padding: '16px',
//               backgroundColor: '#1A1A1A',
//               borderTop: '1px solid rgba(255,255,255,0.1)'
//             }}
//           >
//             <Grid container spacing={2}>
//               <Grid item xs={6}>
//                 <Button
//                   fullWidth
//                   variant="outlined"
//                   onClick={toggleDrawer("", "", "bottom", false)}
//                   style={{
//                     height: "40px",
//                     borderRadius: "8px",
//                     borderColor: "rgba(255,255,255,0.1)",
//                     color: "#FFFFFF",
//                     textTransform: "none",
//                     fontSize: "14px",
//                     fontWeight: "600",
//                     backgroundColor: "#2D2D2D"
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </Grid>
//               <Grid item xs={6}>
//                 <Button
//                   fullWidth
//                   variant="contained"
//                 onClick={handleFormData(state.title, amount, "")}
//                   style={{
//                     height: "40px",
//                     borderRadius: "8px",
//                     backgroundColor: state.color,
//                     textTransform: "none",
//                     fontSize: "14px",
//                     fontWeight: "600"
//                   }}
//                 >
//                   Confirm
//                 </Button>
//               </Grid>
//             </Grid>
//           </Box>
//           </div>
//         </Drawer>
//       </div>
      

//       <Container style={{ paddingTop: "20px" }}>
//         <Grid container direction="row" justify="space-between">
//           <Grid item>
//             <Typography style={{color: "white"}}>{`${params.id} Minutes`} Record</Typography>
//           </Grid>
//           <Link to={`/minutes/record/${params.id}`} style={{textDecoration: 'none', color: 'black'}}>
//           <Grid item>
//             <Typography style={{ color: "grey" }}>more ›</Typography>
//           </Grid>
//           </Link>
//         </Grid>
        
//       </Container>
//       <Record record = {record}/>
  

//       <Container style={{ 
//         paddingTop: "20px",
//         paddingBottom: '80px',
//         maxWidth: "100%",
//         width: "100%",
//         margin: 0
//       }}>
//         <Grid container direction="row" justify="space-between">
//           <Grid item>
//             <Typography style={{color: 'white'}}>{`${params.id} Minutes`} Bid History</Typography>
//           </Grid>
//           <Link to={`/minutes/bidHistory/${params.id}`} style={{textDecoration: 'none', }}>
//           <Grid item>
//             <Typography style={{ color: "grey" }}>more ›</Typography>
//           </Grid>
//           </Link>
//         </Grid>
//         <BidHistory bidHistory = {bidHistory}/>
//       </Container>
      
//     </div>
//   );
// };

// export default MinutesGamePage;
