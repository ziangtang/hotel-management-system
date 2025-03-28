import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
  CircularProgress,
  FormHelperText
} from '@mui/material';

function ReservationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reservationId } = useParams();
  const queryParams = new URLSearchParams(location.search);
  
  const isEditMode = !!reservationId;
  
  const [formData, setFormData] = useState({
    customer_id: queryParams.get('customerId') || '',
    room_id: queryParams.get('roomId') || '',
    check_in_date: queryParams.get('checkIn') || '',
    check_out_date: queryParams.get('checkOut') || '',
    state: '',
    city: '',
    street: ''
  });
  
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, roomsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/customers'),
          axios.get('http://localhost:5000/api/rooms')
        ]);
        
        setCustomers(customersResponse.data);
        setRooms(roomsResponse.data);
        
        if (isEditMode) {
          const reservationResponse = await axios.get(`http://localhost:5000/api/reservations/${reservationId}`);
          setFormData(reservationResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, [reservationId, isEditMode]);

  // Fix the useEffect that updates the room when room_id changes
  useEffect(() => {
    if (formData.room_id && rooms.length > 0) {
      const selectedRoom = rooms.find(r => 
        r.id === parseInt(formData.room_id) || 
        r.room_number === parseInt(formData.room_id) ||
        r.room_no === parseInt(formData.room_id)
      );
      setRoom(selectedRoom || null);
    }
  }, [formData.room_id, rooms]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Add validation for state and city
    if (name === 'state') {
      // Allow only alphabetic input for state and limit to 2 characters
      const stateRegex = /^[A-Za-z]*$/;
      if (value.length <= 2 && (stateRegex.test(value) || value === '')) {
        setFormData({
          ...formData,
          [name]: value.toUpperCase() // Convert state to uppercase
        });
      }
    } else if (name === 'city') {
      // Allow only alphabetic input for city
      const cityRegex = /^[A-Za-z\s]*$/;
      if (cityRegex.test(value) || value === '') {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      // For other fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customer_id) errors.customer_id = 'Customer is required';
    if (!formData.room_id) errors.room_id = 'Room is required';
    if (!formData.check_in_date) errors.check_in_date = 'Check-in date is required';
    if (!formData.check_out_date) errors.check_out_date = 'Check-out date is required';
    
    // State validation
    if (formData.state) {
      const stateRegex = /^[A-Za-z]{2}$/;
      if (!stateRegex.test(formData.state)) {
        errors.state = 'State must be exactly 2 letters (e.g., NY, CA)';
      }
    }

    // City validation
    if (formData.city) {
      const cityRegex = /^[A-Za-z\s]+$/;
      if (!cityRegex.test(formData.city)) {
        errors.city = 'City must contain only letters and spaces';
      }
    }
    
    // Check if check-out date is after check-in date
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      
      if (checkOut <= checkIn) {
        errors.check_out_date = 'Check-out date must be after check-in date';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // In the useEffect that calculates the total price
  useEffect(() => {
    if (room && formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        // Make sure we're using a number for price calculation
        const pricePerNight = parseFloat(room.price_per_night || room.price || 0);
        // Limit the total price to a reasonable value (e.g., 2 decimal places)
        const calculatedTotal = parseFloat((pricePerNight * nights).toFixed(2));
        
        setFormData(prev => ({
          ...prev,
          total_price: calculatedTotal
        }));
      }
    }
  }, [room, formData.check_in_date, formData.check_out_date]);
  
  // In the handleSubmit function, ensure the total_price is properly formatted
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Ensure total_price is a valid number
      const dataToSubmit = {
        ...formData,
        total_price: parseFloat(formData.total_price) || 0
      };
      
      // If editing an existing reservation
      if (reservationId) {
        await axios.put(`http://localhost:5000/api/reservations/${reservationId}`, dataToSubmit);
        navigate(`/reservations/${reservationId}`);
      } else {
        // Creating a new reservation
        await axios.post('http://localhost:5000/api/reservations', dataToSubmit);
        navigate('/reservations');
      }
    } catch (err) {
      console.error('Error saving reservation:', err);
      setError(`Failed to save reservation: ${err.response?.data?.message || err.message}`);
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

  return (
    <div>
      <Typography variant="h4" className="page-title">
        {reservationId ? 'Edit Reservation' : 'New Reservation'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!validationErrors.customer_id}>
                <InputLabel>Customer</InputLabel>
                <Select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                >
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.customer_id && (
                  <FormHelperText>{validationErrors.customer_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!validationErrors.room_id}>
                <InputLabel>Room</InputLabel>
                <Select
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleInputChange}
                  disabled={!!queryParams.get('roomId')}
                >
                  {rooms.map(room => (
                    <MenuItem key={room.id || room.room_number} value={room.id || room.room_number}>
                      Room {room.id || room.room_number} - {room.type} (${room.price_per_night || room.price}/night)
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.room_id && (
                  <FormHelperText>{validationErrors.room_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-in Date"
                type="date"
                name="check_in_date"
                value={formData.check_in_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!validationErrors.check_in_date}
                helperText={validationErrors.check_in_date}
                disabled={!!queryParams.get('checkIn')}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-out Date"
                type="date"
                name="check_out_date"
                value={formData.check_out_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!validationErrors.check_out_date}
                helperText={validationErrors.check_out_date}
                disabled={!!queryParams.get('checkOut')}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state || ''}
                onChange={handleInputChange}
                margin="normal"
                inputProps={{ maxLength: 2 }}
                error={!!validationErrors.state}
                helperText={validationErrors.state || 'Two letter state code (e.g., NY, CA)'}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                margin="normal"
                error={!!validationErrors.city}
                helperText={validationErrors.city || 'Enter city name (letters only)'}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Street"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
              />
            </Grid>
            
            {/* Display total price information */}
            <Grid item xs={12}>
              {room && formData.check_in_date && formData.check_out_date && (
                <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Room: {room.type} (${room.price_per_night || room.price || 0}/night)
                  </Typography>
                  <Typography variant="subtitle1">
                    Total Price: ${formData.total_price || 0}
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/reservations"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Create Reservation'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
}

export default ReservationForm;