import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';

function ReviewForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const customerId = queryParams.get('customerId');
  
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: customerId || '',
    rating: 5,
    comments: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        setCustomers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch customers');
        setLoading(false);
        console.error(err);
      }
    };

    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRatingChange = (event, newValue) => {
    setFormData({
      ...formData,
      rating: newValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await axios.post('http://localhost:5000/api/reviews', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Submit Review
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  required
                  disabled={!!customerId}
                >
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name} ({customer.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography component="legend">Rating</Typography>
              <Rating
                name="rating"
                value={formData.rating}
                onChange={handleRatingChange}
                precision={1}
                size="large"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                name="comments"
                multiline
                rows={4}
                value={formData.comments}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit Review'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
}

export default ReviewForm;