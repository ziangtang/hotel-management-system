import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Paper
} from '@mui/material';
import axios from 'axios';

function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        // In a real application, fetch from your API
        // const response = await axios.get('http://localhost:5000/api/hotels');
        // setHotels(response.data);
        
        // Mock data for now
        setHotels([
          { id: 1, name: 'Grand Hotel', address: '123 Main St, Boston, MA', rating: 4.5, phone: '555-123-4567' },
          { id: 2, name: 'Luxury Resort', address: '456 Ocean Ave, Miami, FL', rating: 5.0, phone: '555-987-6543' },
          { id: 3, name: 'City Center Hotel', address: '789 Downtown Blvd, New York, NY', rating: 4.2, phone: '555-456-7890' },
          { id: 4, name: 'Mountain View Lodge', address: '101 Alpine Way, Denver, CO', rating: 4.7, phone: '555-234-5678' },
          { id: 5, name: 'Seaside Inn', address: '202 Beach Dr, San Diego, CA', rating: 4.0, phone: '555-876-5432' },
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch hotels');
        setLoading(false);
        console.error(err);
      }
    };

    fetchHotels();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Hotels
      </Typography>
      
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotels.map((hotel) => (
              <TableRow key={hotel.id}>
                <TableCell>{hotel.id}</TableCell>
                <TableCell>{hotel.name}</TableCell>
                <TableCell>{hotel.address}</TableCell>
                <TableCell>{hotel.rating}</TableCell>
                <TableCell>{hotel.phone}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component={Link} 
                    to={`/hotels/${hotel.id}/rooms`}
                    sx={{ mr: 1 }}
                  >
                    View Rooms
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

export default HotelList;