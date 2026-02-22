import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Container,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Paper,
  Box
} from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Link, useHistory } from "react-router-dom";
import * as api from "../../api/auth";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F5F9",
    display: "flex",
    justifyContent: "center",
    paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
  },
  frame: {
    width: "100%",
    maxWidth: 500,
    minHeight: "100vh",
    backgroundColor: "#fff",
    position: 'relative',
    paddingBottom: '20px'
  },
  header: {
    backgroundColor: '#05c0b8',
    padding: '15px 20px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerTitle: {
    color: 'white',
    flexGrow: 1,
    textAlign: 'center',
    fontWeight: 600,
    marginRight: '20px'
  },
  bonusCard: {
    backgroundColor: '#05c0b8',
    color: 'white',
    padding: '20px',
    borderRadius: '15px',
    margin: '20px',
    boxShadow: '0 4px 10px rgba(5, 192, 184, 0.3)'
  },
  section: {
    margin: '0 20px 20px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  levelBtn: {
    textTransform: 'none',
    fontWeight: 'bold',
    borderRadius: '8px',
    padding: '8px 5px',
    fontSize: '12px'
  },
  actionChip: {
    backgroundColor: 'white',
    color: '#05c0b8',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#f5f5f5'
    }
  }
}));

const MyPromotion = () => {
  const classes = useStyles();
  const [isAuth, setAuth] = useState(false);
  const history = useHistory();
  const URL = api.url;
  const [members, setMembers] = React.useState({
    level0: { active: 0, total: 0 },
    level1: { active: 0, total: 0 },
    level2: { active: 0, total: 0 },
    level3: { active: 0, total: 0 },
    level4: { active: 0, total: 0 },
    level5: { active: 0, total: 0 },
    level6: { active: 0, total: 0 },
  });
  const [openDialog, setDialog] = React.useState({ open: false, body: "" });
  const [openDialogBonus, setDialogBonus] = React.useState({ open: false, body: "" });

  const [ruleDialog, setRuleDialog] = React.useState(false);

  const [levelData, setLevelData] = React.useState({});
  const [loader, setLoader] = React.useState(false);
  const [user, setUser] = useState([{ bonus: 0.0 }]);
  const [level, setLevel] = React.useState(0);

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
        setDialogBonus({ open: true, body: response.data })
      })
      .catch((error) => {
        setLoader(false);
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
        .catch((error) => { });
      axios
        .get(`${URL}/getUser/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setUser(response.data);
          setLoader(false);
          if (response.data[0].block) {
            // handle block
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

  const handleLevel = (newLevel) => (event) => {
    setLevel(newLevel);
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={() => history.push('../profile')} />
          <Typography className={classes.headerTitle}>My Promotion</Typography>
        </div>

        <Dialog
          open={openDialogBonus.open}
          onClose={dialogCloseBonus}
          PaperProps={{
            style: {
              boxShadow: 'none',
              borderRadius: '10px'
            },
          }}
        >
          <Container style={{ padding: '20px' }}>
            <Typography style={{ color: "black", textAlign: 'center' }}>{openDialogBonus.body}</Typography>
          </Container>
        </Dialog>

        <Dialog
          open={ruleDialog}
          onClose={ruleClose}
          fullWidth
          maxWidth="xs"
        >
          <DialogContent>
            <Typography align="center" style={{ fontSize: '18px', fontWeight: 'bold', paddingBottom: '10px', color: '#05c0b8' }}>
              Bonus Rules
            </Typography>
            <Typography align="left" style={{ fontSize: '14px', color: '#333' }}>
              If level 1 contribution reaches 10,000 and above you will get 25% extra bonus.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={ruleClose} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Bonus Card */}
        <div className={classes.bonusCard}>
          <Grid container direction="row" justify="space-between" alignItems="center">
            <Grid item>
              <Typography style={{ fontSize: "28px", fontWeight: 'bold' }}>
                ₹ {user && user[0].bonus ? user[0].bonus.toFixed(2) : '0.00'}
              </Typography>
              <Typography style={{ fontSize: "14px", opacity: 0.9 }}>
                My Bonus
              </Typography>
            </Grid>
            <Grid item>
              <Link to="/mypromotion/apply" style={{ textDecoration: "none" }}>
                <Chip label="Apply to Balance" className={classes.actionChip} />
              </Link>
            </Grid>
          </Grid>
        </div>

        {/* Action Links */}
        <Paper className={classes.section} style={{ padding: '10px' }}>
          <Grid container justify="space-around" spacing={2}>
            <Grid item>
              <Link to="/applyRecord" style={{ textDecoration: "none", color: "#333", fontSize: '14px', fontWeight: 'bold' }}>
                Apply Record
              </Link>
            </Grid>
            <Grid item>
              <span style={{ color: '#ddd' }}>|</span>
            </Grid>
            <Grid item>
              <Link to="/invite" style={{ textDecoration: "none", color: "#333", fontSize: '14px', fontWeight: 'bold' }}>
                Invite Friends
              </Link>
            </Grid>
          </Grid>
        </Paper>

        {/* Members Stats */}
        <Paper className={classes.section}>
          <Grid container justify="space-between" alignItems="flex-end" style={{ marginBottom: '15px' }}>
            <Grid item>
              <Typography style={{ color: "#05c0b8", fontSize: "16px", fontWeight: 'bold' }}>
                Team Data
              </Typography>
            </Grid>
            <Grid item>
              <Typography style={{ fontSize: "12px", color: '#666' }}>
                Active Today: <span style={{ color: '#05c0b8', fontWeight: 'bold' }}>{members[`level${level}`] ? members[`level${level}`]["active"] : 0}</span>
              </Typography>
            </Grid>
          </Grid>

          {/* Level Selector */}
          <Grid container spacing={1} style={{ marginBottom: '20px' }}>
            {[...Array(7)].map((_, index) => (
              <Grid item xs={3} key={index}>
                <Button
                  fullWidth
                  className={classes.levelBtn}
                  onClick={handleLevel(index)}
                  style={{
                    backgroundColor: level === index ? '#05c0b8' : '#f5f5f5',
                    color: level === index ? 'white' : '#666',
                  }}
                >
                  Level {index + 1}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={0} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                <Typography style={{ color: "grey", fontSize: "12px" }}>
                  Total People
                </Typography>
                <Typography style={{ fontSize: "18px", fontWeight: 'bold', color: '#333' }}>
                  {members[`level${level}`] ? members[`level${level}`]["total"] : 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                <Typography style={{ color: "grey", fontSize: "12px" }}>
                  Contribution
                </Typography>
                <Typography style={{ fontSize: "18px", fontWeight: 'bold', color: '#333' }}>
                  ₹
                  {user && user[0][`level${level}contribution`]
                    ? user[0][`level${level}contribution`].toFixed(2)
                    : "0"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {level === 0 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                style={{ backgroundColor: '#05c0b8', color: 'white', marginRight: '10px', textTransform: 'none' }}
                onClick={handleClaimBonus}
              >
                Claim Bonus
              </Button>
              <Button
                variant="outlined"
                style={{ borderColor: '#05c0b8', color: '#05c0b8', textTransform: 'none' }}
                onClick={setDialogHow}
              >
                How?
              </Button>
            </div>
          )}
        </Paper>

        {/* View Details Links */}
        <div style={{ padding: '0 20px' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Link to={`/promotionRecord/${user[0].id}`} style={{ textDecoration: "none" }}>
                <Button fullWidth variant="contained" style={{ backgroundColor: '#333', color: 'white', textTransform: 'none' }}>
                  View All Members
                </Button>
              </Link>
            </Grid>
            <Grid item xs={6}>
              <Link to={`/promotionRecordNew/${user[0].id}`} style={{ textDecoration: "none" }}>
                <Button fullWidth variant="outlined" style={{ borderColor: '#333', color: '#333', textTransform: 'none' }}>
                  View Today's
                </Button>
              </Link>
            </Grid>
          </Grid>
        </div>


        {/* Loading Overlay */}
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
              width: "100px",
              paddingTop: "10px",
              borderRadius: '10px'
            }}
          >
            <CircularProgress style={{ color: "white" }} />
            <Typography style={{ paddingTop: "10px", color: "white", fontSize: '12px' }}>
              Please Wait...
            </Typography>
          </Container>
        </Dialog>
      </div>
    </div>
  );
};

export default MyPromotion;
