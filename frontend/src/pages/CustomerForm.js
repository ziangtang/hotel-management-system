import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';

function CustomerForm() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!customerId;
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/customers/${customerId}`);
          const customerData = response.data;
          
          // If street is already available, use it
          if (customerData.street) {
            setFormData(customerData);
          } else if (customerData.address) {
            // If only address is available, use it as street
            setFormData({
              ...customerData,
              street: customerData.address || ''
            });
          } else {
            setFormData(customerData);
          }
          
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch customer data');
          setLoading(false);
          console.error(err);
        }
      };

      fetchCustomer();
    }
  }, [customerId, isEditMode]);

  // Add a new state for real-time validation
  const [isValidating, setIsValidating] = useState(false);
  
  // Add a new state to track form validity
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Add a new function for validating individual fields
  const validateField = (name, value) => {
    let error = null;
    
    switch (name) {
      case 'first_name':
        if (!value.trim()) error = 'First name is required';
        break;
      case 'last_name':
        if (!value.trim()) error = 'Last name is required';
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value)) {
          error = 'Please enter a valid phone number (e.g., 123-456-7890)';
        }
        break;
      case 'street':
        if (!value.trim()) error = 'Street is required';
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return !error;
  };
  
  // Update the validateForm function to use validateField
  const validateForm = () => {
    // Set flag to enable real-time validation
    setIsValidating(true);
    
    // Validate all fields
    const fields = ['first_name', 'last_name', 'email', 'phone', 'street'];
    const errors = {};
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        errors[field] = validationErrors[field] || `Invalid ${field.replace('_', ' ')}`;
      }
    });
    
    setValidationErrors(errors);
    
    // Update form validity state
    const valid = Object.keys(errors).length === 0;
    setIsFormValid(valid);
    
    return valid;
  };
  
  // Update handleInputChange to restrict input for phone
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation rules for specific fields
    if (name === 'phone') {
      // Only allow digits, hyphens, parentheses, spaces and plus signs for phone
      const phoneRegex = /^[0-9()\-\s+]*$/;
      if (phoneRegex.test(value) || value === '') {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      // For other fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Perform real-time validation
    if (isValidating) {
      validateField(name, value);
      
      // After validating the current field, check if the entire form is valid
      setTimeout(() => {
        const fields = ['first_name', 'last_name', 'email', 'phone', 'street'];
        const formHasErrors = fields.some(field => {
          // For the current field, use the latest value
          const valueToCheck = field === name ? value : formData[field];
          // Check if this field has validation errors
          return !validateField(field, valueToCheck);
        });
        
        setIsFormValid(!formHasErrors);
      }, 0);
    }
  };
  
  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.Mui-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format the data properly for the backend
      const dataToSubmit = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.street.trim() // Use street as address
      };
      
      console.log('Sending customer data:', dataToSubmit);
      
      // If editing an existing customer
      if (customerId) {
        await axios.put(`http://localhost:5000/api/customers/${customerId}`, dataToSubmit);
        navigate(`/customers/${customerId}`);
      } else {
        // Creating a new customer
        const response = await axios.post('http://localhost:5000/api/customers', dataToSubmit);
        console.log('Customer created successfully:', response.data);
        navigate('/customers');
      }
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      
      // Display more specific error message from the backend if available
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           `Failed to ${customerId ? 'update' : 'add'} customer`;
      
      setError(errorMessage);
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
        {isEditMode ? 'Edit Customer' : 'New Customer'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* First name field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                error={!!validationErrors.first_name}
                helperText={validationErrors.first_name}
                placeholder="Enter first name"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                error={!!validationErrors.last_name}
                helperText={validationErrors.last_name}
                placeholder="Enter last name"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email || "e.g., john.doe@example.com"}
                placeholder="Enter email address"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone || "e.g., (123) 456-7890"}
                placeholder="Enter phone number"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Address"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                error={!!validationErrors.street}
                helperText={validationErrors.street}
                placeholder="Enter address"
              />
            </Grid>
            
            {/* Submit and cancel buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to={isEditMode ? `/customers/${customerId}` : '/customers'}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitting || (isValidating && !isFormValid) || 
                    // Also disable if any required field is empty
                    !formData.first_name.trim() || 
                    !formData.last_name.trim() || 
                    !formData.email.trim() || 
                    !formData.phone.trim() || 
                    !formData.street.trim()
                  }
                  onClick={(e) => {
                    if (!isValidating) {
                      setIsValidating(true);
                      if (!validateForm()) {
                        e.preventDefault();
                        // Scroll to the first error
                        const firstErrorField = document.querySelector('.Mui-error');
                        if (firstErrorField) {
                          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }
                  }}
                > 
                  {submitting ? <CircularProgress size={24} /> : (isEditMode ? 'Update' : 'Create')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Form validation message */}
      {((isValidating && !isFormValid) || 
        (!formData.first_name.trim() || 
         !formData.last_name.trim() || 
         !formData.email.trim() || 
         !formData.phone.trim() || 
         !formData.street.trim())) && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please fill in all required fields with valid information to continue.
        </Alert>
      )}
    </div>
  );
}

export default CustomerForm;