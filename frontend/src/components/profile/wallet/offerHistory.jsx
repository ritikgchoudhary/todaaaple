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
  root: {
    backgroundColor: 'white',
    minHeight: '100vh',
    paddingBottom: theme.spacing(8)
  },
  header: {
    backgroundColor: '#05c0b8',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  title: {
    color: 'white',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: theme.spacing(1),
      fontSize: 24
    }
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(2),
    '& .MuiTableCell-root': {
      borderBottom: '1px solid rgba(0,0,0,0.1)'
    }
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    '& .MuiTableCell-head': {
      color: '#05c0b8',
      fontWeight: 600,
      fontSize: '0.9rem'
    }
  },
  tableCell: {
    color: 'black',
    fontSize: '0.9rem'
  },
  statusChip: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontWeight: 500,
    fontSize: '0.8rem'
  },
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
  },
  formControl: {
    width: '100%',
    '& .MuiInputBase-root': {
      color: 'black',
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(0,0,0,0.7)',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(0,0,0,0.3)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(0,0,0,0.5)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#05c0b8',
      },
    },
    '& .MuiSelect-icon': {
      color: 'black',
    }
  },
  dateButton: {
    margin: theme.spacing(0.5),
    color: 'black',
    borderColor: 'rgba(0,0,0,0.3)',
    '&.active': {
      backgroundColor: 'rgba(5,192,184,0.1)',
      borderColor: '#05c0b8',
    }
  },
  datePickerContainer: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
    backgroundColor: '#f5f5f5',
    borderRadius: theme.spacing(1)
  },
  datePicker: {
    width: '100%',
    marginBottom: theme.spacing(1),
    '& .MuiInputBase-root': {
      color: 'black',
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(0,0,0,0.7)',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(0,0,0,0.3)',
      },
    },
    '& .MuiIconButton-root': {
      color: 'black',
    }
  },
  noDataMessage: {
    color: 'black',
    textAlign: 'center',
    padding: theme.spacing(3)
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
        return { background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' };
      case 'pending':
        return { background: 'rgba(255, 172, 62, 0.1)', color: '#FFAC3E' };
      case 'failed':
        return { background: 'rgba(244, 67, 54, 0.1)', color: '#F44336' };
      default:
        return { background: 'rgba(0, 0, 0, 0.1)', color: 'black' };
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
    <div className={classes.root}>
      {/* Header */}
      <Box className={classes.header}>
        <Container maxWidth="sm">
          <Box display="flex" alignItems="center">
            <IconButton onClick={history.goBack} style={{ color: 'white' }}>
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              <HistoryIcon />
              Reward Transaction History
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm">
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
              <FormControl variant="outlined" className={classes.formControl}>
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
                  variant="outlined" 
                  size="small"
                  className={`${classes.dateButton} ${dateFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleDateFilterChange('all')}
                >
                  All Time
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  className={`${classes.dateButton} ${dateFilter === 'today' ? 'active' : ''}`}
                  onClick={() => handleDateFilterChange('today')}
                >
                  Today
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  className={`${classes.dateButton} ${dateFilter === 'yesterday' ? 'active' : ''}`}
                  onClick={() => handleDateFilterChange('yesterday')}
                >
                  Yesterday
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  className={`${classes.dateButton} ${dateFilter === 'thisWeek' ? 'active' : ''}`}
                  onClick={() => handleDateFilterChange('thisWeek')}
                >
                  This Week
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  className={`${classes.dateButton} ${dateFilter === 'thisMonth' ? 'active' : ''}`}
                  onClick={() => handleDateFilterChange('thisMonth')}
                >
                  This Month
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  className={`${classes.dateButton} ${dateFilter === 'lastMonth' ? 'active' : ''}`}
                  onClick={() => handleDateFilterChange('lastMonth')}
                >
                  Last Month
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  className={`${classes.dateButton} ${dateFilter === 'custom' ? 'active' : ''}`}
                  onClick={() => handleDateFilterChange('custom')}
                >
                  Custom
                </Button>
              </Box>
            </Grid>

            {showCustomDatePicker && (
              <Grid item xs={12}>
                <Fade in={showCustomDatePicker}>
                  <Box className={classes.datePickerContainer}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Start Date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className={classes.datePicker}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="End Date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className={classes.datePicker}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end">
                          <Button 
                            variant="outlined" 
                            size="small" 
                            style={{ marginRight: 8, color: 'black' }}
                            onClick={() => setShowCustomDatePicker(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small"
                            style={{ backgroundColor: '#05c0b8', color: 'white' }}
                            onClick={applyCustomDateFilter}
                            disabled={!startDate || !endDate}
                          >
                            Apply
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography style={{ color: 'black', fontSize: '0.9rem' }}>
                  {filteredTransactions.length} transactions found
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  style={{ color: '#05c0b8' }}
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Transactions Table */}
        <TableContainer component={Paper} className={classes.tableContainer} style={{marginBottom: "60px"}}>
          <Table>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <TableRow key={index} hover>
                    <TableCell className={classes.tableCell}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      ₹ {transaction.amount}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {transaction.type}
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        className={classes.statusChip}
                        style={getStatusColor(transaction.status)}
                      >
                        {transaction.status}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className={classes.noDataMessage}>
                    No transactions found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
        <Box style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <CircularProgress style={{ color: 'white' }} />
          <Typography style={{ color: 'white', marginTop: '10px' }}>
            Loading transactions...
          </Typography>
        </Box>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={error.open}
        onClose={() => setError({ ...error, open: false })}
        PaperProps={{
          style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
          },
        }}
      >
        <Typography style={{ color: 'black' }}>
          {error.message}
        </Typography>
      </Dialog>
    </div>
  );
};

export default OfferHistory; 