import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewCustomer = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Validate a field
  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          errorMessage = 'First name is required';
        }
        break;
      case 'last_name':
        if (!value.trim()) {
          errorMessage = 'Last name is required';
        }
        break;
      case 'email':
        if (!value.trim()) {
          errorMessage = 'Email is required';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          errorMessage = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          errorMessage = 'Phone number is required';
        } else if (!/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value)) {
          errorMessage = 'Please enter a valid phone number (e.g., 123-456-7890)';
        }
        break;
      case 'city':
        if (value.trim() && !/^[A-Za-z\s]+$/.test(value)) {
          errorMessage = 'City must contain only letters and spaces';
        }
        break;
      case 'state':
        if (value.trim() && !/^[A-Za-z]{2}$/.test(value.toUpperCase())) {
          errorMessage = 'State must be exactly 2 letters (e.g., NY, CA)';
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
    
    return !errorMessage;
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Apply validation rules for specific fields
    if (name === 'phone') {
      // Only allow digits, hyphens, parentheses, spaces and plus signs for phone
      const phoneRegex = /^[0-9()\-\s+]*$/;
      if (phoneRegex.test(value) || value === '') {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else if (name === 'state') {
      // Only allow alphabetic characters for state (2 letters max)
      const stateRegex = /^[A-Za-z]*$/;
      if (value.length <= 2 && (stateRegex.test(value) || value === '')) {
        setFormData({
          ...formData,
          [name]: value.toUpperCase() // Convert state to uppercase
        });
      }
    } else if (name === 'city') {
      // Only allow alphabetic characters and spaces for city
      const cityRegex = /^[A-Za-z\s]*$/;
      if (cityRegex.test(value) || value === '') {
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
    
    // Validate the field
    validateField(name, value);
  };
  
  // Validate the entire form
  const validateForm = () => {
    const fieldNames = ['first_name', 'last_name', 'email', 'phone', 'city', 'state'];
    let isValid = true;
    
    fieldNames.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields on submission
    const requiredFields = ['first_name', 'last_name', 'email', 'phone'];
    let hasErrors = false;
    
    // Check each required field and set validation errors
    requiredFields.forEach(field => {
      if (!formData[field] || !formData[field].trim()) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: `${field.replace('_', ' ')} is required`
        }));
        hasErrors = true;
      }
    });
    
    // Additional validation for email and phone formats
    if (formData.email && formData.email.trim() && 
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      setValidationErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
      hasErrors = true;
    }
    
    if (formData.phone && formData.phone.trim() && 
        !/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(formData.phone)) {
      setValidationErrors(prev => ({
        ...prev,
        phone: 'Please enter a valid phone number (e.g., 123-456-7890)'
      }));
      hasErrors = true;
    }
    
    // Validate the entire form
    if (!validateForm() || hasErrors) {
      setError('Please fill in all required fields correctly');
      return;
    }
    
    try {
      setSubmitting(true);
      
      console.log("Sending customer data:", formData);
      
      const response = await fetch('http://localhost:5000/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer');
      }
      
      console.log("Customer created successfully:", data);
      setSubmitting(false);
      setSuccess(true);
      setCustomerId(data.id);
      
      // Show success message for a moment before redirecting
      setTimeout(() => {
        // Clear form or redirect
        if (onSuccess) {
          onSuccess(data.id);
        } else {
          // Redirect to customers list
          navigate('/customers', { replace: true });
        }
      }, 1500);
    } catch (error) {
      console.error('Error creating customer:', error);
      setError(error.message);
      setSubmitting(false);
    }
  };
  
  // Form JSX
  return (
    <div className="container mt-4">
      <h2>Add New Customer</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Customer added successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="first_name" className="form-label">First Name *</label>
          <input
            type="text"
            className={`form-control ${validationErrors.first_name ? 'is-invalid' : ''}`}
            id="first_name"
            name="first_name"
            value={formData.first_name || ''}
            onChange={handleChange}
            onBlur={() => validateField('first_name', formData.first_name)}
            required
          />
          {validationErrors.first_name && 
            <div className="text-danger">{validationErrors.first_name}</div>
          }
        </div>
        
        <div className="mb-3">
          <label htmlFor="last_name" className="form-label">Last Name *</label>
          <input
            type="text"
            className={`form-control ${validationErrors.last_name ? 'is-invalid' : ''}`}
            id="last_name"
            name="last_name"
            value={formData.last_name || ''}
            onChange={handleChange}
            onBlur={() => validateField('last_name', formData.last_name)}
            required
          />
          {validationErrors.last_name && 
            <div className="text-danger">{validationErrors.last_name}</div>
          }
        </div>
        
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email *</label>
          <input
            type="email"
            className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            onBlur={() => validateField('email', formData.email)}
            required
          />
          {validationErrors.email && 
            <div className="text-danger">{validationErrors.email}</div>
          }
        </div>
        
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone *</label>
          <input
            type="tel"
            className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            onBlur={() => validateField('phone', formData.phone)}
            placeholder="e.g. (123) 456-7890"
            required
          />
          {validationErrors.phone && 
            <div className="text-danger">{validationErrors.phone}</div>
          }
        </div>
        
        <div className="mb-3">
          <label htmlFor="street" className="form-label">Street</label>
          <input
            type="text"
            className="form-control"
            id="street"
            name="street"
            value={formData.street || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="city" className="form-label">City</label>
          <input
            type="text"
            className={`form-control ${validationErrors.city ? 'is-invalid' : ''}`}
            id="city"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            onBlur={() => validateField('city', formData.city)}
          />
          {validationErrors.city && 
            <div className="text-danger">{validationErrors.city}</div>
          }
        </div>
        
        <div className="mb-3">
          <label htmlFor="state" className="form-label">State</label>
          <input
            type="text"
            className={`form-control ${validationErrors.state ? 'is-invalid' : ''}`}
            id="state"
            name="state"
            value={formData.state || ''}
            onChange={handleChange}
            onBlur={() => validateField('state', formData.state)}
            placeholder="e.g. NY"
            maxLength="2"
            style={{ textTransform: 'uppercase' }}
          />
          {validationErrors.state && 
            <div className="text-danger">{validationErrors.state}</div>
          }
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={
            submitting || 
            Object.keys(validationErrors).some(key => validationErrors[key]) ||
            !formData.first_name.trim() || 
            !formData.last_name.trim() || 
            !formData.email.trim() || 
            !formData.phone.trim()
          }
        >
          {submitting ? 'Saving...' : 'Save Customer'}
        </button>
      </form>
    </div>
  );
};

export default NewCustomer;