import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';

function CustomerDetail() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const [customerResponse, reservationsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/customers/${customerId}`),
          axios.get(`http://localhost:5000/api/reservations?customer_id=${customerId}`)
        ]);
        
        setCustomer(customerResponse.data);
        setReservations(reservationsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch customer data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!customer) {
    return <Alert severity="error">Customer not found</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Customer Details
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Personal Information</Typography>
            <Typography><strong>ID:</strong> {customer.id}</Typography>
            <Typography><strong>Name:</strong> {customer.first_name} {customer.last_name}</Typography>
            <Typography><strong>Email:</strong> {customer.email}</Typography>
            <Typography><strong>Phone:</strong> {customer.phone}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Address</Typography>
            <Typography>
              {customer.address || 'Address not provided'}
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/customers"
          >
            Back to Customers
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to={`/customers/${customerId}/edit`}
          >
            Edit
          </Button>
        </Box>
      </Paper>
      
      <Typography variant="h5" gutterBottom>
        Reservations
      </Typography>
      
      {reservations.length > 0 ? (
        <Paper>
          <List>
            {reservations.map((reservation) => (
              <React.Fragment key={reservation.id}>
                <ListItem 
                  button 
                  component={Link} 
                  to={`/reservations/${reservation.id}`}
                >
                  <ListItemText
                    primary={`Reservation #${reservation.id}`}
                    secondary={`Check-in: ${reservation.check_in_date} | Check-out: ${reservation.check_out_date} | Total: $${reservation.total_price}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Typography>No reservations found for this customer.</Typography>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to={`/reservations/new?customerId=${customerId}`}
        >
          Create New Reservation
        </Button>
      </Box>
    </div>
  );
}

export default CustomerDetail;