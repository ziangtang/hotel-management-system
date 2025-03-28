import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import RoomAvailability from '../components/RoomAvailability';

function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
        setRoom(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch room details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleAvailabilityCheck = (result) => {
    setAvailability(result);
  };

  const handleBookNow = () => {
    if (availability && availability.available) {
      navigate(`/reservations/new?roomId=${roomId}&checkIn=${availability.checkInDate}&checkOut=${availability.checkOutDate}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!room) {
    return <Typography>Room not found</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Room Details
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Room {room.id}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              ${room.price_per_night} per night
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label={room.type} 
                color="secondary" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label={`${room.capacity} persons`} 
                variant="outlined" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                label={`${room.square_ft} sq ft`} 
                variant="outlined" 
              />
            </Box>
            <Typography variant="body1" paragraph>
              {room.description || 'Comfortable room with all amenities for a pleasant stay.'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {/* Placeholder for room image */}
            <Box 
              sx={{ 
                height: 250, 
                bgcolor: 'grey.200', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Room Image
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <RoomAvailability 
        roomId={roomId} 
        onAvailabilityCheck={handleAvailabilityCheck} 
      />
      
      {availability && (
        <Box sx={{ mb: 3 }}>
          {availability.available ? (
            <Alert severity="success">
              This room is available for the selected dates!
            </Alert>
          ) : (
            <Alert severity="error">
              Sorry, this room is not available for the selected dates.
            </Alert>
          )}
        </Box>
      )}
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined" 
          component={Link} 
          to="/rooms"
        >
          Back to Rooms
        </Button>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleBookNow}
          disabled={!availability || !availability.available}
        >
          Book Now
        </Button>
      </Box>
    </div>
  );
}

export default RoomDetail;