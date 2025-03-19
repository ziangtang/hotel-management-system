import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Box,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function EditReservation() {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    room_id: '',
    check_in_date: null,
    check_out_date: null,
    status: ''
  });
  
  const [customers, setCustomers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the specific reservation by ID
        const reservationRes = await axios.get(`http://localhost:5000/api/reservations/${reservationId}`);
        const reservation = reservationRes.data;
        
        // Fetch other necessary data
        const [customersRes, hotelsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/customers'),
          axios.get('http://localhost:5000/api/hotels')
        ]);
        
        setCustomers(customersRes.data);
        setHotels(hotelsRes.data);
        
        // Set the selected hotel to fetch rooms
        setSelectedHotel(reservation.hotel_id);
        
        // Fetch rooms for the hotel
        const roomsRes = await axios.get(`http://localhost:5000/api/hotels/${reservation.hotel_id}/rooms`);
        setRooms(roomsRes.data);
        
        // Format dates for the form
        setFormData({
          customer_id: reservation.customer_id,
          room_id: reservation.room_id,
          check_in_date: new Date(reservation.check_in_date),
          check_out_date: new Date(reservation.check_out_date),
          status: reservation.status
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch reservation data');
        setLoading(false);
        console.error(err);
      }
    };
  
    fetchData();
  }, [reservationId]);

  const handleHotelChange = async (e) => {
    const hotelId = e.target.value;
    setSelectedHotel(hotelId);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/hotels/${hotelId}/rooms`);
      setRooms(response.data);
      // Reset room selection when hotel changes
      setFormData({
        ...formData,
        room_id: ''
      });
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
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
      
      await axios.put(`http://localhost:5000/api/reservations/${reservationId}`, formattedData);
      
      // Navigate back to reservation details
      navigate(`/reservations/${reservationId}`);
    } catch (err) {
      setError('Failed to update reservation');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" mt={4}>{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Edit Reservation
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  required
                >
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Hotel</InputLabel>
                <Select
                  value={selectedHotel}
                  onChange={handleHotelChange}
                  required
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
              <FormControl fullWidth>
                <InputLabel>Room</InputLabel>
                <Select
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleInputChange}
                  required
                  disabled={!selectedHotel}
                >
                  {rooms.map(room => (
                    <MenuItem key={room.id} value={room.id}>
                      Room {room.room_number} - {room.type} (${room.price}/night)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
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
                  minDate={formData.check_in_date}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate(`/reservations/${reservationId}`)}
                  sx={{ mr: 2 }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                >
                  Update Reservation
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
}

export default EditReservation;