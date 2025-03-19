// ... existing code ...

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setSubmitting(true);
    
    // Format dates to YYYY-MM-DD before sending to backend
    const formattedData = {
      ...formData,
      check_in_date: formData.check_in_date.split('T')[0],
      check_out_date: formData.check_out_date.split('T')[0]
    };
    
    console.log("Sending formatted reservation data:", formattedData);
    
    const response = await fetch('http://localhost:5000/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create reservation');
    }
    
    const data = await response.json();
    setSubmitting(false);
    setSuccess(true);
    setReservationId(data.id);
    // Clear form or redirect
  } catch (error) {
    console.error('Error creating reservation:', error);
    setError(error.message);
    setSubmitting(false);
  }
};

// Fetch available rooms
const fetchAvailableRooms = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/rooms/available');
    if (!response.ok) {
      throw new Error('Failed to fetch available rooms');
    }
    const data = await response.json();
    setAvailableRooms(data);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
  }
};

// Fetch customers
const fetchCustomers = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/customers');
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    const data = await response.json();
    setCustomers(data);
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};