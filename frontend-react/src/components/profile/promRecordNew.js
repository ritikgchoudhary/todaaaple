import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  CircularProgress,
  Box,
  Button,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";
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
  levelBtn: {
    border: '1px solid #05c0b8',
    borderRadius: '8px',
    padding: '8px',
    textTransform: 'none',
    transition: 'all 0.3s ease',
    fontSize: '13px'
  }
}));

const PromotionRecordNew = () => {
  const classes = useStyles();
  const history = useHistory();
  const URL = api.url;
  const [levelDataNew, setLevelDataNew] = useState({});
  const [loader, setLoader] = React.useState(false);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    setLoader(true);
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/getPromotionNew/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          setLevelDataNew(response.data);
          setLoader(false);
        })
        .catch((error) => {
          console.error(error);
          history.push("/login");
        });
    } else {
      history.push("/login");
    }
  }, []);

  const handleLevel = (level) => (event) => {
    setLevel(level);
  };

  const getLevelData = (levelNum, phone, field) => {
    try {
      if (field === 'bidToday') {
        return levelDataNew?.[`level${levelNum}`]?.[phone]?.[field]?.toFixed(2) || "0.00";
      }
      return levelDataNew?.[`level${levelNum}`]?.[phone]?.[field] || 0;
    } catch {
      return field === 'bidToday' ? "0.00" : 0;
    }
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={history.goBack} />
          <Typography className={classes.headerTitle}>Today's Promotion Record</Typography>
        </div>

        <Container style={{ marginBottom: '20px', marginTop: '20px' }}>
          <Typography variant="body2" style={{ color: '#666', marginBottom: '15px', textAlign: 'center' }}>
            Stats for today's invitations
          </Typography>
          <Grid container spacing={1}>
            {[...Array(7)].map((_, index) => (
              <Grid item xs={index === 0 ? 12 : 4} key={index}>
                <Button
                  fullWidth
                  onClick={handleLevel(index)}
                  className={classes.levelBtn}
                  style={{
                    backgroundColor: level === index ? '#05c0b8' : 'transparent',
                    color: level === index ? 'white' : '#05c0b8',
                  }}
                >
                  Level {index + 1}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Container style={{ padding: '0 16px' }}>
          <TableContainer component={Paper} style={{ borderRadius: '10px', boxShadow: 'none', border: '1px solid #eee' }}>
            <Table size="small">
              <TableHead>
                <TableRow style={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell style={{ fontWeight: 'bold', fontSize: '11px' }}>Phone</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '11px' }}>Recharge</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '11px' }}>Withdraw</TableCell>
                  <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '11px' }}>Bid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {levelDataNew && levelDataNew[`level${level}`] &&
                  Object.keys(levelDataNew[`level${level}`]).map((phone) => (
                    <TableRow key={phone}>
                      <TableCell style={{ fontSize: '11px', color: '#333' }}>
                        {phone}
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: '11px', color: 'green' }}>
                        ₹{getLevelData(level, phone, 'todayRecharge')}
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: '11px', color: 'red' }}>
                        ₹{getLevelData(level, phone, 'todayWithdrawal')}
                      </TableCell>
                      <TableCell align="center" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                        ₹{getLevelData(level, phone, 'bidToday')}
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </Container>

        <Dialog
          open={loader}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container align="center" style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '15px'
          }}>
            <CircularProgress style={{ color: 'white' }} />
            <Typography style={{
              paddingTop: '15px',
              color: "white",
              fontSize: '13px'
            }}>
              Loading...
            </Typography>
          </Container>
        </Dialog>
      </div>
    </div>
  );
};

export default PromotionRecordNew;
