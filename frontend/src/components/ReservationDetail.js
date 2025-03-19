// ... existing code ...

// Fetch reservation details
const fetchReservationDetails = async () => {
  try {
    setLoading(true);
    console.log("Fetching reservation details for ID:", id);
    const response = await fetch(`http://localhost:5000/api/reservations/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reservation details');
    }
    const data = await response.json();
    console.log("Received reservation data:", data);
    setReservation(data);
    
    // Pre-populate form data with current reservation details
    setFormData({
      customer_id: data.customer_id,
      room_id: data.room_id,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      status: data.status
    });
    
    // If we have a hotel_id, fetch rooms for that hotel
    if (data.hotel_id) {
      console.log("Fetching rooms for hotel ID:", data.hotel_id);
      fetchRoomsForHotel(data.hotel_id);
    } else {
      console.error("No hotel_id found in reservation data");
      // If no hotel_id in reservation data, try to get it from the room
      fetchRoomDetails(data.room_id);
    }
    
    setLoading(false);
  } catch (error) {
    console.error('Error fetching reservation details:', error);
    setError(error.message);
    setLoading(false);
  }
};

// Fetch room details to get hotel_id
const fetchRoomDetails = async (roomId) => {
  try {
    console.log("Fetching room details for room ID:", roomId);
    const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch room details');
    }
    const data = await response.json();
    console.log("Received room data:", data);
    
    // If we have hotel_id in room data, fetch rooms for that hotel
    if (data.hotel_id) {
      console.log("Found hotel_id in room data:", data.hotel_id);
      fetchRoomsForHotel(data.hotel_id);
    } else {
      console.error("No hotel_id found in room data");
    }
  } catch (error) {
    console.error('Error fetching room details:', error);
  }
};

// Fetch rooms for a specific hotel
const fetchRoomsForHotel = async (hotelId) => {
  try {
    console.log("Executing fetchRoomsForHotel with hotelId:", hotelId);
    const response = await fetch(`http://localhost:5000/api/hotels/${hotelId}/rooms`);
    if (!response.ok) {
      throw new Error('Failed to fetch hotel rooms');
    }
    const data = await response.json();
    console.log("Received rooms data:", data);
    setRooms(data);
  } catch (error) {
    console.error('Error fetching hotel rooms:', error);
  }
};

// Make sure we're not trying to fetch hotel rooms on initial render
// Only fetch reservation details when component mounts
useEffect(() => {
  console.log("ReservationDetail component mounted with ID:", id);
  if (id) {
    fetchReservationDetails();
  }
  
  // Cleanup function to prevent memory leaks
  return () => {
    console.log("ReservationDetail component unmounting");
    // Cancel any pending requests or state updates here
  };
}, [id]); // Only re-run when id changes

// Remove or modify any other useEffects that might be trying to fetch hotel rooms directly
// For example, if you have something like this:
// useEffect(() => {
//   fetchRoomsForHotel(hotelId);
// }, [hotelId]);
// Make sure hotelId is not undefined when this runs
// Handle form submission for editing
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
    
    const response = await fetch(`http://127.0.0.1:5000/api/reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update reservation');
    }
    
    // Success - redirect or show success message
    setSubmitting(false);
    setSuccess(true);
    // Refresh data
    fetchReservationDetails();
  } catch (error) {
    console.error('Error updating reservation:', error);
    setError(error.message);
    setSubmitting(false);
  }
};