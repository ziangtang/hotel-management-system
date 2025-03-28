import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  TextField,
  Chip
} from '@mui/material';

function ReservationDetail() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [cancellation, setCancellation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationData, setCancellationData] = useState({
    refund_amount: 0,
    reason: ''
  });
  const [stayLength, setStayLength] = useState(null);

  const fetchReservation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/reservations/${reservationId}`);
      setReservation(response.data);
      
      // Check if this reservation has been cancelled
      try {
        const cancellationsResponse = await axios.get(`http://localhost:5000/api/cancellations`);
        const relatedCancellation = cancellationsResponse.data.find(
          c => c.booking_id === parseInt(reservationId)
        );
        
        if (relatedCancellation) {
          setCancellation(relatedCancellation);
        }
      } catch (err) {
        console.error('Error fetching cancellation data:', err);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reservation details');
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  // New effect to fetch stay length using the STAY_LEN database function
  useEffect(() => {
    if (reservation && reservation.id) {
      const fetchStayLength = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/reservation-lengths`);
          if (response.data.success) {
            const stayData = response.data.reservation_lengths.find(
              item => item.BookID === parseInt(reservation.id)
            );
            if (stayData) {
              setStayLength(stayData.No_of_days);
            }
          }
        } catch (error) {
          console.error("Error fetching stay length:", error);
        }
      };
      fetchStayLength();
    }
  }, [reservation]);

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

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancellationInputChange = (e) => {
    const { name, value } = e.target;
    setCancellationData({
      ...cancellationData,
      [name]: value
    });
  };

  const handleCancelSubmit = async () => {
    try {
      await axios.post(`http://localhost:5000/api/reservations/${reservationId}/cancel`, cancellationData);
      setCancelDialogOpen(false);
      fetchReservation();
    } catch (err) {
      console.error('Failed to cancel reservation:', err);
      setError('Failed to cancel reservation: ' + err.message);
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
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {cancellation && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              This reservation was cancelled on {cancellation.cancellation_date} 
              with a refund of ${cancellation.refund_amount.toFixed(2)}.
            </Alert>
          )}
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Reservation Information</Typography>
                <Typography><strong>ID:</strong> {reservation.id}</Typography>
                <Typography><strong>Check-in:</strong> {reservation.check_in_date}</Typography>
                <Typography><strong>Check-out:</strong> {reservation.check_out_date}</Typography>
                {stayLength !== null && (
                  <Typography>
                    <strong>Length of Stay:</strong> {stayLength} days
                    <Chip 
                      label="STAY_LEN Function" 
                      size="small" 
                      color="info" 
                      sx={{ ml: 1, fontSize: '0.7rem' }} 
                    />
                  </Typography>
                )}
                <Typography><strong>Total Price:</strong> ${reservation.total_price}</Typography>
                <Typography><strong>Booking Date:</strong> {reservation.booking_date}</Typography>
                <Typography><strong>Status:</strong> {cancellation ? 'Cancelled' : 'Active'}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Address</Typography>
                <Typography>{reservation.street || 'N/A'}</Typography>
                <Typography>{reservation.city || 'N/A'}, {reservation.state || 'N/A'}</Typography>
              </Grid>
              
              {reservation.customer && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Customer Information</Typography>
                  <Typography><strong>Name:</strong> {reservation.customer.first_name} {reservation.customer.last_name}</Typography>
                  <Typography><strong>Email:</strong> {reservation.customer.email}</Typography>
                  <Typography><strong>Phone:</strong> {reservation.customer.phone}</Typography>
                </Grid>
              )}
              
              {reservation.room && (
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Room Information</Typography>
                  <Typography><strong>Room Number:</strong> {reservation.room.id}</Typography>
                  <Typography><strong>Type:</strong> {reservation.room.type}</Typography>
                  <Typography><strong>Price:</strong> ${reservation.room.price_per_night}/night</Typography>
                  <Typography><strong>Square Feet:</strong> {reservation.room.square_ft} sq ft</Typography>
                </Grid>
              )}
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                component={Link} 
                to="/reservations"
              >
                Back to Reservations
              </Button>
              
              {!cancellation && (
                <>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link} 
                    to={`/reservations/${reservationId}/edit`}
                  >
                    Edit
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={handleCancelClick}
                  >
                    Cancel Reservation
                  </Button>
                </>
              )}
            </Box>
          </Paper>

          {/* Stay Length Information Card */}
          {stayLength !== null && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Database Function Demonstration: STAY_LEN
              </Typography>
              <Typography>
                This reservation's length of stay is calculated using the SQL function <code>STAY_LEN(Check_in, Check_out)</code>.
              </Typography>
              <Typography sx={{ mt: 1 }}>
                The function calculates: <strong>{stayLength} days</strong> between check-in ({reservation.check_in_date}) 
                and check-out ({reservation.check_out_date}).
              </Typography>
              <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                SQL Function: <code>STAY_LEN(Check_in DATE, Check_out DATE) RETURNS INT</code>
              </Typography>
            </Paper>
          )}
          
          {/* Payment section could be added here */}
        </>
      )}
      
      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this reservation? Please specify the refund amount.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="refund_amount"
            label="Refund Amount"
            type="number"
            fullWidth
            variant="standard"
            value={cancellationData.refund_amount}
            onChange={handleCancellationInputChange}
          />
          <TextField
            margin="dense"
            name="reason"
            label="Reason for Cancellation"
            type="text"
            fullWidth
            variant="standard"
            value={cancellationData.reason}
            onChange={handleCancellationInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCancelSubmit} color="error">Confirm Cancellation</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ReservationDetail;