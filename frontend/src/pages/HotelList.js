import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Rating
} from '@mui/material';

function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        // Since we don't have a hotels endpoint, let's get unique hotel_ids from rooms
        const roomsResponse = await axios.get('http://localhost:5000/api/rooms');
        
        // Extract unique hotel_ids and create mock hotel objects
        const hotelMap = new Map();
        
        roomsResponse.data.forEach(room => {
          if (room.hotel_id && !hotelMap.has(room.hotel_id)) {
            hotelMap.set(room.hotel_id, {
              id: room.hotel_id,
              name: `Hotel ${room.hotel_id}`,
              address: 'Hotel Address',
              city: room.city || 'City',
              state: room.state || 'State',
              rating: 4.5,
              description: 'A comfortable hotel with excellent amenities and service.'
            });
          }
        });
        
        setHotels(Array.from(hotelMap.values()));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch hotels');
        setLoading(false);
        console.error(err);
      }
    };

    fetchHotels();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return <Typography color="error">{error}</Typography>;

  // If no hotels are found, display a message
  if (hotels.length === 0) {
    return (
      <div>
        <Typography variant="h4" className="page-title" sx={{ mb: 3 }}>
          Hotels
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No hotels found in the database. Please add hotels to see them listed here.
          </Typography>
        </Paper>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4" className="page-title" sx={{ mb: 3 }}>
        Our Hotels
      </Typography>
      
      <Grid container spacing={3}>
        {hotels.map((hotel) => (
          <Grid item xs={12} md={6} lg={4} key={hotel.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Hotel Image
                </Typography>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  {hotel.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={hotel.rating || 4.5} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({hotel.rating || 4.5})
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {hotel.address}, {hotel.city}, {hotel.state}
                </Typography>
                <Typography variant="body2" paragraph>
                  {hotel.description}
                </Typography>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to={`/hotels/${hotel.id}`}
                  sx={{ mt: 'auto' }}
                >
                  View Rooms
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default HotelList;