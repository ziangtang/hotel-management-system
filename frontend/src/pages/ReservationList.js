import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import axios from 'axios';

function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Fetch all reservations
        const response = await axios.get('http://localhost:5000/api/reservations');
        
        // Create a map to store customer data for faster lookup
        const customerMap = {};
        const customersResponse = await axios.get('http://localhost:5000/api/customers');
        customersResponse.data.forEach(customer => {
          customerMap[customer.id] = customer;
        });
        
        // Create a map to store room data for faster lookup
        const roomMap = {};
        const roomsResponse = await axios.get('http://localhost:5000/api/rooms');
        roomsResponse.data.forEach(room => {
          roomMap[room.id] = room;
        });
        
        // Enhance reservation data with customer and room information
        const enhancedReservations = response.data.map(reservation => {
          const customer = customerMap[reservation.customer_id];
          const room = roomMap[reservation.room_id];
          
          return {
            ...reservation,
            customer_name: customer ? 
              `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Unknown',
            room_number: room ? (room.room_no || room.id) : reservation.room_id,
            payment: reservation.total_price ? `$${reservation.total_price}` : 'N/A'
          };
        });
        
        setReservations(enhancedReservations);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch reservations');
        setLoading(false);
        console.error(err);
      }
    };

    fetchReservations();
  }, []);

  const handleDeleteClick = (reservation) => {
    setReservationToDelete(reservation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Replace mock deletion with actual API call
      await axios.delete(`http://localhost:5000/api/reservations/${reservationToDelete.id}`);
      
      // Update local state
      setReservations(reservations.filter(r => r.id !== reservationToDelete.id));
      setDeleteDialogOpen(false);
      setReservationToDelete(null);
    } catch (err) {
      console.error('Failed to delete reservation:', err);
      // Show error message to user
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setReservationToDelete(null);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Update the table header and row rendering
  return (
    <div>
      <Typography variant="h4" className="page-title">
        Reservations
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        component={Link} 
        to="/reservations/new"
        sx={{ mb: 3 }}
      >
        New Reservation
      </Button>
      
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.id}</TableCell>
                <TableCell>{reservation.customer_name}</TableCell>
                <TableCell>{reservation.payment}</TableCell>
                <TableCell>{reservation.room_number}</TableCell>
                <TableCell>{reservation.check_in_date}</TableCell>
                <TableCell>{reservation.check_out_date}</TableCell>
                <TableCell>
                  <Chip 
                    label={reservation.status || 'Confirmed'} 
                    color={
                      (reservation.status === 'Confirmed' || !reservation.status) ? 'primary' : 
                      reservation.status === 'Checked In' ? 'success' : 
                      reservation.status === 'Checked Out' ? 'default' : 
                      'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component={Link} 
                    to={`/reservations/${reservation.id}`}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    size="small"
                    onClick={() => handleDeleteClick(reservation)}
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Cancel Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the reservation for {reservationToDelete?.customer_name} (Room {reservationToDelete?.room_number})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>No</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Yes, Cancel Reservation
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ReservationList;