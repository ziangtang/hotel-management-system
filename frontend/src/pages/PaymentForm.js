import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';

function PaymentForm() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [formData, setFormData] = useState({
    booking_id: reservationId,
    customer_id: '',
    amount_paid: '',
    payment_method: 'Credit Card'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/reservations/${reservationId}`);
        setReservation(response.data);
        setFormData(prevData => ({
          ...prevData,
          customer_id: response.data.customer?.id || ''
        }));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch reservation details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchReservation();
  }, [reservationId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:5000/api/payments', formData);
      setSuccess(`Payment of $${formData.amount_paid} processed successfully. Remaining balance: $${response.data.remaining_balance}`);
      setSubmitting(false);
      
      // Reset form
      setFormData({
        ...formData,
        amount_paid: ''
      });
      
      // Refresh reservation data
      const reservationResponse = await axios.get(`http://localhost:5000/api/reservations/${reservationId}`);
      setReservation(reservationResponse.data);
      
      // If fully paid, redirect after a delay
      if (response.data.is_fully_paid) {
        setTimeout(() => {
          navigate(`/reservations/${reservationId}`);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process payment');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!reservation) {
    return <Alert severity="error">Reservation not found</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Process Payment
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Reservation Information</Typography>
            <Typography><strong>ID:</strong> {reservation.id}</Typography>
            <Typography><strong>Check-in:</strong> {reservation.check_in_date}</Typography>
            <Typography><strong>Check-out:</strong> {reservation.check_out_date}</Typography>
            <Typography><strong>Total Price:</strong> ${reservation.total_price}</Typography>
          </Grid>
          
          {reservation.customer && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Customer Information</Typography>
              <Typography><strong>Name:</strong> {reservation.customer.first_name} {reservation.customer.last_name}</Typography>
              <Typography><strong>Email:</strong> {reservation.customer.email}</Typography>
              <Typography><strong>Phone:</strong> {reservation.customer.phone}</Typography>
            </Grid>
          )}
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount_paid"
                type="number"
                value={formData.amount_paid}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Debit Card">Debit Card</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate(`/reservations/${reservationId}`)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitting || !formData.amount_paid}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Process Payment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
}

export default PaymentForm;