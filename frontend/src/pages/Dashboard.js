import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';

function Dashboard() {
  const [stats, setStats] = useState({
    hotels: 5,
    rooms: 15,
    customers: 7,
    reservations: 8
  });
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all necessary data
        const [roomsResponse, customersResponse, reservationsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/rooms'),
          axios.get('http://localhost:5000/api/customers'),
          axios.get('http://localhost:5000/api/reservations')
        ]);
        
        // Create a map of customers for quick lookup
        const customersMap = {};
        customersResponse.data.forEach(customer => {
          customersMap[customer.id] = customer;
        });
        
        // Create a map of rooms for quick lookup
        const roomsMap = {};
        roomsResponse.data.forEach(room => {
          roomsMap[room.id] = room;
        });
        
        // Get only the 5 most recent reservations
        const recentReservations = reservationsResponse.data.slice(0, 5);
        
        // Enhance reservation data with customer and room information
        const enhancedReservations = recentReservations.map(reservation => {
          const customer = customersMap[reservation.customer_id];
          const room = roomsMap[reservation.room_id];
          
          return {
            ...reservation,
            customer_name: customer ? 
              `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown',
            room_number: room ? (room.room_no || room.id) : reservation.room_id,
            // Use city from reservation if available, otherwise "N/A"
            location: reservation.city || 'N/A',
            // Format payment information
            payment: reservation.total_price ? `$${reservation.total_price}` : 'N/A',
            payment_status: reservation.total_price ? 'Paid' : 'Pending',
            payment_method: 'Credit Card'
          };
        });
        
        setRecentReservations(enhancedReservations);
        
        // Update stats with actual counts
        setStats({
          rooms: roomsResponse.data.length,
          customers: customersResponse.data.length,
          reservations: reservationsResponse.data.length,
          payments: reservationsResponse.data.length // Using reservations count for payments
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title" sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      
      {/* Dashboard Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#bbdefb', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3">{stats.payments}</Typography>
              <Typography variant="body1">Payments</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#c8e6c9', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3">{stats.rooms}</Typography>
              <Typography variant="body1">Rooms</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff9c4', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3">{stats.customers}</Typography>
              <Typography variant="body1">Customers</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffcdd2', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3">{stats.reservations}</Typography>
              <Typography variant="body1">Reservations</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Reservations */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Recent Reservations
      </Typography>
      
      <TableContainer component={Paper} className="table-container" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Payment</TableCell>
            
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentReservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.id}</TableCell>
                <TableCell>{reservation.customer_name}</TableCell>
                <TableCell>{reservation.payment}</TableCell>
              
                <TableCell>{reservation.check_in_date}</TableCell>
                <TableCell>{reservation.check_out_date}</TableCell>
                <TableCell>{reservation.location}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component={Link} 
                    to={`/reservations/${reservation.id}`}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          variant="contained" 
          component={Link} 
          to="/reservations"
        >
          View All Reservations
        </Button>
      </Box>
    </div>
  );
}

export default Dashboard;