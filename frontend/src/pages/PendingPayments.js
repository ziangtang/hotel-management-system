import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button
  // Remove Box if not used
} from '@mui/material';
import axios from 'axios';

function PendingPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/pending-payments');
        setPayments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch pending payments');
        setLoading(false);
        console.error(err);
      }
    };

    fetchPendingPayments();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Pending Payments
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        {payments.length === 0 ? (
          <Typography>No pending payments found.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Remaining Balance</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.payment_id}>
                    <TableCell>{payment.payment_id}</TableCell>
                    <TableCell>{payment.first_name} {payment.last_name}</TableCell>
                    <TableCell>${payment.total_amount}</TableCell>
                    <TableCell>${payment.remaining_balance}</TableCell>
                    <TableCell>
                      <Button 
                        variant="contained" 
                        size="small"
                        color="primary"
                      >
                        Process Payment
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </div>
  );
}

export default PendingPayments;