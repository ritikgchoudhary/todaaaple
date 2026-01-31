import React, {useState, useEffect} from "react";
import {  Grid, Typography, List, ListItem,Container,Paper,Tabs,Tab,Box} from "@material-ui/core";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import * as api from "../../../api/auth";

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

const WithdrawalHistory = () => {
    const history = useHistory();
    const [record, setRecord] = useState([]);
    const URL =  api.url;
    const [level, setLevel] = React.useState('Success');
    const [tabValue, setTabValue] = useState(0);
    
    const handleLevel = (level) => async (event) => {
        setLevel(level);
    };

    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
      if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      const AuthStr = 'Bearer '.concat(foundUser.token); 
      axios.get(`${URL}/getWithdrawal/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          // Ensure we always set an array
          setRecord(Array.isArray(response.data) ? response.data : []);
    })
      .catch((error) => {
        console.log(error);
        setRecord([]); // Set empty array on error
        history.push('/login');
    });
      

         
    }else{
      window.location.replace("/login");

    }
    
  }, []); 

    // Filter records by type
    const getINRRecords = () => {
      if (!record || !Array.isArray(record)) return [];
      return record.filter(item => !item.usdt);
    };

    const getUSDTRecords = () => {
      if (!record || !Array.isArray(record)) return [];
      return record.filter(item => item.usdt);
    };

    const renderWithdrawalList = (records, isUSDT = false) => {
      if (!records || records.length === 0) {
        return (
          <Paper style={{margin: '10px', padding: '20px', textAlign: 'center'}}>
            <Typography style={{color: '#666'}}>
              No {isUSDT ? 'USDT' : 'INR'} withdrawal history found
            </Typography>
          </Paper>
        );
      }

      return records.map((recordItem, index) => {
        const shouldShow = recordItem.status === level || 
                          (level === 'Other' && recordItem.status !== 'Success' && recordItem.status !== 'Placed');
        
        if (!shouldShow) return null;

        return (
          <List component="nav" aria-label="main mailbox folders" key={index}>
            <ListItem>
              <Grid
                container
                alignItems="center"
                justify="space-between"
                direction="row"
              >
                <Grid item xs={5}>
                  <Typography style={{fontSize:'10px'}}>{new Date(recordItem.date).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={3}>
                  {isUSDT ? (
                    <>
                      <Typography style={{fontWeight: "bold", color: '#f39c12'}}>
                        {recordItem.usdt} USDT
                      </Typography>
                      <Typography style={{fontSize: '10px', color: '#666'}}>
                        ₹{recordItem.amount}
                      </Typography>
                      {recordItem.fee && (
                        <Typography style={{fontSize: '9px', color: '#999'}}>
                          Fee: {recordItem.fee} USDT
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography style={{fontWeight: "bold"}}>₹{recordItem.amount}</Typography>
                  )}
                </Grid>
                <Grid item xs={4}>
                  <Typography style={{color: recordItem.status === 'Success' ? 'green': 'black'}}>
                    {recordItem.status}
                  </Typography>
                  {recordItem.walletAddress && (
                    <Typography style={{fontSize: '8px', color: '#666'}}>
                      {recordItem.walletAddress.substring(0, 10)}...
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </ListItem>
          </List>
        );
      });
    };
   
    
    return (
        <div>
            <Grid container direction="row" justify="" alignItems="center" style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../wallet">
                <ArrowBackIosIcon style={{fontSize:'20px'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" st>Withdrawal Records</Typography>
                 </Grid>
            </Grid>

            {/* Tab Switcher */}
            <Paper style={{margin: '10px', marginBottom: '10px'}}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="INR Withdrawals" />
                <Tab label="USDT Withdrawals" />
              </Tabs>
            </Paper>

            {/* INR Withdrawals Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container direction="row" style={{ padding: "10px" }}>
                <Grid item xs={4} onClick={handleLevel('Success')}>
                  <Container
                    style={{
                      width: "100%",
                      height: "30px",
                      border: "1px solid",
                      borderColor: "#05c0b8",
                      backgroundColor: level === 'Success' ? "#05c0b8" : "white",
                    }}
                  >
                    <Typography
                      align="center"
                      style={{
                        color: level === 'Success'? "white" : "black",
                        paddingTop: "3px",
                      }}
                    >
                      Success
                    </Typography>
                  </Container>
                </Grid>
                <Grid item xs={4} onClick={handleLevel('Placed')}>
                  <Container
                    style={{
                      width: "100%",
                      height: "30px",
                      border: "1px solid",
                      borderColor: "#05c0b8",
                      backgroundColor: level === 'Placed' ? "#05c0b8" : "white",
                    }}
                  >
                    <Typography
                      align="center"
                      style={{
                        color: level === 'Placed' ? "white" : "black",
                        paddingTop: "3px",
                      }}
                    >
                       Placed
                    </Typography>
                  </Container>
                </Grid>
                <Grid item xs={4} onClick={handleLevel('Other')}>
                  <Container
                    style={{
                      width: "100%",
                      height: "30px",
                      border: "1px solid",
                      borderColor: "#05c0b8",
                      backgroundColor: level === 'Other' ? "#05c0b8" : "white",
                    }}
                  >
                    <Typography
                      align="center"
                      style={{
                        color: level === 'Other' ? "white" : "black",
                        paddingTop: "3px",
                      }}
                    >
                      Fail
                    </Typography>
                  </Container>
                </Grid>
              </Grid>
              
              <Grid container direction="row" style={{padding: '10px'}}>
                  <Grid item xs={5}>
                      <Typography style={{fontWeight: 'bold'}}>Date</Typography>
                  </Grid>
                  <Grid item xs={3}>
                      <Typography style={{fontWeight: 'bold'}}>Amount (INR)</Typography>
                  </Grid>
                  <Grid item xs={4}>
                      <Typography style={{fontWeight: 'bold'}}>Status</Typography>
                  </Grid>
              </Grid>
              
              {renderWithdrawalList(getINRRecords(), false)}
            </TabPanel>

            {/* USDT Withdrawals Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container direction="row" style={{ padding: "10px" }}>
                <Grid item xs={4} onClick={handleLevel('Success')}>
                  <Container
                    style={{
                      width: "100%",
                      height: "30px",
                      border: "1px solid",
                      borderColor: "#f39c12",
                      backgroundColor: level === 'Success' ? "#f39c12" : "white",
                    }}
                  >
                    <Typography
                      align="center"
                      style={{
                        color: level === 'Success'? "white" : "black",
                        paddingTop: "3px",
                      }}
                    >
                      Success
                    </Typography>
                  </Container>
                </Grid>
                <Grid item xs={4} onClick={handleLevel('Placed')}>
                  <Container
                    style={{
                      width: "100%",
                      height: "30px",
                      border: "1px solid",
                      borderColor: "#f39c12",
                      backgroundColor: level === 'Placed' ? "#f39c12" : "white",
                    }}
                  >
                    <Typography
                      align="center"
                      style={{
                        color: level === 'Placed' ? "white" : "black",
                        paddingTop: "3px",
                      }}
                    >
                       Placed
                    </Typography>
                  </Container>
                </Grid>
                <Grid item xs={4} onClick={handleLevel('Other')}>
                  <Container
                    style={{
                      width: "100%",
                      height: "30px",
                      border: "1px solid",
                      borderColor: "#f39c12",
                      backgroundColor: level === 'Other' ? "#f39c12" : "white",
                    }}
                  >
                    <Typography
                      align="center"
                      style={{
                        color: level === 'Other' ? "white" : "black",
                        paddingTop: "3px",
                      }}
                    >
                      Fail
                    </Typography>
                  </Container>
                </Grid>
              </Grid>

              <Paper style={{margin: '10px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7'}}>
                <Typography style={{fontSize: '12px', color: '#856404'}}>
                  <strong>Note:</strong> USDT withdrawals are processed to TRC20 wallet addresses
                </Typography>
              </Paper>
              
              <Grid container direction="row" style={{padding: '10px'}}>
                  <Grid item xs={5}>
                      <Typography style={{fontWeight: 'bold'}}>Date</Typography>
                  </Grid>
                  <Grid item xs={3}>
                      <Typography style={{fontWeight: 'bold'}}>Amount (USDT)</Typography>
                  </Grid>
                  <Grid item xs={4}>
                      <Typography style={{fontWeight: 'bold'}}>Status</Typography>
                  </Grid>
              </Grid>
              
              {renderWithdrawalList(getUSDTRecords(), true)}
            </TabPanel>
            
        </div>
    )
}

export default WithdrawalHistory;
