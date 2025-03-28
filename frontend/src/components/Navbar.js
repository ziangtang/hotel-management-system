import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// Try to import the Hotel icon, but provide a fallback
let HotelIcon;
try {
  HotelIcon = require('@mui/icons-material/Hotel').default;
} catch (error) {
  // If the icon is not available, we'll use a text fallback
  HotelIcon = () => <span>🏨</span>;
}

// Try to import the SQL icon, but provide a fallback
let CodeIcon;
try {
  CodeIcon = require('@mui/icons-material/Code').default;
} catch (error) {
  // If the icon is not available, we'll use a text fallback
  CodeIcon = () => <span>SQL</span>;
}

// Try to import the database icon, but provide a fallback
let StorageIcon;
try {
  StorageIcon = require('@mui/icons-material/Storage').default;
} catch (error) {
  // If the icon is not available, we'll use a text fallback
  StorageIcon = () => <span>DB</span>;
}

// Try to import the error icon, but provide a fallback
let ErrorIcon;
try {
  ErrorIcon = require('@mui/icons-material/Error').default;
} catch (error) {
  // If the icon is not available, we'll use a text fallback
  ErrorIcon = () => <span>!</span>;
}

function Navbar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ 
        backgroundColor: '#2c3e50',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: 0
      }}>
        <Toolbar>
          <HotelIcon sx={{ mr: 2, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            CS5200_Group3_Hotel_Management_System
          </Typography>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{ 
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/roomtypes"  // Changed from "/hotels" to "/roomtypes"
            sx={{ 
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Room Types
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/rooms"
            sx={{ 
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Rooms
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/reservations"
            sx={{ 
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Reservation
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/customers"
            sx={{ 
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Customer
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/sql-interface"
            sx={{ 
              mx: 1,
              backgroundColor: 'rgba(0, 123, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(0, 123, 255, 0.5)'
              }
            }}
            startIcon={<CodeIcon />}
          >
            SQL Query
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/database-features"
            sx={{ 
              mx: 1,
              backgroundColor: 'rgba(76, 175, 80, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.5)'
              }
            }}
            startIcon={<StorageIcon />}
          >
            DB Features
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/error-handling"
            sx={{ 
              mx: 1,
              backgroundColor: 'rgba(244, 67, 54, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.5)'
              }
            }}
            startIcon={<ErrorIcon />}
          >
            Error Demo
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;