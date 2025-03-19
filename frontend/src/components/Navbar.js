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

function Navbar() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ 
        backgroundColor: '#2c3e50', // Dark blue/slate color instead of the default blue
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: 0 // Remove bottom margin
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
            HomePage
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/hotels"
            sx={{ 
              mx: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Hotel
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
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;