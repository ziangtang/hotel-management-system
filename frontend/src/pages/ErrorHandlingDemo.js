import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`validation-tabpanel-${index}`}
      aria-labelledby={`validation-tab-${index}`}
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

const ErrorHandlingDemo = () => {
  const [tabValue, setTabValue] = useState(0);
  const [validation, setValidation] = useState({
    reservationErrors: {
      customerIdError: false,
      roomIdError: false,
      dateError: false,
      overlapError: false,
      message: '',
      showSuccess: false
    },
    sqlErrors: {
      syntaxError: false,
      permissionError: false,
      queryError: false,
      message: '',
      showSuccess: false
    },
    triggerErrors: {
      invalidBookingError: false,
      invalidGuestError: false,
      message: '',
      showSuccess: false
    }
  });
  
  const [formData, setFormData] = useState({
    reservation: {
      customerId: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: ''
    },
    sqlQuery: {
      query: ''
    },
    cancellation: {
      bookingId: '',
      guestId: '',
      refundAmount: ''
    }
  });

  const handleReservationInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      reservation: {
        ...prev.reservation,
        [name]: value
      }
    }));
    
    // Reset validation errors
    setValidation(prev => ({
      ...prev,
      reservationErrors: {
        ...prev.reservationErrors,
        customerIdError: false,
        roomIdError: false,
        dateError: false,
        overlapError: false,
        message: '',
        showSuccess: false
      }
    }));
  };
  
  const handleSqlQueryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      sqlQuery: {
        query: e.target.value
      }
    }));
    
    // Reset validation errors
    setValidation(prev => ({
      ...prev,
      sqlErrors: {
        syntaxError: false,
        permissionError: false,
        queryError: false,
        message: '',
        showSuccess: false
      }
    }));
  };
  
  const handleCancellationInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      cancellation: {
        ...prev.cancellation,
        [name]: value
      }
    }));
    
    // Reset validation errors
    setValidation(prev => ({
      ...prev,
      triggerErrors: {
        invalidBookingError: false,
        invalidGuestError: false,
        message: '',
        showSuccess: false
      }
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to demonstrate reservation validation errors
  const testReservationValidation = async () => {
    const { customerId, roomId, checkInDate, checkOutDate } = formData.reservation;
    let errors = {
      customerIdError: false,
      roomIdError: false,
      dateError: false,
      overlapError: false,
      message: '',
      showSuccess: false
    };
    
    // Basic validation
    if (!customerId) {
      errors.customerIdError = true;
      errors.message = 'Customer ID is required';
      setValidation(prev => ({ ...prev, reservationErrors: errors }));
      return;
    }
    
    if (!roomId) {
      errors.roomIdError = true;
      errors.message = 'Room ID is required';
      setValidation(prev => ({ ...prev, reservationErrors: errors }));
      return;
    }
    
    if (!checkInDate || !checkOutDate) {
      errors.dateError = true;
      errors.message = 'Check-in and check-out dates are required';
      setValidation(prev => ({ ...prev, reservationErrors: errors }));
      return;
    }
    
    // Date validation
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkOut <= checkIn) {
      errors.dateError = true;
      errors.message = 'Check-out date must be after check-in date';
      setValidation(prev => ({ ...prev, reservationErrors: errors }));
      return;
    }
    
    // Make API call to test server-side validation
    try {
      await axios.post(`${API_URL}/reservations`, {
        customer_id: customerId,
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate
      });
      
      // If successful, show success message
      setValidation(prev => ({
        ...prev,
        reservationErrors: {
          ...errors,
          showSuccess: true,
          message: 'Reservation created successfully!'
        }
      }));
    } catch (err) {
      console.error('Error creating reservation:', err);
      
      // Handle different error types
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.error || 'An error occurred';
        
        if (errorMessage.includes('Guest does not exist')) {
          errors.customerIdError = true;
        } else if (errorMessage.includes('Room does not exist')) {
          errors.roomIdError = true;
        } else if (errorMessage.includes('already booked')) {
          errors.overlapError = true;
        }
        
        errors.message = errorMessage;
        setValidation(prev => ({ ...prev, reservationErrors: errors }));
      } else {
        errors.message = 'Failed to connect to the server';
        setValidation(prev => ({ ...prev, reservationErrors: errors }));
      }
    }
  };
  
  // Function to demonstrate SQL query validation errors
  const testSqlQueryValidation = async () => {
    const { query } = formData.sqlQuery;
    let errors = {
      syntaxError: false,
      permissionError: false,
      queryError: false,
      message: '',
      showSuccess: false
    };
    
    // Basic validation
    if (!query) {
      errors.queryError = true;
      errors.message = 'SQL query is required';
      setValidation(prev => ({ ...prev, sqlErrors: errors }));
      return;
    }
    
    // Check if trying to run non-SELECT query
    if (!query.trim().toUpperCase().startsWith('SELECT')) {
      errors.permissionError = true;
      errors.message = 'Only SELECT queries are allowed for security reasons';
      setValidation(prev => ({ ...prev, sqlErrors: errors }));
      return;
    }
    
    // Make API call to test server-side validation
    try {
      await axios.post(`${API_URL}/execute-query`, { query });
      
      // If successful, show success message
      setValidation(prev => ({
        ...prev,
        sqlErrors: {
          ...errors,
          showSuccess: true,
          message: 'Query executed successfully!'
        }
      }));
    } catch (err) {
      console.error('Error executing query:', err);
      
      // Handle different error types
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.error || 'An error occurred';
        
        if (errorMessage.includes('syntax')) {
          errors.syntaxError = true;
        } else if (errorMessage.includes('permission') || errorMessage.includes('security')) {
          errors.permissionError = true;
        } else {
          errors.queryError = true;
        }
        
        errors.message = errorMessage;
        setValidation(prev => ({ ...prev, sqlErrors: errors }));
      } else {
        errors.queryError = true;
        errors.message = 'Failed to connect to the server';
        setValidation(prev => ({ ...prev, sqlErrors: errors }));
      }
    }
  };
  
  // Function to demonstrate trigger validation errors
  const testTriggerValidation = async () => {
    const { bookingId, guestId, refundAmount } = formData.cancellation;
    let errors = {
      invalidBookingError: false,
      invalidGuestError: false,
      message: '',
      showSuccess: false
    };
    
    // Basic validation
    if (!bookingId) {
      errors.invalidBookingError = true;
      errors.message = 'Booking ID is required';
      setValidation(prev => ({ ...prev, triggerErrors: errors }));
      return;
    }
    
    if (!guestId) {
      errors.invalidGuestError = true;
      errors.message = 'Guest ID is required';
      setValidation(prev => ({ ...prev, triggerErrors: errors }));
      return;
    }
    
    if (!refundAmount) {
      errors.message = 'Refund amount is required';
      setValidation(prev => ({ ...prev, triggerErrors: errors }));
      return;
    }
    
    // Make API call to test server-side validation
    try {
      await axios.post(`${API_URL}/cancellations`, {
        bookingId,
        guestId,
        refundAmount
      });
      
      // If successful, show success message
      setValidation(prev => ({
        ...prev,
        triggerErrors: {
          ...errors,
          showSuccess: true,
          message: 'Cancellation created successfully! Trigger executed.'
        }
      }));
    } catch (err) {
      console.error('Error creating cancellation:', err);
      
      // Handle different error types
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.error || 'An error occurred';
        
        if (errorMessage.includes('Booking does not exist')) {
          errors.invalidBookingError = true;
        } else if (errorMessage.includes('Guest does not exist')) {
          errors.invalidGuestError = true;
        }
        
        errors.message = errorMessage;
        setValidation(prev => ({ ...prev, triggerErrors: errors }));
      } else {
        errors.message = 'Failed to connect to the server';
        setValidation(prev => ({ ...prev, triggerErrors: errors }));
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <Typography variant="h4" gutterBottom>Error Handling Demonstration</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This page demonstrates how the application handles various types of input errors
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="validation tabs"
        >
          <Tab label="Reservation Validation" id="validation-tab-0" />
          <Tab label="SQL Query Validation" id="validation-tab-1" />
          <Tab label="Trigger Validation" id="validation-tab-2" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Paper elevation={2}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Create Reservation with Validation</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box component="form">
              <TextField
                label="Customer ID"
                name="customerId"
                value={formData.reservation.customerId}
                onChange={handleReservationInputChange}
                error={validation.reservationErrors.customerIdError}
                helperText={validation.reservationErrors.customerIdError ? 
                  "Invalid Customer ID. Customer must exist in the database." : ""}
                placeholder="Enter Customer ID (e.g., 123456)"
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Room ID"
                name="roomId"
                value={formData.reservation.roomId}
                onChange={handleReservationInputChange}
                error={validation.reservationErrors.roomIdError}
                helperText={validation.reservationErrors.roomIdError ? 
                  "Invalid Room ID. Room must exist in the database." : ""}
                placeholder="Enter Room ID (e.g., 101)"
                fullWidth
                margin="normal"
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Check-in Date"
                    type="date"
                    name="checkInDate"
                    value={formData.reservation.checkInDate}
                    onChange={handleReservationInputChange}
                    error={validation.reservationErrors.dateError}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Check-out Date"
                    type="date"
                    name="checkOutDate"
                    value={formData.reservation.checkOutDate}
                    onChange={handleReservationInputChange}
                    error={validation.reservationErrors.dateError}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              
              {validation.reservationErrors.dateError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Date Error: Check-out date must be after check-in date.
                </Alert>
              )}
              
              {validation.reservationErrors.overlapError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Booking Conflict: The selected room is already booked for these dates.
                </Alert>
              )}
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={testReservationValidation}
                sx={{ mt: 3 }}
              >
                Test Reservation Validation
              </Button>
              
              {validation.reservationErrors.message && !validation.reservationErrors.showSuccess && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {validation.reservationErrors.message}
                </Alert>
              )}
              
              {validation.reservationErrors.showSuccess && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  {validation.reservationErrors.message}
                </Alert>
              )}
            </Box>
          </Box>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={2}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">SQL Query with Validation</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box component="form">
              <TextField
                label="SQL Query"
                multiline
                rows={5}
                value={formData.sqlQuery.query}
                onChange={handleSqlQueryChange}
                error={validation.sqlErrors.syntaxError || validation.sqlErrors.permissionError}
                helperText={
                  validation.sqlErrors.syntaxError 
                    ? "SQL Syntax Error. Please check your query syntax."
                    : validation.sqlErrors.permissionError
                      ? "Permission Error. Only SELECT queries are allowed."
                      : ""
                }
                placeholder="Enter SQL query (e.g., SELECT * FROM BOOKING)"
                fullWidth
                margin="normal"
              />
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={testSqlQueryValidation}
                sx={{ mt: 2 }}
              >
                Test SQL Validation
              </Button>
              
              {validation.sqlErrors.message && !validation.sqlErrors.showSuccess && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {validation.sqlErrors.message}
                </Alert>
              )}
              
              {validation.sqlErrors.showSuccess && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  {validation.sqlErrors.message}
                </Alert>
              )}
              
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Valid Query Examples:</Typography>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemText primary="SELECT * FROM BOOKING" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="SELECT * FROM GUEST WHERE GusID = 100001" />
                  </ListItem>
                </List>
              </Alert>
              
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Invalid Query Examples:</Typography>
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemText primary="INSERT INTO BOOKING VALUES (...)" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="DELETE FROM GUEST WHERE GusID = 100001" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="DROP TABLE BOOKING" />
                  </ListItem>
                </List>
              </Alert>
            </Box>
          </Box>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Paper elevation={2}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Cancellation Trigger with Validation</Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box component="form">
              <TextField
                label="Booking ID"
                name="bookingId"
                value={formData.cancellation.bookingId}
                onChange={handleCancellationInputChange}
                error={validation.triggerErrors.invalidBookingError}
                helperText={validation.triggerErrors.invalidBookingError ? 
                  "Invalid Booking ID. Booking must exist in the database." : ""}
                placeholder="Enter Booking ID (must exist in database)"
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Guest ID"
                name="guestId"
                value={formData.cancellation.guestId}
                onChange={handleCancellationInputChange}
                error={validation.triggerErrors.invalidGuestError}
                helperText={validation.triggerErrors.invalidGuestError ? 
                  "Invalid Guest ID. Guest must exist in the database." : ""}
                placeholder="Enter Guest ID (must exist in database)"
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Refund Amount"
                type="number"
                name="refundAmount"
                value={formData.cancellation.refundAmount}
                onChange={handleCancellationInputChange}
                placeholder="Enter refund amount"
                fullWidth
                margin="normal"
                inputProps={{ step: "0.01" }}
              />
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={testTriggerValidation}
                sx={{ mt: 2 }}
              >
                Test Trigger Validation
              </Button>
              
              {validation.triggerErrors.message && !validation.triggerErrors.showSuccess && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {validation.triggerErrors.message}
                </Alert>
              )}
              
              {validation.triggerErrors.showSuccess && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  {validation.triggerErrors.message}
                </Alert>
              )}
            </Box>
          </Box>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default ErrorHandlingDemo; 