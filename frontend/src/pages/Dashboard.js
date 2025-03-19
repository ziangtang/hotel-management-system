import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalRooms: 0,
    totalCustomers: 0,
    totalReservations: 0
  });
  
  const [recentReservations, setRecentReservations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace mock data with API calls
        const hotelsResponse = await axios.get('http://localhost:5000/api/hotels');
        const roomsResponse = await axios.get('http://localhost:5000/api/rooms/available');
        const customersResponse = await axios.get('http://localhost:5000/api/customers');
        const reservationsResponse = await axios.get('http://localhost:5000/api/reservations');
        
        setStats({
          totalHotels: hotelsResponse.data.length,
          totalRooms: roomsResponse.data.length,
          totalCustomers: customersResponse.data.length,
          totalReservations: reservationsResponse.data.length
        });

        setRecentReservations(reservationsResponse.data.slice(0, 5).map(r => ({
          id: r.id,
          customer: `${r.first_name} ${r.last_name}`,
          hotel: r.hotel_name,
          room: r.room_number,
          checkIn: r.check_in_date,
          checkOut: r.check_out_date,
          status: r.status
        })));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Dashboard
      </Typography>
      
      <div className="dashboard-stats">
        <Card className="stat-card" sx={{ bgcolor: '#bbdefb', color: 'black' }}>
          <CardContent>
            <Typography variant="h3">{stats.totalHotels}</Typography>
            <Typography variant="h6">Hotels</Typography>
          </CardContent>
        </Card>
        
        <Card className="stat-card" sx={{ bgcolor: '#c8e6c9', color: 'black' }}>
          <CardContent>
            <Typography variant="h3">{stats.totalRooms}</Typography>
            <Typography variant="h6">Rooms</Typography>
          </CardContent>
        </Card>
        
        <Card className="stat-card" sx={{ bgcolor: '#fff9c4', color: 'black' }}>
          <CardContent>
            <Typography variant="h3">{stats.totalCustomers}</Typography>
            <Typography variant="h6">Customers</Typography>
          </CardContent>
        </Card>
        
        <Card className="stat-card" sx={{ bgcolor: '#ffcdd2', color: 'black' }}>
          <CardContent>
            <Typography variant="h3">{stats.totalReservations}</Typography>
            <Typography variant="h6">Reservations</Typography>
          </CardContent>
        </Card>
      </div>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Reservations
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Hotel</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Check In</TableCell>
                      <TableCell>Check Out</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.id}</TableCell>
                        <TableCell>{reservation.customer}</TableCell>
                        <TableCell>{reservation.hotel}</TableCell>
                        <TableCell>{reservation.room}</TableCell>
                        <TableCell>{reservation.checkIn}</TableCell>
                        <TableCell>{reservation.checkOut}</TableCell>
                        <TableCell>{reservation.status}</TableCell>
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
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to="/reservations"
                sx={{ mt: 2 }}
              >
                View All Reservations
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;