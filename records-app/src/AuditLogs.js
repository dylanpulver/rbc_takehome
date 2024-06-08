import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';

// AuditLogPage component
const AuditLogPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('timestamp');
  const token = localStorage.getItem('token'); // Get the token from local storage

  // Fetch audit logs from the server
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/audit-logs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAuditLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      }
    };
    fetchAuditLogs();
  }, [token]);

  // Handle sorting of audit logs
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

  // Sort and paginate audit logs
  const sortedLogs = auditLogs.slice().sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === 'timestamp') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return (order === 'asc' ? 1 : -1) * aValue.localeCompare(bValue);
    }

    return (order === 'asc' ? 1 : -1) * (aValue - bValue);
  });

  return (
    <Container maxWidth="md" sx={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button component={Link} to="/" variant="contained" color="primary">
          Back to Search
        </Button>
      </Box>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{ fontWeight: 'bold', color: '#0033a0', textAlign: 'center' }}
      >
        Audit Logs
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'path'}
                  direction={orderBy === 'path' ? order : 'asc'}
                  onClick={() => handleRequestSort('path')}
                >
                  Path
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'method'}
                  direction={orderBy === 'method' ? order : 'asc'}
                  onClick={() => handleRequestSort('method')}
                >
                  Method
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status_code'}
                  direction={orderBy === 'status_code' ? order : 'asc'}
                  onClick={() => handleRequestSort('status_code')}
                >
                  Status Code
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'timestamp'}
                  direction={orderBy === 'timestamp' ? order : 'asc'}
                  onClick={() => handleRequestSort('timestamp')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'client_ip'}
                  direction={orderBy === 'client_ip' ? order : 'asc'}
                  onClick={() => handleRequestSort('client_ip')}
                >
                  Client IP
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'user_agent'}
                  direction={orderBy === 'user_agent' ? order : 'asc'}
                  onClick={() => handleRequestSort('user_agent')}
                >
                  User Agent
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedLogs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{log.path}</TableCell>
                  <TableCell>{log.method}</TableCell>
                  <TableCell>{log.status_code}</TableCell>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.client_ip}</TableCell>
                  <TableCell>{log.user_agent}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={auditLogs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>
      <Box mt={3} display="flex" justifyContent="center" paddingBottom="20px">
        <CSVLink
          data={sortedLogs}
          filename={`audit_logs_${new Date().toISOString()}.csv`}
        >
          <Button variant="contained" color="primary">
            Download CSV
          </Button>
        </CSVLink>
      </Box>
    </Container>
  );
};

export default AuditLogPage;
