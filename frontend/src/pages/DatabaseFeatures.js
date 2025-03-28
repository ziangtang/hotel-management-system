import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DatabaseFeatures = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [reservationLengths, setReservationLengths] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [showTriggerDemo, setShowTriggerDemo] = useState(false);
  const [cancellationData, setCancellationData] = useState({
    bookingId: '',
    guestId: '',
    refundAmount: '',
    cancellationDate: new Date().toISOString().split('T')[0]
  });
  const [triggeredBooking, setTriggeredBooking] = useState(null);
  const [loading, setLoading] = useState({
    pendingPayments: false,
    reservationLengths: false,
    triggerDemo: false,
    sampleData: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch pending payments (demonstrates VIEW)
  useEffect(() => {
    const fetchPendingPayments = async () => {
      setLoading(prev => ({ ...prev, pendingPayments: true }));
      try {
        const response = await axios.get(`${API_URL}/pending-payments`);
        if (response.data.success) {
          setPendingPayments(response.data.payments);
        }
      } catch (err) {
        setError('Failed to load pending payments');
        console.error(err);
      } finally {
        setLoading(prev => ({ ...prev, pendingPayments: false }));
      }
    };

    fetchPendingPayments();
  }, []);

  // Fetch reservation lengths (demonstrates FUNCTION)
  const fetchReservationLengths = async () => {
    setLoading(prev => ({ ...prev, reservationLengths: true }));
    try {
      const response = await axios.get(`${API_URL}/reservation-lengths`);
      if (response.data.success) {
        setReservationLengths(response.data.reservation_lengths);
        // Save diagnostics if available
        if (response.data.diagnostics) {
          setDiagnostics(response.data.diagnostics);
        }
      }
    } catch (err) {
      setError('Failed to load reservation lengths');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, reservationLengths: false }));
    }
  };

  useEffect(() => {
    fetchReservationLengths();
  }, []);

  // Create sample data for testing
  const createSampleData = async () => {
    setLoading(prev => ({ ...prev, sampleData: true }));
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/sample-data`);
      if (response.data.success) {
        setSuccess('Sample data created successfully!');
        // Refresh both data displays
        fetchReservationLengths();
        const paymentsResponse = await axios.get(`${API_URL}/pending-payments`);
        if (paymentsResponse.data.success) {
          setPendingPayments(paymentsResponse.data.payments);
        }
      }
    } catch (err) {
      setError('Failed to create sample data: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, sampleData: false }));
    }
  };

  // Function to handle cancellation input changes
  const handleCancellationChange = (e) => {
    const { name, value } = e.target;
    setCancellationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to demonstrate trigger by submitting a cancellation
  const demonstrateTrigger = async () => {
    setLoading(prev => ({ ...prev, triggerDemo: true }));
    setError(null);
    setSuccess(null);
    
    try {
      // First, create a cancellation
      const response = await axios.post(`${API_URL}/cancellations`, cancellationData);
      
      if (response.data.success) {
        setSuccess('Cancellation created! Trigger should have updated the booking.');
        
        // Now fetch the booking to see if the trigger worked
        const bookingResponse = await axios.get(`${API_URL}/reservations/${cancellationData.bookingId}`);
        setTriggeredBooking(bookingResponse.data);
        
        // Reset form
        setCancellationData({
          bookingId: '',
          guestId: '',
          refundAmount: '',
          cancellationDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to demonstrate trigger');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, triggerDemo: false }));
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <Typography variant="h4" gutterBottom>Database Features Demonstration</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        View demonstrations of database functions, views, and triggers
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          <strong>Error:</strong> {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={createSampleData}
          disabled={loading.sampleData}
          sx={{ mx: 2 }}
        >
          {loading.sampleData ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
              Creating Sample Data...
            </>
          ) : (
            'Create Sample Data for Testing'
          )}
        </Button>
        
        <Button 
          variant="outlined"
          onClick={fetchReservationLengths}
          disabled={loading.reservationLengths}
          sx={{ mx: 2 }}
        >
          Refresh Data
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ mb: 4 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">VIEW Demonstration: PENDING_PMT</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography paragraph>
                This demonstrates the <code>PENDING_PMT</code> database view which shows all payments with remaining balances.
              </Typography>
              
              {loading.pendingPayments ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Loading pending payments...</Typography>
                </Box>
              ) : pendingPayments.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Payment ID</TableCell>
                        <TableCell>Guest ID</TableCell>
                        <TableCell>Total Price</TableCell>
                        <TableCell>Remaining Balance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingPayments.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>{payment.PayID}</TableCell>
                          <TableCell>{payment.GusID}</TableCell>
                          <TableCell>${parseFloat(payment.Total_Price).toFixed(2)}</TableCell>
                          <TableCell>${parseFloat(payment.Remain_bal).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No pending payments found.</Alert>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ mb: 4 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">FUNCTION Demonstration: STAY_LEN</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography paragraph>
                This demonstrates the <code>STAY_LEN</code> function which calculates the length of stay in days between check-in and check-out dates.
              </Typography>
              
              {loading.reservationLengths ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Loading reservation lengths...</Typography>
                </Box>
              ) : reservationLengths.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Booking ID</TableCell>
                        <TableCell>Length of Stay (Days)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reservationLengths.map((reservation, index) => (
                        <TableRow key={index}>
                          <TableCell>{reservation.BookID}</TableCell>
                          <TableCell>{reservation.No_of_days}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No reservations found. Click "Create Sample Data" to generate test data.
                </Alert>
              )}

              {/* Show diagnostics info for debugging */}
              {diagnostics && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Diagnostics Information:</Typography>
                  <Typography variant="body2">Function exists: {diagnostics.function_exists ? "Yes" : "No"}</Typography>
                  <Typography variant="body2">Bookings with valid dates: {diagnostics.bookings_with_dates}</Typography>
                  {diagnostics.main_query_error && (
                    <Typography variant="body2" color="error">Error: {diagnostics.main_query_error}</Typography>
                  )}
                  {diagnostics.sample_booking_created && (
                    <Typography variant="body2" color="success.main">Created sample booking for testing</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ mb: 4 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">TRIGGER Demonstration: UPDATE_ROOM_ON_CANCELLATION</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                This trigger automatically updates the room number to 0000 when a booking is canceled
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {!showTriggerDemo ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography paragraph>
                    Click the button below to demonstrate the trigger functionality
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setShowTriggerDemo(true)}
                  >
                    Show Trigger Demo
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box component="form">
                      <TextField
                        label="Booking ID"
                        type="number"
                        name="bookingId"
                        value={cancellationData.bookingId}
                        onChange={handleCancellationChange}
                        placeholder="Enter booking ID to cancel"
                        fullWidth
                        margin="normal"
                      />
                      
                      <TextField
                        label="Guest ID"
                        type="number"
                        name="guestId"
                        value={cancellationData.guestId}
                        onChange={handleCancellationChange}
                        placeholder="Enter guest ID"
                        fullWidth
                        margin="normal"
                      />
                      
                      <TextField
                        label="Refund Amount"
                        type="number"
                        name="refundAmount"
                        value={cancellationData.refundAmount}
                        onChange={handleCancellationChange}
                        placeholder="Enter refund amount"
                        fullWidth
                        margin="normal"
                        inputProps={{ step: "0.01" }}
                      />
                      
                      <TextField
                        label="Cancellation Date"
                        type="date"
                        name="cancellationDate"
                        value={cancellationData.cancellationDate}
                        onChange={handleCancellationChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                      />
                      
                      <Button 
                        variant="contained" 
                        color="error"
                        onClick={demonstrateTrigger}
                        disabled={
                          loading.triggerDemo || 
                          !cancellationData.bookingId || 
                          !cancellationData.guestId
                        }
                        sx={{ mt: 2 }}
                      >
                        {loading.triggerDemo ? (
                          <>
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                            Processing...
                          </>
                        ) : (
                          'Cancel Booking & Trigger Room Update'
                        )}
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    {triggeredBooking && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Booking After Trigger Execution:
                        </Typography>
                        <Alert severity="success">
                          <Typography><strong>Booking ID:</strong> {triggeredBooking.id}</Typography>
                          <Typography><strong>Room Number (should be 0000):</strong> {triggeredBooking.room_no}</Typography>
                          <Typography sx={{ mt: 1 }}>
                            The trigger has updated the room number to 0000, marking it as available for new bookings.
                          </Typography>
                        </Alert>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DatabaseFeatures; 