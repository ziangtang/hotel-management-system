import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Box
} from '@mui/material';
import axios from 'axios';

// Try to import date pickers, but provide fallbacks
let AdapterDateFns, LocalizationProvider, DatePicker;
try {
  AdapterDateFns = require('@mui/x-date-pickers/AdapterDateFns').AdapterDateFns;
  const datePickers = require('@mui/x-date-pickers');
  LocalizationProvider = datePickers.LocalizationProvider;
  DatePicker = datePickers.DatePicker;
} catch (error) {
  // If date pickers are not available, we'll use text fields as fallback
  AdapterDateFns = function() {};
  LocalizationProvider = ({ children }) => <>{children}</>;
  DatePicker = function({ label, value, onChange, renderInput }) {
    return renderInput({
      value: value ? value.toISOString().split('T')[0] : '',
      onChange: (e) => onChange(new Date(e.target.value)),
      type: 'date',
      label: label
    });
  };
}

function NewReservation() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedRoomId = queryParams.get('roomId');
  const preSelectedHotelId = queryParams.get('hotelId');

  const [formData, setFormData] = useState({
    customer_id: '',
    hotel_id: preSelectedHotelId || '',
    room_id: preSelectedRoomId || '',
    check_in_date: null,
    check_out_date: null,
    status: 'Confirmed'
  });

  // Add these missing state variables
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reservationId, setReservationId] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace mock data with API calls
        const customersResponse = await axios.get('http://localhost:5000/api/customers');
        const hotelsResponse = await axios.get('http://localhost:5000/api/hotels');
        setCustomers(customersResponse.data);
        setHotels(hotelsResponse.data);
        
        // If hotel is preselected, fetch rooms for that hotel
        if (preSelectedHotelId) {
          const roomsResponse = await axios.get(`http://localhost:5000/api/hotels/${preSelectedHotelId}/rooms`);
          setRooms(roomsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [preSelectedHotelId]);

  useEffect(() => {
    // When hotel selection changes, fetch rooms for that hotel
    if (formData.hotel_id && !preSelectedHotelId) {
      const fetchRooms = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/hotels/${formData.hotel_id}/rooms`);
          setRooms(response.data);
        } catch (err) {
          console.error('Failed to fetch rooms:', err);
        }
      };
      
      fetchRooms();
    }
  }, [formData.hotel_id, preSelectedHotelId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  // Fix the handleSubmit function to properly format dates
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // Make sure all required fields are present
      if (!formData.customer_id || !formData.room_id || !formData.check_in_date || !formData.check_out_date) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }
      
      // Format dates to YYYY-MM-DD before sending to backend
      const formattedData = {
        ...formData,
        check_in_date: formData.check_in_date instanceof Date 
          ? formData.check_in_date.toISOString().split('T')[0] 
          : formData.check_in_date,
        check_out_date: formData.check_out_date instanceof Date 
          ? formData.check_out_date.toISOString().split('T')[0] 
          : formData.check_out_date
      };
      
      console.log("Sending formatted reservation data:", formattedData);
      
      const response = await axios.post('http://localhost:5000/api/reservations', formattedData);
      
      console.log("Reservation created successfully:", response.data);
      setSubmitting(false);
      setSuccess(true);
      setReservationId(response.data.id);
      
      // Show success message for a moment before redirecting
      setTimeout(() => {
        navigate('/reservations', { replace: true });
      }, 1500);
    } catch (error) {
      console.error('Error creating reservation:', error);
      setError(error.response?.data?.error || error.message);
      setSubmitting(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title">
        New Reservation
      </Typography>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Reservation created successfully!</div>}
      
      <Paper className="form-container">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Customer</InputLabel>
                <Select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  label="Customer"
                >
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} ({customer.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Hotel</InputLabel>
                <Select
                  name="hotel_id"
                  value={formData.hotel_id}
                  onChange={handleInputChange}
                  label="Hotel"
                  disabled={!!preSelectedHotelId}
                >
                  {hotels.map(hotel => (
                    <MenuItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Room</InputLabel>
                <Select
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleInputChange}
                  label="Room"
                  disabled={!formData.hotel_id || !!preSelectedRoomId}
                >
                  {rooms.map(room => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.room_number} - {room.type} (${room.price}/night)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="Checked In">Checked In</MenuItem>
                  <MenuItem value="Checked Out">Checked Out</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-in Date"
                  value={formData.check_in_date}
                  onChange={(date) => handleDateChange('check_in_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-out Date"
                  value={formData.check_out_date}
                  onChange={(date) => handleDateChange('check_out_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={formData.check_in_date || new Date()}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          
          <Box className="form-actions">
            <Button 
              variant="outlined" 
              onClick={() => navigate('/reservations')}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Reservation'}
            </Button>
          </Box>
        </form>
      </Paper>
    </div>
  );
}

export default NewReservation;