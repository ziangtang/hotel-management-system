import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

function RoomAvailability({ roomId, onAvailabilityCheck }) {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/rooms/${roomId}/availability?check_in=${checkInDate}&check_out=${checkOutDate}`
      );
      
      onAvailabilityCheck({
        available: response.data.available,
        checkInDate,
        checkOutDate
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check availability');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Check Availability
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Check-in Date"
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Check-out Date"
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 200 }}
        />
        <Button 
          variant="contained" 
          onClick={handleCheckAvailability}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Check Availability'}
        </Button>
      </Box>
    </Box>
  );
}

export default RoomAvailability;