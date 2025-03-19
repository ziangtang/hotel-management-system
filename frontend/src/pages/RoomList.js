import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import axios from 'axios';

function RoomList() {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Replace mock data with actual API calls
        const hotelResponse = await axios.get(`http://localhost:5000/api/hotels/${hotelId}`);
        const roomsResponse = await axios.get(`http://localhost:5000/api/hotels/${hotelId}/rooms`);
        setHotel(hotelResponse.data);
        setRooms(roomsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch rooms');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRooms();
  }, [hotelId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Rooms at {hotel?.name}
      </Typography>
      
      <Button 
        variant="outlined" 
        component={Link} 
        to="/hotels"
        sx={{ mb: 3 }}
      >
        Back to Hotels
      </Button>
      
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Price per Night</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.room_number}</TableCell>
                <TableCell>{room.type}</TableCell>
                <TableCell>${room.price}</TableCell>
                <TableCell>{room.capacity} people</TableCell>
                <TableCell>
                  <Chip 
                    label={room.status} 
                    color={
                      room.status === 'Available' ? 'success' : 
                      room.status === 'Occupied' ? 'primary' : 
                      'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {room.status === 'Available' && (
                    <Button 
                      variant="contained" 
                      size="small" 
                      component={Link} 
                      to={`/reservations/new?roomId=${room.id}&hotelId=${hotelId}`}
                    >
                      Book Now
                    </Button>
                  )}
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