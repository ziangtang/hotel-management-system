import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';

function InvoiceDetail() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/invoices/${invoiceId}`);
        setInvoice(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch invoice details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

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

  if (!invoice) {
    return <Alert severity="error">Invoice not found</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Invoice #{invoice.invoice_number}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Invoice Information</Typography>
            <Typography><strong>Invoice Number:</strong> {invoice.invoice_number}</Typography>
            <Typography><strong>Booking ID:</strong> {invoice.booking_id}</Typography>
            <Typography><strong>Booking Date:</strong> {invoice.booking_date}</Typography>
            <Typography><strong>Check-in Date:</strong> {invoice.check_in_date}</Typography>
            <Typography><strong>Check-out Date:</strong> {invoice.check_out_date}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}><strong>Total Amount:</strong> ${invoice.total_amount.toFixed(2)}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Customer Information</Typography>
            <Typography><strong>Name:</strong> {invoice.customer_name}</Typography>
            <Typography><strong>Email:</strong> {invoice.customer_email}</Typography>
            <Typography><strong>Phone:</strong> {invoice.customer_phone}</Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Payment History
        </Typography>
        
        {invoice.payments && invoice.payments.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell>Remaining Balance</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>${payment.amount_paid.toFixed(2)}</TableCell>
                    <TableCell>${payment.remaining_balance.toFixed(2)}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{payment.is_fully_paid ? 'Fully Paid' : 'Partially Paid'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>No payment records found.</Typography>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/invoices"
          >
            Back to Invoices
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to={`/reservations/${invoice.booking_id}/payment`}
          >
            Process Payment
          </Button>
        </Box>
      </Paper>
    </div>
  );
}

export default InvoiceDetail;