from datetime import datetime

def map_reservation_to_booking(reservation_data):
    """Map reservation data from API to BOOKING table format"""
    return {
        'BookID': reservation_data.get('id'),
        'GusID': reservation_data.get('customer_id'),
        'Total_Price': reservation_data.get('total_price', 0),
        'Check_in': reservation_data.get('check_in_date'),
        'Check_out': reservation_data.get('check_out_date'),
        'Book_date': reservation_data.get('created_at', datetime.now().strftime('%Y-%m-%d')),
        'Room_no': reservation_data.get('room_id'),
        'State': reservation_data.get('state', ''),
        'City': reservation_data.get('city', ''),
        'Street': reservation_data.get('street', '')
    }

def map_booking_to_reservation(booking_data):
    """Map BOOKING table data to reservation API format"""
    return {
        'id': booking_data[0],  # BookID
        'customer_id': booking_data[1],  # GusID
        'total_price': float(booking_data[2]),  # Total_Price
        'check_in_date': booking_data[3].strftime('%Y-%m-%d') if booking_data[3] else None,  # Check_in
        'check_out_date': booking_data[4].strftime('%Y-%m-%d') if booking_data[4] else None,  # Check_out
        'created_at': booking_data[5].strftime('%Y-%m-%d') if booking_data[5] else None,  # Book_date
        'room_id': booking_data[6],  # Room_no
        'state': booking_data[7],  # State
        'city': booking_data[8],  # City
        'street': booking_data[9]  # Street
    }

def map_customer_to_guest(customer_data):
    """Map customer data from API to GUEST table format"""
    return {
        'GusID': customer_data.get('id'),
        'Lname': customer_data.get('last_name'),
        'Fname': customer_data.get('first_name'),
        'Phone': customer_data.get('phone'),
        'Email': customer_data.get('email'),
        'Address': customer_data.get('address', '')[:15]  # Truncate to fit VARCHAR(15)
    }

def map_guest_to_customer(guest_data):
    """Map GUEST table data to customer API format"""
    return {
        'id': guest_data[0],  # GusID
        'last_name': guest_data[1],  # Lname
        'first_name': guest_data[2],  # Fname
        'phone': guest_data[3],  # Phone
        'email': guest_data[4],  # Email
        'address': guest_data[5] or ""  # Address
    }

def map_room_data(room_data):
    """Map ROOM table data to room API format"""
    # Get the price per night if it exists (might be at index 17 after adding column)
    price_per_night = None
    if len(room_data) > 17:  # If price_per_night column exists
        price_per_night = float(room_data[17]) if room_data[17] is not None else None
    
    return {
        'id': room_data[0],  # Room_no
        'booking_id': room_data[1],  # BookID
        'type': room_data[2],  # Descriptions
        'capacity': room_data[3],  # Capacity
        'square_feet': room_data[4],  # Square_ft
        'is_deluxe': room_data[5] == 'Y',  # Deluxe_flag
        'kitchen': room_data[6],  # Kitchen
        'is_superior': room_data[7] == 'Y',  # Superior_flag
        'balcony': room_data[8],  # Balcony
        'is_standard': room_data[9] == 'Y',  # Standard_flag
        'amenities': room_data[10],  # Amentities
        'has_ocean_view': room_data[11] == 'Y',  # Ocean_view_flag
        'ocean_description': room_data[12],  # Ocean
        'has_city_view': room_data[13] == 'Y',  # Cityview_flag
        'city_description': room_data[14],  # City
        'has_mountain_view': room_data[15] == 'Y',  # Mtview_flag
        'mountain_description': room_data[16],  # Mountain
        'price_per_night': price_per_night  # Price per night (new column)
    }