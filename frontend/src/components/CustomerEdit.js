// ... existing code ...

// Fetch customer details
const fetchCustomerDetails = async () => {
  try {
    setLoading(true);
    const response = await fetch(`http://127.0.0.1:5000/api/customers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer details');
    }
    const data = await response.json();
    setCustomer(data);
    // Pre-populate form with current customer data
    setFormData({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      address: data.address
    });
    setLoading(false);
  } catch (error) {
    console.error('Error fetching customer details:', error);
    setError(error.message);
    setLoading(false);
  }
};

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setSubmitting(true);
    const response = await fetch(`http://127.0.0.1:5000/api/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update customer');
    }
    
    setSubmitting(false);
    setSuccess(true);
    // Refresh data
    fetchCustomerDetails();
  } catch (error) {
    console.error('Error updating customer:', error);
    setError(error.message);
    setSubmitting(false);
  }
};

// ... existing code ...