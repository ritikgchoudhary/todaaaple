import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Paper,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Fade,
  TextField
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import HistoryIcon from '@material-ui/icons/History';
import FilterListIcon from '@material-ui/icons/FilterList';
import DateRangeIcon from '@material-ui/icons/DateRange';
import { useHistory } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';

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
    marginRight: '20px' // offset for back button
  },
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
  },
  tableContainer: {
    marginTop: '10px',
    paddingLeft: '10px',
    paddingRight: '10px'
  },
  statusChip: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  dateButton: {
    margin: '2px',
    fontSize: '10px',
    padding: '4px 8px',
    minWidth: 'auto'
  }
}));

const OfferHistory = () => {
  const classes = useStyles();
  const history = useHistory();
  const URL = api.url;
  const { user, loading: authLoading } = useAuth();
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ open: false, message: '' });

  // Filter states
  const [category, setCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish checking
    if (!user) return; // Auth hook will handle redirect if not logged in

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const AuthStr = 'Bearer '.concat(user.token);
        const response = await axios.get(
          `${URL}/getOfferTransactions/${user.result.id}`,
          { headers: { Authorization: AuthStr } }
        );
        setAllTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (error) {
        setError({ open: true, message: 'Failed to load transactions' });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, authLoading]);

  useEffect(() => {
    // Apply filters when filter states change
    applyFilters();
  }, [category, dateFilter, startDate, endDate, allTransactions]);

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleDateFilterChange = (filter) => {
    if (filter === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setDateFilter(filter);
    }
  };

  const applyCustomDateFilter = () => {
    if (startDate && endDate) {
      setDateFilter('custom');
      setShowCustomDatePicker(false);
    }
  };

  const applyFilters = () => {
    let result = [...allTransactions];

    // Apply category filter
    if (category !== 'all') {
      result = result.filter(transaction =>
        transaction.type && transaction.type.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      lastMonthEnd.setHours(23, 59, 59, 999);

      switch (dateFilter) {
        case 'today':
          result = result.filter(transaction => {
            const txDate = new Date(transaction.date);
            return txDate >= today;
          });
          break;

        case 'yesterday':
          result = result.filter(transaction => {
            const txDate = new Date(transaction.date);
            return txDate >= yesterday && txDate < today;
          });
          break;

        case 'thisWeek':
          result = result.filter(transaction => {
            const txDate = new Date(transaction.date);
            return txDate >= thisWeekStart;
          });
          break;

        case 'thisMonth':
          result = result.filter(transaction => {
            const txDate = new Date(transaction.date);
            return txDate >= thisMonthStart;
          });
          break;

        case 'lastMonth':
          result = result.filter(transaction => {
            const txDate = new Date(transaction.date);
            return txDate >= lastMonthStart && txDate <= lastMonthEnd;
          });
          break;

        case 'custom':
          if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);

            result = result.filter(transaction => {
              const txDate = new Date(transaction.date);
              return txDate >= startDateTime && txDate <= endDateTime;
            });
          }
          break;

        default:
          break;
      }
    }

    setFilteredTransactions(result);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { background: '#e8f5e9', color: '#2e7d32' };
      case 'pending':
        return { background: '#fff3e0', color: '#ef6c00' };
      case 'failed':
        return { background: '#ffebee', color: '#c62828' };
      default:
        return { background: '#f5f5f5', color: '#616161' };
    }
  };

  const resetFilters = () => {
    setCategory('all');
    setDateFilter('all');
    setShowCustomDatePicker(false);
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        {/* Header */}
        <div className={classes.header}>
          <ArrowBackIosIcon style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }} onClick={history.goBack} />
          <Typography className={classes.headerTitle}>Offer History</Typography>
        </div>

        {/* Filters */}
        <Paper className={classes.filterContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={1}>
                <FilterListIcon style={{ color: '#05c0b8', marginRight: 8 }} />
                <Typography style={{ color: 'black', fontWeight: 500 }}>
                  Filter Transactions
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category-select"
                  value={category}
                  onChange={handleCategoryChange}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="salary">Salary</MenuItem>
                  <MenuItem value="invitation">Invitation</MenuItem>
                  <MenuItem value="recharge">Recharge</MenuItem>
                  <MenuItem value="referral">Referral</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={1}>
                <DateRangeIcon style={{ color: '#05c0b8', marginRight: 8 }} />
                <Typography style={{ color: 'black', fontWeight: 500 }}>
                  Date Range
                </Typography>
              </Box>

              <Box display="flex" flexWrap="wrap">
                <Button
                  variant={dateFilter === 'all' ? "contained" : "outlined"}
                  className={classes.dateButton}
                  style={dateFilter === 'all' ? { backgroundColor: '#05c0b8', color: 'white' } : {}}
                  onClick={() => handleDateFilterChange('all')}
                >
                  All
                </Button>
                <Button
                  variant={dateFilter === 'today' ? "contained" : "outlined"}
                  className={classes.dateButton}
                  style={dateFilter === 'today' ? { backgroundColor: '#05c0b8', color: 'white' } : {}}
                  onClick={() => handleDateFilterChange('today')}
                >
                  Today
                </Button>
                <Button
                  variant={dateFilter === 'yesterday' ? "contained" : "outlined"}
                  className={classes.dateButton}
                  style={dateFilter === 'yesterday' ? { backgroundColor: '#05c0b8', color: 'white' } : {}}
                  onClick={() => handleDateFilterChange('yesterday')}
                >
                  Yesterday
                </Button>
                <Button
                  variant={dateFilter === 'thisWeek' ? "contained" : "outlined"}
                  className={classes.dateButton}
                  style={dateFilter === 'thisWeek' ? { backgroundColor: '#05c0b8', color: 'white' } : {}}
                  onClick={() => handleDateFilterChange('thisWeek')}
                >
                  Week
                </Button>
                <Button
                  variant={dateFilter === 'thisMonth' ? "contained" : "outlined"}
                  className={classes.dateButton}
                  style={dateFilter === 'thisMonth' ? { backgroundColor: '#05c0b8', color: 'white' } : {}}
                  onClick={() => handleDateFilterChange('thisMonth')}
                >
                  Month
                </Button>
                <Button
                  variant={dateFilter === 'custom' ? "contained" : "outlined"}
                  className={classes.dateButton}
                  style={dateFilter === 'custom' ? { backgroundColor: '#05c0b8', color: 'white' } : {}}
                  onClick={() => handleDateFilterChange('custom')}
                >
                  Custom
                </Button>
              </Box>
            </Grid>

            {showCustomDatePicker && (
              <Grid item xs={12}>
                <Fade in={showCustomDatePicker}>
                  <Box p={1} bgcolor="#f5f5f5" borderRadius={1}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Start"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="End"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          style={{ backgroundColor: '#05c0b8', color: 'white' }}
                          onClick={applyCustomDateFilter}
                          disabled={!startDate || !endDate}
                        >
                          Apply Range
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Transactions list */}
        <Container className={classes.tableContainer}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, index) => (
              <Paper key={index} style={{ marginBottom: '10px', padding: '15px', borderRadius: '10px' }}>
                <Grid container alignItems="center" justify="space-between">
                  <Grid item xs={8}>
                    <Typography variant="body1" style={{ fontWeight: 'bold', color: '#333' }}>
                      {transaction.type}
                    </Typography>
                    <Typography variant="caption" style={{ color: '#666' }}>
                      {new Date(transaction.date).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} style={{ textAlign: 'right' }}>
                    <Typography variant="body1" style={{ fontWeight: 'bold', color: '#05c0b8' }}>
                      ₹ {transaction.amount}
                    </Typography>
                    <span style={getStatusColor(transaction.status)} className={classes.statusChip}>
                      {transaction.status}
                    </span>
                  </Grid>
                </Grid>
              </Paper>
            ))
          ) : (
            <Paper style={{ padding: '30px', textAlign: 'center' }}>
              <Typography color="textSecondary">
                No transactions found.
              </Typography>
            </Paper>
          )}
        </Container>

        {/* Loading Dialog */}
        <Dialog
          open={loading}
          PaperProps={{
            style: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
          }}
        >
          <Container align="center" style={{ backgroundColor: 'black', opacity: '0.6', height: '100px', paddingTop: "10px", borderRadius: 10 }}>
            <CircularProgress style={{ color: 'white' }} />
            <Typography style={{ paddingTop: '10px', color: "white" }}>Loading...</Typography>
          </Container>
        </Dialog>

        {/* Error Dialog */}
        <Dialog
          open={error.open}
          onClose={() => setError({ ...error, open: false })}
          PaperProps={{
            style: {
              borderRadius: '12px',
              padding: '20px',
            },
          }}
        >
          <Typography align="center" style={{ color: 'black' }}>
            {error.message}
          </Typography>
        </Dialog>
      </div>
    </div>
  );
};

export default OfferHistory;