import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid
} from '@mui/material';
import axios from 'axios';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const location = useLocation();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Replace mock data with actual API call
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
  }, [location]); // Re-fetch when location changes

  const handleAddClick = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: ''
    });
    setDialogOpen(true);
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || customer.street || ''
    });
    setEditDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Only allow digits, hyphens, parentheses, spaces for phone
      const phoneRegex = /^[0-9()\-\s+]*$/;
      if (phoneRegex.test(value) || value === '') {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddSubmit = async () => {
    try {
      // Use actual API call instead of mock data
      const response = await axios.post('http://localhost:5000/api/customers', formData);
      const newCustomer = response.data;
      
      setCustomers([...customers, newCustomer]);
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to add customer:', err);
      // Show error message to user
      setError('Failed to add customer: ' + err.message);
    }
  };

  const handleEditSubmit = async () => {
    try {
      // Use actual API call
      await axios.put(`http://localhost:5000/api/customers/${selectedCustomer.id}`, formData);
      
      // Update local state
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id ? { ...c, ...formData } : c
      ));
      setEditDialogOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Failed to update customer:', err);
      setError('Failed to update customer: ' + err.message);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h4" className="page-title">
        Customers
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleAddClick}
        sx={{ mb: 3 }}
      >
        Add New Customer
      </Button>
      
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.first_name} {customer.last_name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.address || 'N/A'}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleEditClick(customer)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    component={Link}
                    to={`/reservations/new?customerId=${customer.id}`}
                  >
                    New Reservation
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Customer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="first_name"
                label="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="last_name"
                label="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="first_name"
                label="First Name"
                value={formData.first_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="last_name"
                label="Last Name"
                value={formData.last_name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CustomerList;