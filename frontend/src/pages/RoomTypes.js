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
  Chip,
  Divider,
  Rating
} from '@mui/material';

function RoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        // Fetch all rooms
        const response = await axios.get('http://localhost:5000/api/rooms');
        
        // Group rooms by type
        const typeGroups = {};
        response.data.forEach(room => {
          const type = room.type || 'Standard';
          if (!typeGroups[type]) {
            typeGroups[type] = {
              type: type,
              rooms: [],
              minPrice: Infinity,
              maxCapacity: 0,
              features: new Set(),
              views: []
            };
          }
          
          // Add room to its type group
          typeGroups[type].rooms.push(room);
          
          // Update min price
          if (room.price_per_night < typeGroups[type].minPrice) {
            typeGroups[type].minPrice = room.price_per_night;
          }
          
          // Update max capacity
          if (room.capacity > typeGroups[type].maxCapacity) {
            typeGroups[type].maxCapacity = room.capacity;
          }
          
          // Collect features
          if (room.kitchen === 'Y') typeGroups[type].features.add('Kitchen');
          if (room.balcony === 'Y') typeGroups[type].features.add('Balcony');
          if (room.amenities) {
            room.amenities.split(',').forEach(amenity => 
              typeGroups[type].features.add(amenity.trim())
            );
          }
          
          // Collect views
          if (room.ocean_view === 'Y') {
            if (!typeGroups[type].views.includes('Ocean')) {
              typeGroups[type].views.push('Ocean');
            }
          }
          if (room.city_view === 'Y') {
            if (!typeGroups[type].views.includes('City')) {
              typeGroups[type].views.push('City');
            }
          }
          if (room.mountain_view === 'Y') {
            if (!typeGroups[type].views.includes('Mountain')) {
              typeGroups[type].views.push('Mountain');
            }
          }
        });
        
        // Convert features Set to Array for each type
        Object.values(typeGroups).forEach(type => {
          type.features = Array.from(type.features);
        });
        
        setRoomTypes(Object.values(typeGroups));
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch room types');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRoomTypes();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return <Typography color="error">{error}</Typography>;

  // If no room types are found, display a message
  if (roomTypes.length === 0) {
    return (
      <div>
        <Typography variant="h4" className="page-title" sx={{ mb: 3 }}>
          Room Types
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            No room types found in the database. Please add rooms to see them listed here.
          </Typography>
        </Paper>
      </div>
    );
  }

  return (
    <div>
      <Typography variant="h4" className="page-title" sx={{ mb: 3 }}>
        Our Room Types
      </Typography>
      
      <Grid container spacing={3}>
        {roomTypes.map((roomType) => (
          <Grid item xs={12} md={6} lg={4} key={roomType.type}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: roomType.type === 'King' ? '#bbdefb' : 
                           roomType.type === 'Queen' ? '#c8e6c9' : '#fff9c4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h4" color="text.secondary">
                  {roomType.type} Room
                </Typography>
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  {roomType.type} Room
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Starting from ${roomType.minPrice}/night
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Up to {roomType.maxCapacity} guests
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Features:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {roomType.features.map((feature, index) => (
                    <Chip 
                      key={index} 
                      label={feature} 
                      size="small" 
                      variant="outlined" 
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Available Views:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {roomType.views.map((view, index) => (
                    <Chip 
                      key={index} 
                      label={view} 
                      size="small" 
                      color="primary" 
                    />
                  ))}
                </Box>
                
                <Typography variant="body2" paragraph>
                  {roomType.rooms.length} rooms available
                </Typography>
                
                <Button 
                  variant="contained" 
                  component={Link} 
                  to={`/rooms?type=${roomType.type}`}
                  sx={{ mt: 'auto' }}
                  fullWidth
                >
                  View {roomType.type} Rooms
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default RoomTypes;