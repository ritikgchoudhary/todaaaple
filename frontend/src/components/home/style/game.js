import { makeStyles } from "@material-ui/core/styles";
import Header from "../../../images/header.jpg";
import HeaderFastParity from "../../../images/headerFastParity.png";
import NightSky from "../../../images/nightsky.png";
import GalaxyOn from "../../../images/stars2.gif";
import GalaxyOff from "../../../images/stars-galaxy.jpg";
import CricketPage from "../../../images/cricket.jpg";
import Home from "../../../images/home.jpg";

import CrciketPitch from "../../../images/cricketPitch.jpg";
import MyTask from "../../../images/mytast.jpg";
import Invite from "../../../images/invite.png";
import QR from "../../../images/qr.png";
import Red from "../../../images/red.jpg";
import BigSmall from "../../../images/bigsmallheader.png"
import Wingo from "../../../images/wingo.png";
import BigSmallHome from "../../../images/bigsmall.png";
import FastParity from "../../../images/fastParity.png";
const gameStyles = makeStyles((theme) => ({
  container: {
   backgroundColor: '#cfe8fc',
   height: '110px',
   
  },
  headerHomeWingo: {

    backgroundImage: `url(${Wingo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "160px",
    
  

  },
  headerHomeFast: {

    backgroundImage: `url(${FastParity})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "160px",
    marginLeft: "15px",
    marginRight: "15px",
  

  },
  headerHomeBigsmall: {

    backgroundImage: `url(${BigSmallHome})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "160px",
    marginLeft: "15px",
    marginRight: "15px",
  

  },
  headerHome: {

    backgroundImage: `url(${Home})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "140px",
    paddingLeft: "15px",
    paddingRight: "15px",
  

  },
  headerCricketPage: {

    backgroundImage: `url(${CricketPage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "140px",
    paddingLeft: "15px",
    paddingRight: "15px",
  

  },
  headerCricketPitch: {

    backgroundImage: `url(${CrciketPitch})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "140px",
    paddingLeft: "15px",
    paddingRight: "15px",
  

  },
  header: {

    backgroundImage: `url(${Header})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "120px",
    paddingLeft: "15px",
    paddingRight: "15px",
  

  },
  headerFastParity: {

    backgroundImage: `url(${HeaderFastParity})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "120px",
    paddingLeft: "15px",
    paddingRight: "15px",
  

  },
  headerBigSmall: {

    backgroundImage: `url(${BigSmall})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: "120px",
    paddingLeft: "15px",
    paddingRight: "15px",
  

  },
  headerAviator: {
    

    backgroundImage: `url(${GalaxyOff})`,
    backgroundSize: 'cover',
    backgroundPosition: 'start',
    minHeight: "400px",
   
    alignContent: "center",
  

  },
  headerAviatorOn: {
    

    backgroundImage: `url(${GalaxyOn})`,
    backgroundSize: 'cover',
    backgroundPosition: 'start',
    minHeight: "400px",
   
    alignContent: "center",
  

  },
  headerMines: {
    backgroundColor: '#05c0b8',
    
    minHeight: "80px",
    paddingLeft: "15px",
    paddingRight: "15px",
  },
  plane : {
    
    transform: 'translateX(-50%)',
    zIndex: '2',
  },
  planeImg:{
    animation: `$planeImge 3s linear infinite`
    
  },
  "@keyframes planeImge": {
   
    "100%": {
      transform: "translateY(-10px)"
    },
    "50%": {
      transform: "translateY(10px)"
    },
    "0%": {
      transform: "translateY(-10px)"
    }
  },
  planeImgAway:{
    animation: `$planeImgeAway 1.5s linear`
    
  },
  "@keyframes planeImgeAway": {
   
    "100%": {
      transform: "translateY(-300px)"
    },
    // "50%": {
    //   transform: "translateY(10px)"
    // },
    // "0%": {
    //   transform: "translateY(-300px)"
    // }
  },




  
  myTask: {
    margin: 0,
    padding: 0,
    backgroundImage: `url(${MyTask})`,
    backgroundSize: 'cover',
    
    height:'100vh'
    
  

  },
  invite: {
    margin: 0,
    padding: 0,
    backgroundImage: `url(${Invite})`,
    backgroundSize: 'cover',
    
    height:'700px'
    
  

  },
  red: {
    margin: 0,
    padding: 0,
    backgroundImage: `url(${Red})`,
    backgroundSize: 'cover',
    
    height:'500px'
    
  

  },
  qr: {
    margin: 0,
    padding: 0,
    backgroundImage: `url(${QR})`,
    backgroundSize: 'cover',
    height:'180px',
    width:'180px'
    
  

  },

  headerMatch: {
    backgroundColor: '#05c0b8',
    
    minHeight: "80px",
    paddingLeft: "15px",
    paddingRight: "15px",
  },
  headerOdds: {
    backgroundColor: '#ffffff',
    
    minHeight: "80px",
    paddingLeft: "15px",
    paddingRight: "15px",
  },
 
 
}));
export default gameStyles;