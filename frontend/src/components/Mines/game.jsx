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
import CardImage from "../../images/card.png";
import CoinImage from "../../images/coin.png";
import BombImage from "../../images/bomb.png";
import PlayHistory from "./playHistory.jsx";
var socket;

const MinesGamePage = () => {
  const URL = api.url;
  const classes = useStyles();
  const [mines, setMines] = React.useState(1);
  const [loader, setLoader] = React.useState(false);
  const [user, setUser] = useState();
  const [bidHistory, setHistory] = useState();
  const [showNumber, setShowNumber] = useState({
    selectedNumber: 10,
    number: 1,
    multiNumber: 1,
  });

  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [gameDialog, setGameDialog] = React.useState({ open: false, body: {title: '', body: ''} });

  // const [socketConnected, setSocketConnection] = React.useState(false);
  const history = useHistory();

  const [cards, setCards] = useState([
    { id: 0, open: false },
    { id: 1, open: false },
    { id: 2, open: false },
    { id: 3, open: false },
    { id: 4, open: false },
    { id: 5, open: false },
    { id: 6, open: false },
    { id: 7, open: false },
    { id: 8, open: false },
    { id: 9, open: false },
    { id: 10, open: false },
    { id: 11, open: false },
    { id: 12, open: false },
    { id: 13, open: false },
    { id: 14, open: false },
    { id: 15, open: false },
    { id: 16, open: false },
    { id: 17, open: false },
    { id: 18, open: false },
    { id: 19, open: false },
    { id: 20, open: false },
    { id: 21, open: false },
    { id: 22, open: false },
    { id: 23, open: false },
    { id: 24, open: false },
  ]);
  const [session, setSession] = useState({ gameStatus: 0,current: 0, next: 0 });
  const [ruleDialog, setRule] = React.useState(false);
  const ruleClose = () => {
    setRule(false);
  };
  const openRule = () => {
    setRule(true);
  };

  const handleCardClick = (tile) => {
    
    setLoader(true);

    socket.emit("click", { id: session.id, tile,userId: user[0].id,token: user[0].token });
    socket.on("gameOver", (res) => {
      
      const insideCards = cards.map((inside) => {
        if (res.bomb.includes(inside.id)) {
          return { ...cards, type: "bomb", open: true };
        }

        return { ...cards, type: "coin", open: true };
      });
      setGameDialog({ ...gameDialog, open: true, body: {title: 'LOSS',body: "Better luck next time."} });

      setLoader(false);
      setCards(insideCards);
      setSession({...session, gameStatus: 2,current: 0, next: 0});
      refreshUser();
    });
    socket.on("gameWon", (res) => {
      const insideCards = cards.map((inside) => {
        if (res.bomb.includes(inside.id)) {
          return { ...cards, type: "bomb", open: true };
        }

        return { ...cards, type: "coin", open: true };
      });
      setGameDialog({ ...gameDialog, open: true, body: {title: `₹${res.amount.toFixed(2)}`,body: "Congratulations you have won the game. Amount is credited to your wallet."} });
      
      setCards(insideCards);

      setSession({...session, gameStatus: 2,current: 0, next: 0});
      refreshUser();
    });
    socket.on("clickResponse", (res) => {
      
      // res.opened.map((tile) => {
      //   // 1. Find the todo with the provided id
      //   const currentTodoIndex = cards.findIndex((card) => card.id === tile.id);
      //   // 2. Mark the todo as complete
      //   const updatedTodo = {...cards[currentTodoIndex], isComplete: true};
      //   // 3. Update the todo list with the updated todo
      //   const newTodos = [
      //     ...cards.slice(0, currentTodoIndex),
      //     updatedTodo,
      //     ...cards.slice(currentTodoIndex + 1)
      //   ];
      //   setCards(newTodos);

      // });
      // setLoader(false);
      
      const insideCards = cards.map((inside) => {
        
        if (res.opened === inside.id) {
          if(res.isFirst){
            return { ...cards, open: true,first:true, reward: res.current };
          }else{
            return { ...cards, open: true, reward: res.current };
          }
          
          
        }

        return inside;
      });
      setCards(insideCards);
      setSession({...session,amount: res.amount,current: res.current, next: res.next});
      setLoader(false);
    });
    setLoader(false);

    //setCards(...cards,)
    // if (openCards.length === 1) {
    //   setOpenCards((prev) => [...prev, index]);
    //   setMoves((moves) => moves + 1);
    //   disable();
    // } else {
    //   clearTimeout(timeout.current);
    //   setOpenCards([index]);
    // }
  };

  const refreshUser = () => {
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
          setUser(response.data);
          setLoader(false);

          // socket.emit('checkOngoing',{id: response.data[0].id,token: response.data[0].token});
          // socket.on('checkOngoingPass',(res)=>{

          //   setLoader(false);
          //   setGameStatus(1);
          // });

          if (response.data.block) {
            localStorage.removeItem("user");
            window.location.replace("/login");
          }
        })
        .catch((error) => {
          console.log(error);
          setLoader(false);

          history.push("/login");
        });

      //Get bid history

      axios
        .get(`${URL}/getMinesBidHistory/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setHistory(response.data);
        })
        .catch((error) => {});
    } else {
      setLoader(false);
      window.location.replace("/login");
    }
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
          setUser(response.data);
        
          socket = io(URL,{auth: {
            'user_id': response.data[0].id,
            'token': response.data[0].token,
          }});
          // const getOngoing = localStorage.getItem('cards');
          // if(getOngoing){
          //   setCards(getOngoing.cards);

          //   setSession({gameStatus: 1,id:getOngoing.id});
          // }

          socket.emit('checkOngoing',{id: response.data[0].id,token: response.data[0].token});
          socket.on('noSession',(res)=>{
            setLoader(false);
          })
          socket.on('checkOngoingPass',(res)=>{
           
          
            const insideCards = cards.map((inside) => {
              if (res.opened.includes(inside.id)) {
                return { ...cards, open: true };
              }
      
              return inside;
            });
      
            
            setCards(insideCards);
            setSession({...session,gameStatus: 1,id: res.id,amount: res.amount,current: res.current, next: res.next});
            setLoader(false);

          });

          if (response.data.block) {
            localStorage.removeItem("user");
            window.location.replace("/login");
          }
        })
        .catch((error) => {
          console.log(error);
          setLoader(false);

          history.push("/login");
        });

      //Get bid history

      axios
        .get(`${URL}/getMinesBidHistory/${foundUser.result.id}/`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          
          setHistory(response.data);
        })
        .catch((error) => {});
    } else {
      setLoader(false);
      window.location.replace("/login");
    }
  }, []);

  // useEffect(() => {
  //   const loggedInUser = localStorage.getItem("user");
  //   if (loggedInUser) {
  //   const foundUser = JSON.parse(loggedInUser);
  //   const data = {id: foundUser.result.id}
  //   socket = io(URL);
  //   socket.emit('setup',data);
  //   socket.on("connection", () => setSocketConnection(true));}
  // }, []);

  const handleNumber = (money) => (e) => {
    setShowNumber({ ...showNumber, selectedNumber: money });
  };

  const startGame = () => {
    setLoader(true);
    const data = {
      id: user[0].id,
      amount: showNumber.selectedNumber * showNumber.multiNumber,
      token: user[0].token,
      mines,
    };
    socket.emit("startGame", data);
    socket.on("errorOccurred", (msg) => {
      setLoader(false);
      setDialog({ ...openDialog, open: true, body: msg });
    });
    socket.on("created", (res) => {
      setCards([
        { id: 0, open: false },
        { id: 1, open: false },
        { id: 2, open: false },
        { id: 3, open: false },
        { id: 4, open: false },
        { id: 5, open: false },
        { id: 6, open: false },
        { id: 7, open: false },
        { id: 8, open: false },
        { id: 9, open: false },
        { id: 10, open: false },
        { id: 11, open: false },
        { id: 12, open: false },
        { id: 13, open: false },
        { id: 14, open: false },
        { id: 15, open: false },
        { id: 16, open: false },
        { id: 17, open: false },
        { id: 18, open: false },
        { id: 19, open: false },
        { id: 20, open: false },
        { id: 21, open: false },
        { id: 22, open: false },
        { id: 23, open: false },
        { id: 24, open: false },
      ]);

      setSession({ gameStatus: 1, id: res.id,current: res.currentReward, next: res.nextReward});
      setLoader(false);
      refreshUser();
    });
  };

  const stopGame = () => {
    setLoader(true);
    const data = {
      userId: user[0].id,
      token: user[0].token,
      id: session.id
    };
    socket.emit("stopGame", data);
    socket.on("errorOccurred", (msg) => {
      setLoader(false);
      setDialog({ ...openDialog, open: true, body: msg });
    });
    socket.on("cashedOut", (res) => {
      setSession({...session,gameStatus: 0,current: 0, next:0});
      setDialog({ ...openDialog, open: true, body: `Successfull Cashout ₹${res.amount.toFixed(2)}` });
      setLoader(false);
      refreshUser();
    });
  };

  const handleChange = (event) => {
    setMines(event.target.value);
  };
  const handleMulti = (number) => (e) => {
    setShowNumber({ ...showNumber, number: number, multiNumber: number });
  };
  const incShowNumber = () => {
    setShowNumber({ ...showNumber, multiNumber: showNumber.multiNumber + 1 });
  };
  const decShowNumber = () => {
    if (showNumber.multiNumber > 1)
      setShowNumber({ ...showNumber, multiNumber: showNumber.multiNumber - 1 });
  };
  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };
  const gameDialogClose = () => {
    setGameDialog({ ...gameDialog, open: false });
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
        className={classes.headerMines}
        container
        direction="row"
        alignItems="center"
        justify="space-between"
      >
        <Grid item>
          <Grid container direction="column" alignItems="start">
            <Grid item>
              <Typography style={{ color: "black", fontSize: "12px" }}>
                Available Balance
              </Typography>
            </Grid>
            <Grid item>
              <Typography
                style={{ color: "white", fontWeight: "bold", fontSize: "20px" }}
              >
                ₹{user && user[0].balance.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Container
            style={{
              backgroundColor: "white",
              color: "black",
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "20px",
              width: "100%",
            }}
          >
            Next ₹{session.next.toFixed(2)}
          </Container>
        </Grid>
      </Grid>

      <Container style={{ height: "50px" }}></Container>

      {session.gameStatus === 0 ? (
        <Container>
          <Typography variant="h5" align="center">
            Place bit to start game
          </Typography>
          <Container align="center">
            <Button
              variant="h6"
              align="center"
              style={{ color: "white", backgroundColor: "#28c04c" }}
              onClick={openRule}
            >
              How to play ?
            </Button>
          </Container>
        </Container>
      ) : (
        <GridList
          cellHeight={70}
          cellWidth={70}
          className={classes.gridList}
          cols={5}
          style={{ paddingLeft: "10px", paddingRight: "10px" }}
        >
          {cards.map((tile) => (
            <GridListTile key={tile.id} cols={tile.cols || 1}>
              <div
                style={{
                  width: " 70px",
                  height: " 70px",
                  backgroundImage: tile.open
                    ? tile.type === "bomb"
                      ? `url(${BombImage})`
                      : `url(${CoinImage})`
                    : `url(${CardImage})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: tile.open ? "50px" : "70px",
                  backgroundPosition: "center",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: '5px',
                
                  fontSize: '12px',
                  fontWeight: 'bold'
                  // color: 'green',
                  // margin: '20px',
                  // borderRadius: '4px',
                  // textAlign: 'center',
                  // padding: '20px'
                }}
                onClick={() =>
                  session.gameStatus === 1
                    ? !tile.open
                      ? handleCardClick(tile)
                      : null
                    : null
                }
              >{session.gameStatus === 1 ? tile.open ? tile.first ? (session.amount + (tile.reward - session.amount)).toFixed(2) :((tile.reward - session.amount)??0).toFixed(2) : '': ''}</div>
              
            </GridListTile>
          ))}
        </GridList>
      )}

      <Container style={{ height: "50px" }}></Container>

      <Grid item>
        {session.gameStatus === 1 ? (
          <Container style={{ paddingTop: "10px" }}>
            <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
            >
              <Grid item>
                <Button
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontSize: "20px",
                    width: "100%",
                  }}
                  onClick={stopGame}
                >
                  Cashout ₹{session.current.toFixed(2)}
                </Button>
              </Grid>
            </Grid>
          </Container>
        ) : (
          <div
            style={{
              backgroundColor: "#d3ede8",
              margin: "10px",
              borderRadius: "10px",
              paddingBottom: "10px",
            }}
          >
            <Container style={{ paddingTop: "10px", paddingBottom: "10px" }}>
              <Container style={{ paddingBottom: "20px" }}>
                <Box sx={{ minWidth: 120 }}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Mines</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={mines}
                      label="Mines"
                      onChange={handleChange}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                      <MenuItem value={4}>4</MenuItem>
                      <MenuItem value={5}>5</MenuItem>
                     
                    </Select>
                  </FormControl>
                </Box>
              </Container>

              <Grid
                spacing={1}
                container
                direction="row"
                justify="space-evenly"
                alignItems="center"
              >
                <Grid item xs={2}>
                  <Typography style={{ fontSize: "14px" }}>
                    Contract Money
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.selectedNumber === 10 ? "grey" : "#D8D8D8",
                      width: "100%",
                    }}
                    onClick={handleNumber(10)}
                  >
                    10
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.selectedNumber === 100 ? "grey" : "#D8D8D8",
                      width: "100%",
                    }}
                    onClick={handleNumber(100)}
                  >
                    100
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.selectedNumber === 1000 ? "grey" : "#D8D8D8",
                      width: "100%",
                    }}
                    onClick={handleNumber(1000)}
                  >
                    1000
                  </Button>
                </Grid>
                <Grid item xs={2}>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.selectedNumber === 10000
                          ? "grey"
                          : "#D8D8D8",
                      width: "100%",
                    }}
                    onClick={handleNumber(10000)}
                  >
                    10000
                  </Button>
                </Grid>
              </Grid>
            </Container>
            <Container style={{ paddingTop: "10px", paddingBottom: "10px" }}>
              <Grid
                container
                direction="row"
                justify="space-evenly"
                alignItems="center"
              >
                <Grid item>
                  <Typography>Number</Typography>
                </Grid>
                <Grid item>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.multiNumber === 3 ? "grey" : "#D8D8D8",
                    }}
                    onClick={handleMulti(3)}
                  >
                    3
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.multiNumber === 5 ? "grey" : "#D8D8D8",
                    }}
                    onClick={handleMulti(5)}
                  >
                    5
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    style={{
                      backgroundColor:
                        showNumber.multiNumber === 10 ? "grey" : "#D8D8D8",
                    }}
                    onClick={handleMulti(10)}
                  >
                    10
                  </Button>
                </Grid>
              </Grid>
            </Container>
            <Container style={{ paddingTop: "10px" }}>
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
              >
                <Grid item>
                  <Button onClick={decShowNumber}>-</Button>
                </Grid>
                <Grid item>
                  <Typography>{showNumber.multiNumber}</Typography>
                </Grid>
                <Grid item>
                  <Button onClick={incShowNumber}>+</Button>
                </Grid>
                <Grid item>
                  <Button
                   
                    style={{
                      backgroundColor: "#05c0b8",
                      color: "white",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontSize: "20px",
                      width: "100%",
                    }}
                   onClick={startGame}
                    
                  >
                    Start Game with ₹
                    {showNumber.selectedNumber * showNumber.multiNumber}
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </div>
        )}
        

        <Container style={{ paddingTop: "20px", paddingBottom: "80px" }}>
          <Grid container direction="row" justify="space-between">
            <Grid item>
              <Typography>Play History</Typography>
            </Grid>
            <Link
              to={`/mines/playhistory`}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Grid item>
                <Typography style={{ color: "grey" }}>more ›</Typography>
              </Grid>
            </Link>
          </Grid>
          <PlayHistory bidHistory={bidHistory} />
        </Container>
      </Grid>
      

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
        open={gameDialog.open}
        onClose={gameDialogClose}
        PaperProps={{
          style: {
            backgroundColor: "white",
            boxShadow: "none",
          },
        }}
      >
        <Container
          style={{ backgroundColor: "white" }}
        >
          <Typography align="center" style={{fontSize: '25px', fontWeight: 'bold', paddingTop: "20px", color: gameDialog.body.title === 'LOSS' ? 'red' : "green" }}>{gameDialog.body.title}</Typography>
          <Typography style={{ paddingTop: "30px",paddingBottom: '20px', color: "black" }}>
            {gameDialog.body.body}
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

export default MinesGamePage;
