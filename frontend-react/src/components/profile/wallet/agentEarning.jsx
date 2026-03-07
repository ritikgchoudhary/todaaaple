import React, { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Table,
  TableRow,
  Container,
  TableCell,
  TableHead,
  TableBody,
  Dialog,
  CircularProgress,
  Button,
  Paper,
} from "@material-ui/core/";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import * as api from "../../../api/auth";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
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
  statCard: {
    padding: '15px',
    borderRadius: '15px',
    border: '1px solid #E2E8F0',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
}));

const AgentEarning = () => {
  const classes = useStyles();
  const history = useHistory();
  const URL = api.url;
  const [stats, setStats] = useState({
    total: 0,
    direct: 0,
    kyc: 0,
    withdrawal: 0,
    upgrade: 0
  });
  const [logs, setLogs] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = "Bearer ".concat(foundUser.token);
      axios
        .get(`${URL}/user/affiliate/stats/${foundUser.result.id}`, {
          headers: { Authorization: AuthStr },
        })
        .then((response) => {
          if (response.data.success) {
            const data = response.data.data;
            const statsMap = {};
            data.stats.forEach(s => statsMap[s._id] = s.total);

            setStats({
              direct: (statsMap['Direct Registration'] || 0) + (statsMap['Level 2 Registration'] || 0),
              kyc: statsMap['KYC'] || 0,
              withdrawal: statsMap['Withdrawal Fee'] || 0,
              upgrade: statsMap['Upgrade'] || 0,
              total: data.stats.reduce((acc, curr) => acc + curr.total, 0)
            });
            setBalance(data.withdrawableBalance);
            setLogs(data.recentLogs);
          }
          setLoader(false);
        })
        .catch((error) => {
          console.error("Error fetching affiliate stats:", error);
          setLoader(false);
        });
    } else {
      history.push("/login");
    }
  }, [URL, history]);

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <Dialog open={loader} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
          <Container align="center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', height: '100px', width: '100px', borderRadius: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress style={{ color: 'white' }} />
            <Typography style={{ paddingTop: '10px', color: "white", fontSize: '12px' }}>Loading...</Typography>
          </Container>
        </Dialog>

        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={history.goBack} />
          <Typography className={classes.headerTitle}>Affiliate Dashboard</Typography>
        </div>

        <div style={{ padding: '20px' }}>
          <Paper elevation={0} style={{
            padding: '25px',
            background: 'linear-gradient(135deg, #05c0b8 0%, #039691 100%)',
            color: 'white',
            borderRadius: '20px',
            marginBottom: '25px',
            boxShadow: '0 10px 20px rgba(5, 192, 184, 0.2)'
          }}>
            <Typography variant="body2" style={{ opacity: 0.9 }}>Withdrawable Balance</Typography>
            <Typography variant="h3" style={{ fontWeight: 800, margin: '10px 0' }}>₹ {balance.toFixed(2)}</Typography>
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <Typography variant="caption" style={{ opacity: 0.8, display: 'block' }}>Total Affiliate Income</Typography>
              <Typography variant="h6" style={{ fontWeight: 600 }}>₹ {stats.total.toFixed(2)}</Typography>
            </div>
          </Paper>

          <Typography variant="subtitle1" style={{ fontWeight: 700, marginBottom: '15px', color: '#1E293B' }}>Income Breakdown</Typography>
          <Grid container spacing={2} style={{ marginBottom: '30px' }}>
            {[
              { label: 'Direct Registration', value: stats.direct, color: '#3B82F6', icon: '👤' },
              { label: 'KYC Income', value: stats.kyc, color: '#10B981', icon: '✅' },
              { label: 'Withdrawal Fee', value: stats.withdrawal, color: '#F59E0B', icon: '💸' },
              { label: 'Upgrade Income', value: stats.upgrade, color: '#8B5CF6', icon: '🚀' }
            ].map((item, idx) => (
              <Grid item xs={6} key={idx}>
                <div className={classes.statCard}>
                  <span style={{ fontSize: '20px', marginBottom: '5px' }}>{item.icon}</span>
                  <Typography variant="caption" style={{ color: '#64748B', fontWeight: 500 }}>{item.label}</Typography>
                  <Typography variant="h6" style={{ color: item.color, fontWeight: 700 }}>₹{item.value.toFixed(2)}</Typography>
                </div>
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle1" style={{ fontWeight: 700, marginBottom: '15px', color: '#1E293B' }}>Recent Earnings</Typography>

          {logs.length === 0 ? (
            <Paper elevation={0} style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: '15px' }}>
              <Typography color="textSecondary">No commission records yet</Typography>
            </Paper>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: 700, color: '#64748B' }}>USER / ID</TableCell>
                  <TableCell style={{ fontWeight: 700, color: '#64748B' }}>TYPE</TableCell>
                  <TableCell align="right" style={{ fontWeight: 700, color: '#64748B' }}>COMM.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, idx) => (
                  <TableRow key={idx}>
                    <TableCell style={{ padding: '12px 10px' }}>
                      <Typography variant="body2" style={{ fontWeight: 600, color: '#1E293B' }}>{log.fromUserName}</Typography>
                      <Typography variant="caption" style={{ color: '#94A3B8' }}>{log.transactionId}</Typography>
                    </TableCell>
                    <TableCell style={{ padding: '12px 10px' }}>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>{log.type}</span>
                      <Typography variant="caption" display="block" style={{ color: '#94A3B8', marginTop: '4px' }}>
                        {new Date(log.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" style={{ padding: '12px 10px' }}>
                      <Typography style={{ color: '#10B981', fontWeight: 700 }}>+₹{log.amount}</Typography>
                      <Typography variant="caption" style={{ color: '#94A3B8' }}>Base: ₹{log.baseAmount}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentEarning;
