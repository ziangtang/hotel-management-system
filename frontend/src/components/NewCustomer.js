import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewCustomer = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState(null);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // Make sure all required fields are present
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }
      
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
            className="form-control"
            id="first_name"
            name="first_name"
            value={formData.first_name || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="last_name" className="form-label">Last Name *</label>
          <input
            type="text"
            className="form-control"
            id="last_name"
            name="last_name"
            value={formData.last_name || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email *</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone *</label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address</label>
          <textarea
            className="form-control"
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Customer'}
        </button>
      </form>
    </div>
  );
};

export default NewCustomer;