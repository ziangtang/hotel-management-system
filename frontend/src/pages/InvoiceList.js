import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/invoices');
        setInvoices(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch invoices');
        setLoading(false);
        console.error(err);
      }
    };

    fetchInvoices();
  }, []);

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

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Invoices
      </Typography>
      
      {invoices.length > 0 ? (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Booking ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoice_number}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.booking_id}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.booking_date}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small" 
                      component={Link} 
                      to={`/invoices/${invoice.invoice_number}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No invoices found.</Typography>
      )}
    </div>
  );
}

export default InvoiceList;