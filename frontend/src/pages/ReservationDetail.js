import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import axios from 'axios';

function ReservationDetail() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/reservations`);
        const foundReservation = response.data.find(r => r.id === parseInt(reservationId));
        
        if (foundReservation) {
          setReservation(foundReservation);
        } else {
          setError('Reservation not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch reservation details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchReservation();
  }, [reservationId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reservations/${reservationId}`);
        navigate('/reservations');
      } catch (err) {
        console.error('Failed to delete reservation:', err);
        alert('Failed to cancel reservation');
      }
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;
  if (!reservation) return <Typography align="center" mt={4}>Reservation not found</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Reservation Details
      </Typography>
      
      <Button 
        variant="outlined" 
        component={Link} 
        to="/reservations"
        sx={{ mb: 3, mr: 2 }}
      >
        Back to Reservations
      </Button>
      
      <Button 
        variant="contained" 
        color="primary"
        component={Link}
        to={`/reservations/edit/${reservationId}`}
        sx={{ mb: 3, mr: 2 }}
      >
        Edit Reservation
      </Button>
      
      <Button 
        variant="contained" 
        color="error"
        onClick={handleDelete}
        sx={{ mb: 3 }}
      >
        Cancel Reservation
      </Button>
      
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Customer</Typography>
              <Typography>{reservation.first_name} {reservation.last_name}</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Hotel</Typography>
              <Typography>{reservation.hotel_name}</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Room</Typography>
              <Typography>Room {reservation.room_number}</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Status</Typography>
              <Chip 
                label={reservation.status} 
                color={
                  reservation.status === 'Confirmed' ? 'success' : 
                  reservation.status === 'Checked In' ? 'primary' : 
                  'default'
                }
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Check-in Date</Typography>
              <Typography>{reservation.check_in_date}</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Check-out Date</Typography>
              <Typography>{reservation.check_out_date}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReservationDetail;