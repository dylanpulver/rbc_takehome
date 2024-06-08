import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import rbcLogo from './rbc-logo.png';

// Login component
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Handle user login
  const handleLogin = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/token',
        new URLSearchParams({
          username: username,
          password: password,
        })
      );
      onLogin(response.data.access_token);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        // Validation error
        setError('Please fill in both the username and password fields.');
      } else {
        setError(err.response ? err.response.data.detail : 'An error occurred');
      }
    }
  };

  return (
    <Container
      maxWidth="xs"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={3} style={{ padding: '2em', textAlign: 'center' }}>
        <Box mb={3}>
          <img src={rbcLogo} alt="RBC Logo" style={{ width: '100px' }} />
        </Box>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#0033a0' }}
        >
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            style={{ marginTop: '1em' }}
          >
            Login
          </Button>
        </form>
        {error && (
          <Typography
            color="error"
            mt={2}
            style={{
              fontWeight: 'bold',
              padding: '0.5em',
              borderRadius: '4px',
              backgroundColor: '#ffe5e5',
              border: '1px solid #ff4d4d',
            }}
          >
            {error}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default Login;
