import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip
} from '@mui/material';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [filters, setFilters] = useState({
    type: new URLSearchParams(window.location.search).get('type') || '',
    minPrice: '',
    maxPrice: '',
    capacity: ''
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsResponse = await axios.get(`http://localhost:5000/api/rooms`);
        setRooms(roomsResponse.data);
        setFilteredRooms(roomsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch rooms');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRooms();
  }, []);

  // Apply filters whenever rooms or filters change
  useEffect(() => {
    if (rooms.length > 0) {
      let result = [...rooms];
      
      // Filter by type if specified
      if (filters.type) {
        result = result.filter(room => room.type === filters.type);
      }
      
      // Filter by price range if specified
      if (filters.minPrice) {
        result = result.filter(room => room.price_per_night >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        result = result.filter(room => room.price_per_night <= Number(filters.maxPrice));
      }
      
      // Filter by capacity if specified
      if (filters.capacity) {
        result = result.filter(room => room.capacity >= Number(filters.capacity));
      }
      
      setFilteredRooms(result);
    }
  }, [rooms, filters]);

  const checkAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select both check-in and check-out dates');
      return;
    }

    try {
      setLoading(true);
      // Get all reservations
      const reservationsResponse = await axios.get('http://localhost:5000/api/reservations');
      const reservations = reservationsResponse.data;
  
      // Create a map of room availability
      const roomAvailability = {};
      
      // Mark rooms as unavailable if they have overlapping reservations
      reservations.forEach(reservation => {
        const roomId = reservation.room_id;
        const resCheckIn = new Date(reservation.check_in_date);
        const resCheckOut = new Date(reservation.check_out_date);
        const selectedCheckIn = new Date(checkInDate);
        const selectedCheckOut = new Date(checkOutDate);
        
        // Check if dates overlap
        if (
          (selectedCheckIn <= resCheckOut && selectedCheckOut >= resCheckIn) ||
          (resCheckIn <= selectedCheckOut && resCheckOut >= selectedCheckIn)
        ) {
          roomAvailability[roomId] = 'Booked';
        } else if (!roomAvailability[roomId]) {
          roomAvailability[roomId] = 'Available';
        }
      });
      
      // Update room status based on availability
      const updatedRooms = rooms.map(room => ({
        ...room,
        status: roomAvailability[room.id || room.room_no] || 'Available'
      }));
      
      setFilteredRooms(updatedRooms);
      setAvailabilityChecked(true); // Set this to true to indicate availability has been checked
      setLoading(false);
    } catch (err) {
      console.error('Error checking availability:', err);
      setError('Failed to check availability');
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      capacity: ''
    });
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title">
        {filters.type ? `${filters.type} Rooms` : 'All Rooms'}
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filters</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            select
            label="Room Type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            sx={{ minWidth: 120 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">All Types</option>
            <option value="King">King</option>
            <option value="Queen">Queen</option>
            <option value="Standard">Standard</option>
          </TextField>
          
          <TextField
            label="Min Price"
            name="minPrice"
            type="number"
            value={filters.minPrice}
            onChange={handleFilterChange}
            sx={{ width: 100 }}
          />
          
          <TextField
            label="Max Price"
            name="maxPrice"
            type="number"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            sx={{ width: 100 }}
          />
          
          <TextField
            label="Min Capacity"
            name="capacity"
            type="number"
            value={filters.capacity}
            onChange={handleFilterChange}
            sx={{ width: 100 }}
          />
          
          <Button variant="outlined" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Box>
      </Paper>
      
      {/* Date selection for availability check */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Check-in Date"
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Check-out Date"
          type="date"
          value={checkOutDate}
          onChange={(e) => setCheckOutDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button 
          variant="contained" 
          onClick={checkAvailability}
        >
          Check Availability
        </Button>
      </Box>
      
      {/* Display number of results */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Showing {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
      </Typography>
      
      {/* Room table */}
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Features</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {filteredRooms.map((room) => (
              <TableRow key={room.id || room.room_no}>
                <TableCell>{room.id || room.room_no}</TableCell>
                <TableCell>{room.type}</TableCell>
                <TableCell>${room.price_per_night || room.price}/night</TableCell>
                <TableCell>{room.capacity} persons</TableCell>
                <TableCell>
                  <Chip 
                    label={room.status || 'Available'} 
                    color={room.status === 'Booked' ? 'error' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Kitchen: {room.kitchen === 'Y' ? 'Full kitchen' : 'No kitchen'}
                  </Typography>
                  <Typography variant="body2">
                    Balcony: {room.balcony === 'Y' ? (room.balcony_size || 'Large balcony') : 'No balcony'}
                  </Typography>
                  <Typography variant="body2">
                    Amenities: {room.amenities || 'Basic amenities'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {/* Removed View button, only keeping Book button */}
                  <Button 
                    variant="contained" 
                    size="small"
                    component={Link}
                    to={`/reservations/new?roomId=${room.id || room.room_no}&checkIn=${checkInDate}&checkOut=${checkOutDate}`}
                    disabled={room.status === 'Booked'}
                  >
                    Book
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default RoomList;