import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuditLogPage from './AuditLogs';
import Login from './Login';
import rbcLogo from './rbc-logo.png';

// Main App component
function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [phone, setPhone] = useState('');
  const [voicemail, setVoicemail] = useState('');
  const [userId, setUserId] = useState('');
  const [cluster, setCluster] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('originationTime');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Store token in localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch records based on search parameters
  const handleFetchRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8000/records', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          start_date: Math.floor(startDate.getTime() / 1000),
          end_date: Math.floor(endDate.getTime() / 1000),
          phone: phone || undefined,
          voicemail: voicemail || undefined,
          user_id: userId || undefined,
          cluster: cluster || undefined,
        },
      });
      setRecords(response.data);
      setPage(0); // Reset to the first page
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setToken(null); // If unauthorized, reset the token
      }
      setError(err.response ? err.response.data.detail : 'An error occurred');
      setRecords([]); // Clear records on error
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting of records
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle page change for pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change for pagination
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle user logout
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    // Reset search states
    setStartDate(new Date());
    setEndDate(new Date());
    setPhone('');
    setVoicemail('');
    setUserId('');
    setCluster('');
    setRecords([]);
    setError(null);
  };

  // Sort and paginate records
  const sortedRecords = records.slice().sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Handle nested fields
    if (orderBy === 'phone' || orderBy === 'voicemail') {
      aValue = a.devices[orderBy];
      bValue = b.devices[orderBy];
    }

    // Handle numeric fields
    if (orderBy === '_id' || orderBy === 'originationTime') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return (order === 'asc' ? 1 : -1) * aValue.localeCompare(bValue);
    }

    return (order === 'asc' ? 1 : -1) * (aValue - bValue);
  });

  const paginatedRecords = sortedRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Container maxWidth="md" sx={{ paddingBottom: '20px' }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <img src={rbcLogo} alt="RBC Logo" style={{ width: '100px' }} />
                <Typography
                  variant="h3"
                  gutterBottom
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    color: '#0033a0',
                    flexGrow: 1,
                    textAlign: 'center',
                  }}
                >
                  Record Search
                </Typography>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  mt={2}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleLogout}
                    sx={{ mb: 1 }}
                  >
                    Logout
                  </Button>
                  <Link to="/audit-logs" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary">
                      Audit Logs
                    </Button>
                  </Link>
                </Box>
              </Box>

              <Box mb={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                        slotProps={{
                          textField: { variant: 'outlined', fullWidth: true },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="End Date"
                        value={endDate}
                        onChange={setEndDate}
                        slotProps={{
                          textField: { variant: 'outlined', fullWidth: true },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Voicemail"
                        value={voicemail}
                        onChange={(e) => setVoicemail(e.target.value)}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Cluster"
                        value={cluster}
                        onChange={(e) => setCluster(e.target.value)}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleFetchRecords}
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={loading}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Search'
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </LocalizationProvider>
                {error && (
                  <Box
                    mt={2}
                    p={2}
                    bgcolor="#ffcccc"
                    color="#cc0000"
                    borderRadius="4px"
                    border="1px solid #cc0000"
                    display="flex"
                    justifyContent="center"
                  >
                    <Typography>{error}</Typography>
                  </Box>
                )}
              </Box>
              {records.length > 0 && (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <TableSortLabel
                              active={orderBy === '_id'}
                              direction={orderBy === '_id' ? order : 'asc'}
                              onClick={() => handleRequestSort('_id')}
                            >
                              _id
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={orderBy === 'originationTime'}
                              direction={
                                orderBy === 'originationTime' ? order : 'asc'
                              }
                              onClick={() =>
                                handleRequestSort('originationTime')
                              }
                            >
                              Origination Time
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={orderBy === 'clusterId'}
                              direction={
                                orderBy === 'clusterId' ? order : 'asc'
                              }
                              onClick={() => handleRequestSort('clusterId')}
                            >
                              Cluster ID
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={orderBy === 'userId'}
                              direction={orderBy === 'userId' ? order : 'asc'}
                              onClick={() => handleRequestSort('userId')}
                            >
                              User ID
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={orderBy === 'phone'}
                              direction={orderBy === 'phone' ? order : 'asc'}
                              onClick={() => handleRequestSort('phone')}
                            >
                              Phone
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={orderBy === 'voicemail'}
                              direction={
                                orderBy === 'voicemail' ? order : 'asc'
                              }
                              onClick={() => handleRequestSort('voicemail')}
                            >
                              Voicemail
                            </TableSortLabel>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedRecords.map((record) => (
                          <TableRow key={record._id}>
                            <TableCell>{record._id}</TableCell>
                            <TableCell>
                              {new Date(
                                record.originationTime * 1000
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell>{record.clusterId}</TableCell>
                            <TableCell>{record.userId}</TableCell>
                            <TableCell>{record.devices.phone}</TableCell>
                            <TableCell>{record.devices.voicemail}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={records.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                  />
                  <Box
                    mt={3}
                    display="flex"
                    justifyContent="center"
                    paddingBottom="20px"
                  >
                    <CSVLink
                      data={sortedRecords}
                      filename={`record_search_${new Date().toISOString()}.csv`}
                    >
                      <Button variant="contained" color="primary">
                        Download CSV
                      </Button>
                    </CSVLink>
                  </Box>
                </>
              )}
            </Container>
          }
        />
        <Route path="/audit-logs" element={<AuditLogPage />} />
      </Routes>
    </Router>
  );
}

export default App;
