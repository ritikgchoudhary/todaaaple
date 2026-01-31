import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  FormControl,
  Box,
  InputLabel,
  MenuItem,
  Select,
  Container,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
  GridList,
  GridListTile,
} from "@material-ui/core/";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth.js";
import useStyles from "../home/style/game.js";
import io from "socket.io-client";
import axios from "axios";
import MinesHowTo from "../../images/minesHowToPlay.png";
import { FaPlayCircle } from "react-icons/fa";
import { BiSolidCricketBall } from "react-icons/bi";
import Recharge from "../../images/recharge.png";

var socket;

const CricketGamePage = () => {
  const URL = api.url;
  const cricketURL = api.cricket;
  const classes = useStyles();
  const [currentMatches, setCurrentMatches] = useState();
  const [loader, setLoader] = React.useState(false);
  const [user, setUser] = useState();


  const [openDialog, setDialog] = React.useState({ open: false, body: "" });

  // const [socketConnected, setSocketConnection] = React.useState(false);
  const history = useHistory();


  const [ruleDialog, setRule] = React.useState(false);
  const ruleClose = () => {
    setRule(false);
  };

  useEffect(() => {
    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);

      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getUser/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          if (response.data.block) {
            localStorage.removeItem("user");
            window.location.replace("/login");
          }
          setUser(response.data);
        
          socket = io(cricketURL,{auth: {'user_id': response.data[0].id,'token': response.data[0].token}});

          socket.emit('getCurrentMatches',{id: response.data[0].id,token: response.data[0].token});
          socket.on('currentMatchesList',(res)=>{
            setCurrentMatches(res);
            setLoader(false);
          })
      

          
        })
        .catch((error) => {
          console.log(error);
          setLoader(false);

          history.push("/login");
        });

      
    } else {
      setLoader(false);
      window.location.replace("/login");
    }
  }, []);



  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };


  return (
    <div>
      <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        
      >
       
        <DialogContent>
        <Typography align="center" style={{ fontSize: '20px',fontWeight: 'bold',paddingBottom: '20px'}}>Mines</Typography>
        <img style={{ paddingLeft: '15px'}} src={MinesHowTo} alt="mines"/>
          <Typography align="left" style={{ fontSize: '16px',fontWeight: 'bold',paddingBottom: '20px',paddingTop: '20px'}}>Each card hides either a bomb or a coin</Typography>
          <Typography align="left" style={{ fontSize: '15px',paddingBottom: '20px'}}>The more you finds the coin the higher your winning will be. You can cashout after each move. If you finds the bomb, Game Over !</Typography>
           </DialogContent>
        {/* <DialogActions>
          <Button onClick={ruleClose} color="primary" >
            OK
          </Button>
         
        </DialogActions> */}
      </Dialog>
      <Grid
          className={classes.headerCricketPage}
          container
          direction="row"
          alignItems="center"
          justify="space-between"
        >
          <Grid item>
            <div>
              <Typography align="left" style={{ color: "white",fontWeight: 'bold'}}>
                Available Balance
              </Typography>
              <Typography
                align="left"
                variant="h6"
                style={{
                  color: "white",
                  marginTop: "-5px",
                  fontWeight: "bold",
                }}
              >
                ₹ {user && user[0].balance.toFixed(2)}
              </Typography>

            
            </div>
          </Grid>

          <Grid item>
          <a href="https://game.toddapples.com/preOrder">
          <img src={Recharge} height={25} alt="recharge"/>
          </a>
          </Grid>
        </Grid>

     
      <div className='container-fluid' style={{ paddingRight: "11px", paddingLeft: "11px", paddingTop: '10px',paddingBottom: '50px'}}>
      
      <div className='row justify-center-center'>
        <div className='col-8 mt-1' style={{ fontSize: "18px", fontWeight: "600" }}><BiSolidCricketBall size={22} color='#257b23' /> Cricket</div>
        <div className='col-4 mt-2' >
         
       
        <Container style={{ backgroundColor: "red" }}>
            <Typography align="center"
              style={{ color: "white", fontWeight: "bold", fontSize: "12px" }}
            >
              EXP {user && user[0].exp &&  user[0].exp ?  user[0].exp.toFixed(0):0}
            </Typography>

          </Container>
        
        </div>

      </div>
      <hr></hr>
      <div className='mt-3'>
            <nav className="navbar navbar-light justify-content-between" style={{background:"#257b23",padding:".2rem 1rem"}}>
                <Link className="navbar-brand text-white font-weight-bold" to="/">
                <FaPlayCircle style={{marginTop:"-4px"}} /> Matches
                </Link>
                <Link to={`/cricket/history`}>
                <div className="form-inline text-white">
                    <small><b>Your Bets <span className="badge badge-light">{'🏏'}</span></b></small>
                </div> 
                </Link>         
            </nav>
            
        </div>
     

      
     
     
     
      <table className='table table-hover' >
        <thead className='thead'>
          <tr>
            <th>Matches</th>
            <th>Timing</th>
          </tr>
        </thead>
        <tbody className='tbody'>
          {
            currentMatches && currentMatches[0] && currentMatches[0].name === 'Error' ?                     <Typography style={{fontSize: '12px',paddingTop: '15px', fontWeight: 'bold'}} align="center">No matches</Typography>
            :
            currentMatches && currentMatches.map(matches => {
              // console.log(matches.event);\
              return (
                
                <tr key={matches.id}>
                  <Link to={`/matchPage/${matches.marketId}/${matches.runners[0].runnerName}/${matches.runners[1].runnerName}/${matches.event.id}/${matches.marketStartTime}`}>
                  <td style={{ width: "80%" }}>
                    <Typography style={{fontSize: '12px'}}>{ Date.parse(matches.marketStartTime) <= Date.now() ? matches.event.name+' 🟢'  : matches.event.name}</Typography>
                   
                  </td>
                  </Link> 
                  <td style={{ width: "20%" }}>
                   
                  <Typography style={{fontSize: '12px'}}>{new Date(matches.marketStartTime).toLocaleString()}</Typography>

                    
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      
      {/* <Topbar title = "Upcoming" open_beat_count="9" />
      <table className='table table-hover'>
        <thead className='thead'>
          <tr>
            <th>Matches</th>
            <th>Timing</th>
          </tr>
        </thead>
        <tbody className='tbody'>
          {
            currentMatches && currentMatches.map(matches => {
              // console.log(matches.event);\
              return (
                <tr key={matches.id}>
                  <td style={{ width: "50%" }}>
                    {matches.home.name} vs {matches.away.name}
                  </td>
                  <td style={{ width: "50%" }}>
                    {new Date(matches.time*1000).toLocaleString()}
                  </td>
                </tr>
              )
            })
          }
        </tbody> 
       </table> */}
      <hr></hr>
    </div>
     

      <Dialog
        open={loader}
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Container
          align="center"
          style={{
            backgroundColor: "black",
            opacity: "0.6",
            height: "100px",
            paddingTop: "10px",
          }}
        >
          <CircularProgress style={{ color: "white" }} />
          <Typography style={{ paddingTop: "10px", color: "white" }}>
            Please Wait!
          </Typography>
        </Container>
      </Dialog>

    

      <Dialog
        open={openDialog.open}
        onClose={dialogClose}
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Container
          style={{ backgroundColor: "black", opacity: "0.6", height: "50px" }}
        >
          <Typography style={{ paddingTop: "10px", color: "white" }}>
            {openDialog.body}
          </Typography>
        </Container>
      </Dialog>
    </div>
  );
};

export default CricketGamePage;
