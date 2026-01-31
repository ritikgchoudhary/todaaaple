import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Container,
  Chip,
  List,
  ListItem,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Link } from "react-router-dom";
import * as api from "../../api/auth";
import axios from "axios";
import { useHistory } from "react-router-dom";

const MyPromotion = () => {
  const [isAuth, setAuth] = useState(false);
  const history = useHistory();
  const URL = api.url;
  const [members, setMembers] = React.useState({
    level0: { active: 0, total: 0 },
    level1: { active: 0, total: 0 },
    level2: { active: 0, total: 0 },
  });
  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [openDialogBonus, setDialogBonus] = React.useState({ open: false, body: "" });

  const [ruleDialog, setRuleDialog] = React.useState(false);

  const [levelData, setLevelData] = React.useState({});
  const [loader, setLoader] = React.useState(false);

  const showDialog = (phone) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setLoader(true);
    const AuthStr = "Bearer ".concat(user[0].token);
    axios
      .get(`${URL}/userLevelData/${user[0].id}/${phone}`, {
        headers: { Authorization: AuthStr },
      })
      .then((response) => {
        setLevelData(response.data);
        setLoader(false);
      })
      .catch((error) => {
        console.log(error);
      });
    setDialog({ ...openDialog, open: true });
  };

  const dialogClose = () => {
    setDialog({ ...openDialog, open: false });
  };

  const dialogCloseBonus = () => {
    setDialogBonus({ ...openDialogBonus, open: false });
  };

  const ruleClose = () => {
    setRuleDialog(false);
  };
  

  const setDialogHow = (e) => {
    e.preventDefault();
    setRuleDialog(true)
  }

  const handleClaimBonus = (e) => {
    e.preventDefault();
    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    const foundUser = JSON.parse(loggedInUser);
      
      const AuthStr = "Bearer ".concat(foundUser.token);
    
    axios
    .get(`${URL}/claimContriBonus/${foundUser.result.id}`, {
      headers: { Authorization: AuthStr },
    })
    .then((response) => {
      setLoader(false);
      setDialogBonus({open: true, body: response.data})
      
      
    })
    .catch((error) => {
      
      
    });
  }

  useEffect(() => {
    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getPromotionMembers/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setMembers(response.data)
        })
        .catch((error) => {});
      axios
        .get(`${URL}/getUser/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setUser(response.data);
          setLoader(false);
          if (response.data[0].block) {
          }
        })
        .catch((error) => {
          console.log(error);
          history.push("/login");
        });
    } else {
      history.push("/login");
    }
  }, []);
  const [user, setUser] = useState([{ bonus: 0.0 }]);

  const [level, setLevel] = React.useState(0);
  const handleLevel = (level) => async (event) => {
    setLevel(level);
  };
  return (
    <div style={{ backgroundColor: "#f2f2f2", minHeight: "100vh" }}>
      <Dialog
                    open={openDialogBonus.open}
                    onClose={dialogCloseBonus}
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
                <Typography style={{padding: '10px', color: "black" }}>{openDialogBonus.body}</Typography>
                </Container>
                
                
              </Dialog>
       <Dialog
        open={ruleDialog}
        onClose={ruleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        
      >
       
        <DialogContent>
        <Typography align="center" style={{ fontSize: '20px',fontWeight: 'bold',paddingBottom: '20px'}}>How to Claim Contibution Bonus</Typography>
       
          <Typography align="left" style={{ fontSize: '16px',fontWeight: 'bold',paddingBottom: '20px',paddingTop: '20px'}}>If level 1 contribution reaches 10,000 and above you will get 25% extra bonus.</Typography>
           </DialogContent>
       
      </Dialog>
      <Grid
        container
        direction="row"
        justify=""
        alignItems="center"
        style={{
          paddingLeft: "20px",
          paddingTop: "15px",
          paddingBottom: "15px",
          paddingRight: "20px",
          backgroundColor: "white",
        }}
      >
        <Grid item xs={4}>
          <Link to="../profile">
            <ArrowBackIosIcon style={{ fontSize: "20px" }} />
          </Link>
        </Grid>
        <Grid item xs={4}>
          <Typography align="center" st>
            My Promotion
          </Typography>
        </Grid>
      </Grid>
      <Container style={{ backgroundColor: "#00b8a9", height: "100px" }}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item style={{ paddingTop: "20px" }}>
            <Typography style={{ color: "white", fontSize: "28px" }}>
              ₹ {user && user[0].bonus.toFixed(2)}
            </Typography>
            <Typography style={{ color: "white", fontSize: "16px" }}>
              My Bonus
            </Typography>
          </Grid>

          <Grid item style={{ paddingTop: "20px" }}>
            <Link
              to="/mypromotion/apply"
              style={{ textDecoration: "none", color: "black" }}
            >
              <Chip
                label="Apply to Balance"
                style={{ backgroundColor: "white", color: "#00b8a9" }}
              ></Chip>
            </Link>
          </Grid>
        </Grid>
      </Container>
      <Container style={{ backgroundColor: "white" }}>
        <Grid
          container
          direction="row"
          justify="space-evenly"
          style={{ padding: "25px" }}
        >
          {/* <Grid item>
                    <Typography>Bonus Record</Typography>
                </Grid> */}
          <Link
            to="/applyRecord"
            style={{ textDecoration: "none", color: "black" }}
          >
            <Grid item>
              <Typography>Apply Record</Typography>
            </Grid>
          </Link>
        </Grid>
      </Container>
      <Container
        style={{ padding: "15px", marginTop: "10px", backgroundColor: "white" }}
      >
        <Grid container direction="row" justify="space-between">
          <Grid item>
            <Typography style={{ color: "#05c0b8" }}>Invite Friends</Typography>
          </Grid>

          <Grid item>
            <Link
              to="/invite"
              style={{ textDecoration: "none", color: "black" }}
            >
              <Chip
                label="Go Now"
                style={{ backgroundColor: "#00b8a9", color: "white" }}
              ></Chip>
            </Link>
          </Grid>
        </Grid>
      </Container>
      <Container
        style={{ backgroundColor: "white", padding: "15px", marginTop: "10px" }}
      >
        <Typography style={{ color: "#05c0b8", fontSize: "18px" }}>
          Active members today:{" "}
          {members[`level${level}`]["active"]}
        </Typography>

        <Grid container spacing={1}>
            {[...Array(7)].map((_, index) => (
              <Grid item xs={index === 0 ? 12 : 6} sm={4} md={3} key={index}>
                <Button
                  fullWidth
                  onClick={handleLevel(index)}
                  style={{
                    backgroundColor: level === index ? '#05c0b8' : 'transparent',
                    border: '1px solid #05c0b8',
                    borderRadius: '8px',
                    padding: '8px',
                    color: level === index ? 'black' : 'black',
                    textTransform: 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Level {index + 1}
                </Button>
              </Grid>
            ))}
          </Grid>
        <Grid container direction="row" style={{ paddingTop: "20px" }}>
          <Grid item xs={6}>
            <Typography style={{ color: "grey", fontSize: "14px" }}>
              Total People
            </Typography>
            <Typography style={{ fontSize: "18px" }}>
              {members[`level${level}`]["total"]}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography style={{ color: "grey", fontSize: "14px" }}>
              Contribution(Rupees)
            </Typography>
            <Typography style={{ fontSize: "18px" }}>
              ₹
              {user && user[0][`level${level}contribution`]
                ? user &&
                  user[0][`level${level}contribution`] &&
                  user[0][`level${level}contribution`].toFixed(2)
                : "0"}
            </Typography>
            {
              level === 0 ?  <Grid container direction="row">
              <Grid item>
              <Chip
                onClick={(e) => handleClaimBonus(e)}
                label="Claim"
                style={{ backgroundColor: "#00b8a9", color: "white" }}
              ></Chip>
              </Grid>
              <Grid item style={{paddingLeft: '5px'}}>
              <Chip
                onClick={(e) => setDialogHow(e)}
                label="How ?"
                style={{ backgroundColor: "grey", color: "white" }}
              ></Chip>
              </Grid>

            </Grid> : <div></div>
            }
           
          
          </Grid>
        </Grid>

      </Container>
      <Container
        style={{ backgroundColor: "white", padding: "15px", marginTop: "10px" }}
      >
        <Grid container direction="row" justifyContent="space-between">
          <Grid item>
            <Link
              to={`/promotionRecord/${user[0].id}`}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Chip
                label="View full members"
                style={{ backgroundColor: "#00b8a9", color: "white" }}
              ></Chip>
            </Link>
          </Grid>
          <Grid item>
            <Link
              to={`/promotionRecordNew/${user[0].id}`}
              style={{ textDecoration: "none", color: "black" }}
            >
              <Chip
                label="View today members"
                style={{ backgroundColor: "#00b8a9", color: "white" }}
              ></Chip>
            </Link>
          </Grid>
        </Grid>
        {
          // user[0][`level${level}`] &&
          //   user[0][`level${level}`].map((member) => (
          //     <List component="nav" aria-label="main mailbox folders">
          //       <ListItem>
          //         <Grid
          //           container
          //           alignItems="center"
          //           justify="space-between"
          //           direction="row"
          //         >
          //           <Grid item>
          //             <Typography variant="p">{member.mobile}</Typography>
          //             {/* <Typography style={{fontSize: 12, color: 'blue'}} onClick={getRecharge(member.phone)}>View Details</Typography> */}
          //           </Grid>
          //           <Grid item>
          //             <Typography variant="p">
          //               {new Date(member.datetime).toLocaleString()}
          //             </Typography>
          //           </Grid>
          //           <Grid item onClick={showDialog(member.mobile)}>
          //             <Typography
          //               variant="p"
          //               style={{ color: "#05c0b8", fontWeight: "bold" }}
          //             >
          //               View Profile
          //             </Typography>
          //           </Grid>
          //         </Grid>
          //       </ListItem>
          //       <Container
          //         style={{
          //           backgroundColor: "grey",
          //           padding: "0.5px",
          //           marginTop: "10px",
          //         }}
          //       ></Container>
          //     </List>
          //   ))
        }
      </Container>
      <Container style={{ height: "50px" }}></Container>
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
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Container style={{ padding: "10px" }}>
            {loader ? (
              <Container
                style={{
                  height: "100px",
                  width: "250px",
                  alignContent: "center",
                }}
              >
                <CircularProgress style={{ color: "grey" }} />
              </Container>
            ) : (
              <Container disableGutters style={{ width: "300px" }}>
                <Typography
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#05c0b8",
                  }}
                >
                  Member Profile
                </Typography>
                <Container style={{ height: "20px" }}></Container>
                <Grid container direction="row">
                  <Grid item xs={10}>
                    <Typography style={{ fontSize: "18px" }}>
                      Live Balance
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{levelData.balance}
                    </Typography>
                  </Grid>
                </Grid>
                <Container
                  style={{
                    backgroundColor: "grey",
                    padding: "0.5px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                ></Container>
                <Grid container justify="space-between" direction="row">
                  <Grid item xs={10}>
                    <Typography style={{ fontSize: "18px" }}>
                      Today Bet
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{levelData.todayBet}
                    </Typography>
                  </Grid>
                </Grid>
                <Container
                  style={{
                    backgroundColor: "grey",
                    padding: "0.5px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                ></Container>
                <Grid container justify="space-between" direction="row">
                  <Grid item xs={10}>
                    <Typography style={{ fontSize: "18px" }}>
                      Today Recharge
                    </Typography>
                    {/* <Typography style={{fontSize: 12, color: 'blue'}} onClick={getRecharge(member.phone)}>View Details</Typography> */}
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      style={{ fontSize: "18px", fontWeight: "bold" }}
                    >
                      ₹{levelData.todayRecharge}
                    </Typography>
                  </Grid>
                </Grid>
                <Container
                  style={{
                    backgroundColor: "grey",
                    padding: "0.5px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                ></Container>
                <Grid container justify="space-between" direction="row">
                  <Grid item xs={10}>
                    <Typography style={{ fontSize: "18px" }}>
                      Last Withdraw
                    </Typography>
                    {/* <Typography style={{fontSize: 12, color: 'blue'}} onClick={getRecharge(member.phone)}>View Details</Typography> */}
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      style={{ fontSize: "18px", fontWeight: "bold" }}
                    >
                      ₹{levelData.todayWithdrawal}
                    </Typography>
                  </Grid>
                </Grid>
                <Container
                  style={{
                    backgroundColor: "grey",
                    padding: "0.5px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                ></Container>
                <Grid container justify="space-between" direction="row">
                  <Grid item xs={10}>
                    <Typography style={{ fontSize: "18px" }}>
                      First Recharge
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                      }}
                    >
                      ₹{levelData.firstRecharge}
                    </Typography>
                  </Grid>
                </Grid>
                <Container
                  style={{
                    backgroundColor: "grey",
                    padding: "0.5px",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                ></Container>
                <Grid container justify="space-between" direction="row">
                  <Grid item xs={10}>
                    <Typography style={{ fontSize: "18px" }}>
                      Total Recharge
                    </Typography>
                    {/* <Typography style={{fontSize: 12, color: 'blue'}} onClick={getRecharge(member.phone)}>View Details</Typography> */}
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      style={{ fontSize: "18px", fontWeight: "bold" }}
                    >
                      ₹{levelData.totalRecharge}
                    </Typography>
                  </Grid>
                </Grid>
              </Container>
            )}
          </Container>
        </DialogContent>
        <DialogActions>
          <Button onClick={dialogClose} color="primary" variant="filled">
            Back
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MyPromotion;
