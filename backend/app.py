from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime

import logging
from config import DB_CONFIG
from db_mapper import (
    map_reservation_to_booking, 
    map_booking_to_reservation,
    map_customer_to_guest,
    map_guest_to_customer,
    map_room_data
)

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)

def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        print("MySQL database connection successful")
    except Error as e:
        print(f"Database connection error: {e}")
    return connection

# API Routes
@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT * FROM BOOKING
                ORDER BY Book_date DESC
            """)
            bookings = cursor.fetchall()
            cursor.close()
            connection.close()
            
            # Map database results to API format
            reservations = [map_booking_to_reservation(booking) for booking in bookings]
            return jsonify(reservations)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/reservations/<int:reservation_id>', methods=['GET'])
def get_reservation(reservation_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT * FROM BOOKING WHERE BookID = %s
            """, (reservation_id,))
            booking = cursor.fetchone()
            
            if not booking:
                cursor.close()
                connection.close()
                return jsonify({"error": "Reservation not found"}), 404
            
            # Get guest information
            cursor.execute("""
                SELECT * FROM GUEST WHERE GusID = %s
            """, (booking[1],))  # booking[1] is GusID
            guest = cursor.fetchone()
            
            # Get room information
            cursor.execute("""
                SELECT * FROM ROOM WHERE Room_no = %s
            """, (booking[6],))  # booking[6] is Room_no
            room = cursor.fetchone()
            
            cursor.close()
            connection.close()
            
            # Map to API format
            reservation = map_booking_to_reservation(booking)
            if guest:
                reservation['customer'] = map_guest_to_customer(guest)
            if room:
                reservation['room'] = map_room_data(room)
                
            return jsonify(reservation)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    app.logger.debug('Entering create_reservation function')
    data = request.json
    print("Received reservation data:", data)
    
    # Check if data is None
    if data is None:
        print("Request data is empty or not valid JSON")
        return jsonify({"error": "Request data is empty or not valid JSON"}), 400
    
    # Validate required fields
    required_fields = ['customer_id', 'room_id', 'check_in_date', 'check_out_date']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        print(f"Missing required fields: {missing_fields}")
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Validate dates
    try:
        check_in = datetime.strptime(data['check_in_date'], '%Y-%m-%d')
        check_out = datetime.strptime(data['check_out_date'], '%Y-%m-%d')
        
        if check_out <= check_in:
            print("Date validation failed: check-out date must be after check-in date")
            return jsonify({"error": "Check-out date must be after check-in date"}), 400
    except ValueError as e:
        print(f"Date format error: {str(e)}")
        return jsonify({"error": f"Invalid date format, use YYYY-MM-DD. Error: {str(e)}"}), 400
    
    connection = create_connection()
    if connection:
        try:
            # Start a transaction
            connection.start_transaction()
            
            cursor = connection.cursor()
            
            # Check if room exists and is available
            cursor.execute("SELECT Room_no FROM ROOM WHERE Room_no = %s", (data['room_id'],))
            room_result = cursor.fetchone()
            if not room_result:
                cursor.close()
                connection.rollback()
                connection.close()
                print(f"Room does not exist: {data['room_id']}")
                return jsonify({"error": "Room does not exist"}), 404
            
            # Check if room is already booked for the requested dates
            cursor.execute("""
                SELECT BookID FROM BOOKING 
                WHERE Room_no = %s 
                AND (
                    (Check_in <= %s AND Check_out >= %s) OR
                    (Check_in <= %s AND Check_out >= %s) OR
                    (Check_in >= %s AND Check_out <= %s)
                )
            """, (
                data['room_id'],
                data['check_in_date'], data['check_in_date'],  # Room is booked on check-in date
                data['check_out_date'], data['check_out_date'],  # Room is booked on check-out date
                data['check_in_date'], data['check_out_date']   # Booking spans the entire requested period
            ))
            
            existing_booking = cursor.fetchone()
            if existing_booking:
                cursor.close()
                connection.rollback()
                connection.close()
                print(f"Room {data['room_id']} is already booked for the requested dates")
                return jsonify({"error": "Room is already booked for the requested dates"}), 400
            
            # Check if guest exists
            cursor.execute("SELECT GusID FROM GUEST WHERE GusID = %s", (data['customer_id'],))
            guest_result = cursor.fetchone()
            if not guest_result:
                cursor.close()
                connection.rollback()
                connection.close()
                print(f"Guest does not exist: {data['customer_id']}")
                return jsonify({"error": "Guest does not exist"}), 404
            
            # Generate a new BookID (you might want to implement a better ID generation strategy)
            cursor.execute("SELECT MAX(BookID) FROM BOOKING")
            max_id = cursor.fetchone()[0]
            new_id = 100001 if max_id is None else max_id + 1
            
            # Calculate total price (simplified example)
            cursor.execute("SELECT Square_ft FROM ROOM WHERE Room_no = %s", (data['room_id'],))
            square_ft = cursor.fetchone()[0]
            days = (check_out - check_in).days
            
            # Use a more conservative calculation to avoid overflow
            # Assuming price per square foot per day is a reasonable value
            price_per_sqft_per_day = 0.1  # Adjust this value based on your pricing model
            total_price = float(square_ft) * days * price_per_sqft_per_day
            
            # Ensure total_price is within valid range for DECIMAL in MySQL
            # Most likely your DECIMAL column is DECIMAL(10,2) which has max value of 99999999.99
            if total_price > 9999.99:  # Using a much lower cap to be safe
                total_price = 9999.99
            
            print(f"Calculated total price: {total_price} for {days} days and {square_ft} square feet")
            
            # Insert new booking
            cursor.execute("""
                INSERT INTO BOOKING (BookID, GusID, Total_Price, Check_in, Check_out, Book_date, Room_no, State, City, Street)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                new_id,
                data['customer_id'],
                total_price,
                data['check_in_date'],
                data['check_out_date'],
                datetime.now().strftime('%Y-%m-%d'),
                data['room_id'],
                data.get('state', ''),
                data.get('city', ''),
                data.get('street', '')
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({"id": new_id, "message": "Reservation created successfully"}), 201
        except Error as e:
            if connection.in_transaction:
                connection.rollback()
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/reservations/<int:reservation_id>', methods=['PUT'])
def update_reservation(reservation_id):
    data = request.json
    
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Check if reservation exists
            cursor.execute("SELECT BookID FROM BOOKING WHERE BookID = %s", (reservation_id,))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Reservation not found"}), 404
            
            # Update reservation
            update_fields = []
            update_values = []
            
            if 'check_in_date' in data:
                update_fields.append("Check_in = %s")
                update_values.append(data['check_in_date'])
                
            if 'check_out_date' in data:
                update_fields.append("Check_out = %s")
                update_values.append(data['check_out_date'])
                
            if 'room_id' in data:
                update_fields.append("Room_no = %s")
                update_values.append(data['room_id'])
                
            if 'total_price' in data:
                update_fields.append("Total_Price = %s")
                update_values.append(data['total_price'])
                
            if 'state' in data:
                update_fields.append("State = %s")
                update_values.append(data['state'])
                
            if 'city' in data:
                update_fields.append("City = %s")
                update_values.append(data['city'])
                
            if 'street' in data:
                update_fields.append("Street = %s")
                update_values.append(data['street'])
            
            if update_fields:
                query = f"UPDATE BOOKING SET {', '.join(update_fields)} WHERE BookID = %s"
                update_values.append(reservation_id)
                
                cursor.execute(query, update_values)
                connection.commit()
                
            cursor.close()
            connection.close()
            return jsonify({"message": "Reservation updated successfully"}), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/reservations/<int:reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Check if reservation exists
            cursor.execute("SELECT BookID FROM BOOKING WHERE BookID = %s", (reservation_id,))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Reservation not found"}), 404
            
            # Delete reservation
            cursor.execute("DELETE FROM BOOKING WHERE BookID = %s", (reservation_id,))
            connection.commit()
            
            cursor.close()
            connection.close()
            return jsonify({"message": "Reservation deleted successfully"}), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/customers', methods=['GET'])
def get_customers():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM GUEST")
            guests = cursor.fetchall()
            cursor.close()
            connection.close()
            
            # Map to API format
            customers = [map_guest_to_customer(guest) for guest in guests]
            return jsonify(customers)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM GUEST WHERE GusID = %s", (customer_id,))
            guest = cursor.fetchone()
            
            if not guest:
                cursor.close()
                connection.close()
                return jsonify({"error": "Customer not found"}), 404
            
            cursor.close()
            connection.close()
            
            # Map to API format
            customer = map_guest_to_customer(guest)
            return jsonify(customer)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    data = request.json
    
    # Check if data is None
    if not data:
        return jsonify({"error": "Request data is empty or not valid JSON"}), 400
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'email', 'phone']
    missing_fields = [field for field in required_fields if field not in data or not data[field].strip()]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Validate email format
    import re
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not email_pattern.match(data['email']):
        return jsonify({"error": "Invalid email format"}), 400
    
    # Validate phone format (simple check for digits, dashes, parentheses, and spaces)
    phone_pattern = re.compile(r'^[\d\s\-\(\)]+$')
    if not phone_pattern.match(data['phone']):
        return jsonify({"error": "Invalid phone number format"}), 400
    
    # Validate city (if provided)
    if 'city' in data and data['city'].strip():
        city_pattern = re.compile(r'^[A-Za-z\s]+$')
        if not city_pattern.match(data['city']):
            return jsonify({"error": "City must contain only letters and spaces"}), 400
    
    # Validate state (if provided)
    if 'state' in data and data['state'].strip():
        state_pattern = re.compile(r'^[A-Za-z]{2}$')
        if not state_pattern.match(data['state'].upper()):
            return jsonify({"error": "State must be exactly 2 letters (e.g., NY, CA)"}), 400
    
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Check if customer exists
            cursor.execute("SELECT GusID FROM GUEST WHERE GusID = %s", (customer_id,))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Customer not found"}), 404
                
            # Check if email already exists for a different customer
            cursor.execute("SELECT GusID FROM GUEST WHERE Email = %s AND GusID != %s", (data['email'], customer_id))
            if cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Email already registered to another customer"}), 400
            
            # Build Address from street, city, state if they exist, otherwise use address field
            address = ""
            if 'street' in data and data['street'].strip():
                address += data['street'].strip()
            if 'city' in data and data['city'].strip():
                if address:
                    address += ", "
                address += data['city'].strip()
            if 'state' in data and data['state'].strip():
                if address:
                    address += ", "
                address += data['state'].strip().upper()
            
            # If no address components found, use the address field if available
            if not address and 'address' in data and data['address'].strip():
                address = data['address'].strip()
            
            # IMPORTANT: Truncate address to 15 characters to fit the column size
            address = address[:15] if address else ""
            
            # Update customer
            query = """
                UPDATE GUEST
                SET Fname = %s, Lname = %s, Phone = %s, Email = %s, Address = %s
                WHERE GusID = %s
            """
            cursor.execute(query, (
                data['first_name'].strip(),
                data['last_name'].strip(),
                data['phone'].strip(),
                data['email'].strip(),
                address,
                customer_id
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"id": customer_id, "message": "Customer updated successfully"}), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/customers', methods=['POST'])
def create_customer():
    data = request.json
    
    # Check if data is None
    if not data:
        return jsonify({"error": "Request data is empty or not valid JSON"}), 400
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'email', 'phone']
    missing_fields = [field for field in required_fields if field not in data or not data[field].strip()]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Validate email format
    import re
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not email_pattern.match(data['email']):
        return jsonify({"error": "Invalid email format"}), 400
    
    # Validate phone format (simple check for digits, dashes, parentheses, and spaces)
    phone_pattern = re.compile(r'^[\d\s\-\(\)]+$')
    if not phone_pattern.match(data['phone']):
        return jsonify({"error": "Invalid phone number format"}), 400
    
    # Validate city (if provided)
    if 'city' in data and data['city'].strip():
        city_pattern = re.compile(r'^[A-Za-z\s]+$')
        if not city_pattern.match(data['city']):
            return jsonify({"error": "City must contain only letters and spaces"}), 400
    
    # Validate state (if provided)
    if 'state' in data and data['state'].strip():
        state_pattern = re.compile(r'^[A-Za-z]{2}$')
        if not state_pattern.match(data['state'].upper()):
            return jsonify({"error": "State must be exactly 2 letters (e.g., NY, CA)"}), 400
    
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Check if email already exists
            cursor.execute("SELECT GusID FROM GUEST WHERE Email = %s", (data['email'],))
            if cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Email already registered"}), 400
            
            # Generate a new GusID
            cursor.execute("SELECT MAX(GusID) FROM GUEST")
            max_id = cursor.fetchone()[0]
            new_id = 1 if max_id is None else max_id + 1
            
            # Build Address from street, city, state if they exist, otherwise use address field
            address = ""
            if 'street' in data and data['street'].strip():
                address += data['street'].strip()
            if 'city' in data and data['city'].strip():
                if address:
                    address += ", "
                address += data['city'].strip()
            if 'state' in data and data['state'].strip():
                if address:
                    address += ", "
                address += data['state'].strip().upper()
            
            # If no address components found, use the address field if available
            if not address and 'address' in data and data['address'].strip():
                address = data['address'].strip()
            
            # IMPORTANT: Truncate address to 15 characters to fit the column size
            address = address[:15] if address else ""
            
            # Insert new guest
            query = """
                INSERT INTO GUEST (GusID, Fname, Lname, Phone, Email, Address)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                new_id,
                data['first_name'].strip(),
                data['last_name'].strip(),
                data['phone'].strip(),
                data['email'].strip(),
                address
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"id": new_id, "message": "Customer created successfully"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM ROOM")
            rooms = cursor.fetchall()
            cursor.close()
            connection.close()
            
            # Map to API format
            room_list = [map_room_data(room) for room in rooms]
            return jsonify(room_list)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM ROOM WHERE Room_no = %s", (room_id,))
            room = cursor.fetchone()
            
            if not room:
                cursor.close()
                connection.close()
                return jsonify({"error": "Room not found"}), 404
            
            cursor.close()
            connection.close()
            
            # Map to API format
            room_data = map_room_data(room)
            return jsonify(room_data)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

# Add these new endpoints after your existing ones

@app.route('/api/cancellations', methods=['GET'])
def get_cancellations():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM CANCELLATION ORDER BY Can_date DESC")
            cancellations = cursor.fetchall()
            cursor.close()
            connection.close()
            
            # Map to API format
            result = [{
                'id': c[0],
                'booking_id': c[1],
                'customer_id': c[2],
                'refund_amount': float(c[3]) if c[3] else 0,
                'cancellation_date': c[4].strftime('%Y-%m-%d') if c[4] else None
            } for c in cancellations]
            
            return jsonify(result)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/reservations/<int:reservation_id>/cancel', methods=['POST'])
def cancel_reservation(reservation_id):
    data = request.json or {}
    
    connection = create_connection()
    if connection:
        try:
            # Start a transaction
            connection.start_transaction()
            
            cursor = connection.cursor()
            
            # Check if reservation exists
            cursor.execute("SELECT BookID, GusID, Total_Price FROM BOOKING WHERE BookID = %s", (reservation_id,))
            booking = cursor.fetchone()
            if not booking:
                cursor.close()
                connection.rollback()
                connection.close()
                return jsonify({"error": "Reservation not found"}), 404
            
            # Generate cancellation ID
            cursor.execute("SELECT MAX(SUBSTRING(CanID, 2)) FROM CANCELLATION")
            result = cursor.fetchone()[0]
            next_id = 1 if result is None else int(result) + 1
            can_id = f"C{next_id:04d}"
            
            # Calculate refund amount (default to full refund if not specified)
            refund_amount = data.get('refund_amount', booking[2])
            
            # Insert cancellation record
            cursor.execute("""
                INSERT INTO CANCELLATION (CanID, BookID, GusID, Refund_amt, Can_date)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                can_id,
                booking[0],
                booking[1],
                refund_amount,
                datetime.now().strftime('%Y-%m-%d')
            ))
            
            # The trigger will update the BOOKING table to mark the room as available
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({
                "id": can_id,
                "message": "Reservation cancelled successfully",
                "refund_amount": refund_amount
            }), 201
        except Error as e:
            if connection.in_transaction:
                connection.rollback()
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/payments', methods=['GET'])
def get_payments():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT * FROM PAYMENT")
            payments = cursor.fetchall()
            cursor.close()
            connection.close()
            
            # Map to API format
            result = [{
                'id': p[0],
                'booking_id': p[1],
                'customer_id': p[2],
                'amount_paid': float(p[3]) if p[3] else 0,
                'remaining_balance': float(p[4]) if p[4] else 0,
                'payment_method': p[5],
                'is_fully_paid': bool(p[6])
            } for p in payments]
            
            return jsonify(result)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/payments', methods=['POST'])
def create_payment():
    data = request.json
    
    # Validate required fields
    required_fields = ['booking_id', 'customer_id', 'amount_paid', 'payment_method']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Check if booking exists
            cursor.execute("SELECT BookID, Total_Price FROM BOOKING WHERE BookID = %s", (data['booking_id'],))
            booking = cursor.fetchone()
            if not booking:
                cursor.close()
                connection.close()
                return jsonify({"error": "Booking not found"}), 404
            
            # Check if customer exists
            cursor.execute("SELECT GusID FROM GUEST WHERE GusID = %s", (data['customer_id'],))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Customer not found"}), 404
            
            # Generate payment ID
            cursor.execute("SELECT MAX(PayID) FROM PAYMENT")
            max_id = cursor.fetchone()[0]
            new_id = 5671 if max_id is None else max_id + 1
            
            # Calculate remaining balance
            total_price = float(booking[1])
            amount_paid = float(data['amount_paid'])
            
            # Check if there are existing payments
            cursor.execute("SELECT SUM(Pd_amt) FROM PAYMENT WHERE BookID = %s", (data['booking_id'],))
            existing_payments = cursor.fetchone()[0]
            existing_payments = float(existing_payments) if existing_payments else 0
            
            remaining_balance = total_price - (existing_payments + amount_paid)
            fully_paid = 1 if remaining_balance <= 0 else 0
            
            # Insert payment record
            cursor.execute("""
                INSERT INTO PAYMENT (PayID, BookID, GusID, Pd_amt, Remain_bal, Method, Fully_pd)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                new_id,
                data['booking_id'],
                data['customer_id'],
                amount_paid,
                max(0, remaining_balance),  # Ensure remaining balance is not negative
                data['payment_method'],
                fully_paid
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({
                "id": new_id,
                "message": "Payment recorded successfully",
                "remaining_balance": max(0, remaining_balance),
                "is_fully_paid": bool(fully_paid)
            }), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT r.*, g.Fname, g.Lname 
                FROM REVIEW r
                JOIN GUEST g ON r.GusID = g.GusID
                ORDER BY r.Rev_date DESC
            """)
            reviews = cursor.fetchall()
            cursor.close()
            connection.close()
            
            # Map to API format
            result = [{
                'id': r[0],
                'customer_id': r[1],
                'rating': r[2],
                'comments': r[3],
                'review_date': r[4].strftime('%Y-%m-%d') if r[4] else None,
                'customer_name': f"{r[5]} {r[6]}"  # First name + Last name
            } for r in reviews]
            
            return jsonify(result)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/reviews', methods=['POST'])
def create_review():
    data = request.json
    
    # Validate required fields
    required_fields = ['customer_id', 'rating', 'comments']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Validate rating (1-5)
    if not 1 <= int(data['rating']) <= 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400
    
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Check if customer exists
            cursor.execute("SELECT GusID FROM GUEST WHERE GusID = %s", (data['customer_id'],))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Customer not found"}), 404
            
            # Generate review ID
            cursor.execute("SELECT MAX(SUBSTRING(RevID, 2)) FROM REVIEW")
            result = cursor.fetchone()[0]
            next_id = 1 if result is None else int(result) + 1
            rev_id = f"R{next_id:04d}"
            
            # Insert review
            cursor.execute("""
                INSERT INTO REVIEW (RevID, GusID, Rating, Comments, Rev_date)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                rev_id,
                data['customer_id'],
                data['rating'],
                data['comments'][:100],  # Truncate to fit VARCHAR(100)
                datetime.now().strftime('%Y-%m-%d')
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({
                "id": rev_id,
                "message": "Review submitted successfully"
            }), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT i.*, i1.Book_date, g.Fname, g.Lname
                FROM INVOICE i
                JOIN INVOICE1 i1 ON i.BookID = i1.BookID
                JOIN GUEST g ON i.GusID = g.GusID
                ORDER BY i1.Book_date DESC
            """)
            invoices = cursor.fetchall()
            cursor.close()
            connection.close()
            
            # Map to API format
            result = [{
                'invoice_number': i[0],
                'booking_id': i[1],
                'customer_id': i[2],
                'total_amount': float(i[3]) if i[3] else 0,
                'booking_date': i[4].strftime('%Y-%m-%d') if i[4] else None,
                'customer_name': f"{i[5]} {i[6]}"  # First name + Last name
            } for i in invoices]
            
            return jsonify(result)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/invoices/<string:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT i.*, i1.Book_date, g.Fname, g.Lname, g.Email, g.Phone, b.Check_in, b.Check_out
                FROM INVOICE i
                JOIN INVOICE1 i1 ON i.BookID = i1.BookID
                JOIN GUEST g ON i.GusID = g.GusID
                JOIN BOOKING b ON i.BookID = b.BookID
                WHERE i.Invoi_no = %s
            """, (invoice_id,))
            invoice = cursor.fetchone()
            
            if not invoice:
                cursor.close()
                connection.close()
                return jsonify({"error": "Invoice not found"}), 404
            
            # Get payment information
            cursor.execute("""
                SELECT * FROM PAYMENT
                WHERE BookID = %s
            """, (invoice[1],))
            payments = cursor.fetchall()
            
            cursor.close()
            connection.close()
            
            # Map to API format
            result = {
                'invoice_number': invoice[0],
                'booking_id': invoice[1],
                'customer_id': invoice[2],
                'total_amount': float(invoice[3]) if invoice[3] else 0,
                'booking_date': invoice[4].strftime('%Y-%m-%d') if invoice[4] else None,
                'customer_name': f"{invoice[5]} {invoice[6]}",
                'customer_email': invoice[7],
                'customer_phone': invoice[8],
                'check_in_date': invoice[9].strftime('%Y-%m-%d') if invoice[9] else None,
                'check_out_date': invoice[10].strftime('%Y-%m-%d') if invoice[10] else None,
                'payments': [{
                    'id': p[0],
                    'amount_paid': float(p[3]) if p[3] else 0,
                    'remaining_balance': float(p[4]) if p[4] else 0,
                    'payment_method': p[5],
                    'is_fully_paid': bool(p[6])
                } for p in payments]
            }
            
            return jsonify(result)
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get hotel statistics for dashboard"""
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Get total number of bookings
            cursor.execute("SELECT COUNT(*) FROM BOOKING")
            total_bookings = cursor.fetchone()[0]
            
            # Get total number of guests
            cursor.execute("SELECT COUNT(*) FROM GUEST")
            total_guests = cursor.fetchone()[0]
            
            # Get total revenue
            cursor.execute("SELECT SUM(Total_Price) FROM BOOKING")
            total_revenue = cursor.fetchone()[0]
            total_revenue = float(total_revenue) if total_revenue else 0
            
            # Get number of cancellations
            cursor.execute("SELECT COUNT(*) FROM CANCELLATION")
            total_cancellations = cursor.fetchone()[0]
            
            # Get average rating
            cursor.execute("SELECT AVG(Rating) FROM REVIEW")
            avg_rating = cursor.fetchone()[0]
            avg_rating = float(avg_rating) if avg_rating else 0
            
            # Get bookings by month (last 6 months)
            cursor.execute("""
                SELECT DATE_FORMAT(Book_date, '%Y-%m') as month, COUNT(*) as count
                FROM BOOKING
                WHERE Book_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY month
                ORDER BY month
            """)
            bookings_by_month = {row[0]: row[1] for row in cursor.fetchall()}
            
            cursor.close()
            connection.close()
            
            return jsonify({
                'total_bookings': total_bookings,
                'total_guests': total_guests,
                'total_revenue': total_revenue,
                'total_cancellations': total_cancellations,
                'average_rating': avg_rating,
                'bookings_by_month': bookings_by_month
            })
        except Error as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Database connection failed"}), 500


# Add a test endpoint to verify database connection and schema
@app.route('/api/test/database', methods=['GET'])
def test_database():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Test each table
            tables = ['BOOKING', 'GUEST', 'PAYMENT', 'CANCELLATION', 'INVOICE', 'INVOICE1', 'REVIEW', 'ROOM']
            results = {}
            
            for table in tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    results[table] = {
                        'status': 'OK',
                        'record_count': count
                    }
                except Error as e:
                    results[table] = {
                        'status': 'ERROR',
                        'message': str(e)
                    }
            
            # Test view
            try:
                cursor.execute("SELECT COUNT(*) FROM PENDING_PMT")
                count = cursor.fetchone()[0]
                results['PENDING_PMT'] = {
                    'status': 'OK',
                    'record_count': count
                }
            except Error as e:
                results['PENDING_PMT'] = {
                    'status': 'ERROR',
                    'message': str(e)
                }
            
            # Test function
            try:
                cursor.execute("SELECT STAY_LEN('2023-01-01', '2023-01-05') as days")
                days = cursor.fetchone()[0]
                results['STAY_LEN'] = {
                    'status': 'OK',
                    'test_result': days
                }
            except Error as e:
                results['STAY_LEN'] = {
                    'status': 'ERROR',
                    'message': str(e)
                }
            
            cursor.close()
            connection.close()
            
            return jsonify({
                'database_connection': 'OK',
                'database_name': DB_CONFIG['database'],
                'tables': results
            })
        except Error as e:
            return jsonify({
                'database_connection': 'ERROR',
                'message': str(e)
            }), 500
    return jsonify({
        'database_connection': 'FAILED',
        'message': 'Could not connect to the database'
    }), 500

# Custom SQL Query execution endpoint
@app.route('/api/execute-query', methods=['POST'])
def execute_query():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "No query provided"}), 400
    
    # Get the query from the request
    query = data['query']
    
    # For security, restrict certain operations
    # Only allow SELECT queries to prevent data modification
    if not query.strip().upper().startswith('SELECT'):
        return jsonify({"error": "Only SELECT queries are allowed for security reasons"}), 403
    
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query)
            
            # For SELECT queries, fetch results
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                
                # Get column names
                column_names = [column[0] for column in cursor.description]
                
                cursor.close()
                connection.close()
                
                return jsonify({
                    "success": True,
                    "results": results,
                    "columns": column_names,
                    "rowCount": len(results)
                })
            
        except Error as e:
            if connection:
                connection.close()
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    return jsonify({"error": "Database connection failed"}), 500

# Endpoint to get predefined queries from dbSQL.sql
@app.route('/api/predefined-queries', methods=['GET'])
def get_predefined_queries():
    try:
        # Read the dbSQL.sql file
        with open('database/dbSQL.sql', 'r') as file:
            content = file.read()
            
        # Parse the content to extract queries and their descriptions
        # Each query starts with a comment and ends before the next comment
        import re
        queries = []
        
        # Match pattern: -- Comment text\nSELECT...;
        pattern = r'--\s+(.*?)\n(.*?;)'
        matches = re.findall(pattern, content, re.DOTALL)
        
        for idx, (description, query) in enumerate(matches):
            # Clean up the query by removing extra whitespace
            clean_query = query.strip()
            # Only include SELECT queries
            if clean_query.upper().startswith('SELECT'):
                queries.append({
                    "id": idx + 1,
                    "description": description.strip(),
                    "query": clean_query
                })
        
        return jsonify({
            "success": True,
            "queries": queries
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Get all pending payments (demonstrates VIEW usage)
@app.route('/api/pending-payments', methods=['GET'])
def get_pending_payments():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM PENDING_PMT")
            payments = cursor.fetchall()
            cursor.close()
            connection.close()
            return jsonify({
                "success": True,
                "payments": payments
            })
        except Error as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    return jsonify({"error": "Database connection failed"}), 500

# Get reservation lengths using STAY_LEN function
@app.route('/api/reservation-lengths', methods=['GET'])
def get_reservation_lengths():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)

            # Add diagnostics
            diagnostics = {}
            
            # Check if STAY_LEN function exists
            try:
                cursor.execute("SHOW FUNCTION STATUS WHERE Db = %s AND Name = 'STAY_LEN'", (DB_CONFIG['database'],))
                function_exists = cursor.fetchone() is not None
                diagnostics['function_exists'] = function_exists
            except Error as e:
                diagnostics['function_check_error'] = str(e)
            
            # Check for bookings with non-NULL dates
            try:
                cursor.execute("SELECT COUNT(*) as count FROM BOOKING WHERE Check_in IS NOT NULL AND Check_out IS NOT NULL")
                result = cursor.fetchone()
                diagnostics['bookings_with_dates'] = result['count'] if result else 0
            except Error as e:
                diagnostics['booking_check_error'] = str(e)
            
            # Check a few sample bookings
            try:
                cursor.execute("SELECT BookID, Check_in, Check_out FROM BOOKING LIMIT 5")
                sample_bookings = cursor.fetchall()
                diagnostics['sample_bookings'] = sample_bookings
            except Error as e:
                diagnostics['sample_error'] = str(e)
            
            # Try the main query
            try:
                cursor.execute("SELECT BookID, STAY_LEN(Check_in, Check_out) as No_of_days FROM BOOKING")
                results = cursor.fetchall()
            except Error as e:
                diagnostics['main_query_error'] = str(e)
                # If the main query fails, create a sample booking with valid dates
                try:
                    # First check if we already have a sample booking
                    cursor.execute("SELECT BookID FROM BOOKING WHERE BookID = 9999")
                    if not cursor.fetchone():
                        cursor.execute("""
                            INSERT INTO BOOKING (BookID, GusID, Total_Price, Check_in, Check_out, Book_date, Room_no)
                            VALUES (9999, 1, 100.00, '2023-01-01', '2023-01-05', '2022-12-01', 101)
                        """)
                        connection.commit()
                        diagnostics['sample_booking_created'] = True
                    
                    # Try again with the new sample booking
                    cursor.execute("SELECT BookID, STAY_LEN(Check_in, Check_out) as No_of_days FROM BOOKING WHERE BookID = 9999")
                    results = cursor.fetchall()
                    diagnostics['retry_successful'] = True
                except Error as retry_error:
                    diagnostics['retry_error'] = str(retry_error)
                    results = []
            
            cursor.close()
            connection.close()
            
            return jsonify({
                "success": True,
                "reservation_lengths": results,
                "diagnostics": diagnostics
            })
        except Error as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    return jsonify({"error": "Database connection failed"}), 500

# API endpoint to create a cancellation and demonstrate trigger
@app.route('/api/cancellations', methods=['POST'])
def create_cancellation():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validate required fields
    required_fields = ['bookingId', 'guestId', 'refundAmount']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    connection = create_connection()
    if connection:
        try:
            # Start a transaction
            connection.start_transaction()
            
            cursor = connection.cursor()
            
            # Check if booking exists
            cursor.execute("SELECT BookID FROM BOOKING WHERE BookID = %s", (data['bookingId'],))
            booking = cursor.fetchone()
            if not booking:
                cursor.close()
                connection.rollback()
                connection.close()
                return jsonify({"error": "Booking does not exist"}), 404
            
            # Check if guest exists
            cursor.execute("SELECT GusID FROM GUEST WHERE GusID = %s", (data['guestId'],))
            guest = cursor.fetchone()
            if not guest:
                cursor.close()
                connection.rollback()
                connection.close()
                return jsonify({"error": "Guest does not exist"}), 404
            
            # Generate a cancellation ID
            cursor.execute("SELECT MAX(CAST(CanID AS UNSIGNED)) FROM CANCELLATION")
            max_id = cursor.fetchone()[0]
            new_id = '100001' if max_id is None else str(int(max_id) + 1)
            
            # Create the cancellation
            cursor.execute("""
                INSERT INTO CANCELLATION (CanID, BookID, GusID, Refund_amt, Can_date)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                new_id,
                data['bookingId'],
                data['guestId'],
                data['refundAmount'],
                data.get('cancellationDate', datetime.now().strftime('%Y-%m-%d'))
            ))
            
            # Commit the transaction - this will trigger the UPDATE_ROOM_ON_CANCELLATION trigger
            connection.commit()
            
            # Verify the trigger worked by checking if room_no was set to 0000
            cursor.execute("SELECT Room_no FROM BOOKING WHERE BookID = %s", (data['bookingId'],))
            updated_room = cursor.fetchone()[0]
            
            cursor.close()
            connection.close()
            
            return jsonify({
                "success": True,
                "message": "Cancellation created successfully",
                "cancellationId": new_id,
                "triggerWorked": str(updated_room) == '0000'  # Check if room was updated to 0000
            })
            
        except Error as e:
            if connection:
                connection.rollback()
                connection.close()
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    return jsonify({"error": "Database connection failed"}), 500

# API endpoint to create sample data for testing
@app.route('/api/sample-data', methods=['POST'])
def create_sample_data():
    """
    Creates sample data for testing database features like functions, views, and triggers.
    """
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            results = {}
            
            # Create test bookings with check-in and check-out dates
            try:
                # Check if we already have sample bookings
                cursor.execute("SELECT COUNT(*) FROM BOOKING WHERE BookID >= 9000")
                if cursor.fetchone()[0] < 3:
                    # Create new sample bookings
                    sample_bookings = [
                        (9001, 1, 150.00, '2023-01-01', '2023-01-05', '2022-12-01', 101),
                        (9002, 2, 200.00, '2023-02-10', '2023-02-15', '2023-01-15', 102),
                        (9003, 3, 300.00, '2023-03-20', '2023-03-25', '2023-02-28', 103)
                    ]
                    
                    for booking in sample_bookings:
                        try:
                            cursor.execute("""
                                INSERT INTO BOOKING (BookID, GusID, Total_Price, Check_in, Check_out, Book_date, Room_no)
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """, booking)
                        except Error as e:
                            # If booking already exists, just ignore the error
                            if "Duplicate entry" not in str(e):
                                raise
                    
                    connection.commit()
                    results['bookings_created'] = True
            except Error as e:
                results['booking_error'] = str(e)
            
            # Create test payments (for PENDING_PMT view)
            try:
                # Check if we already have sample payments
                cursor.execute("SELECT COUNT(*) FROM PAYMENT WHERE PayID >= 6000")
                if cursor.fetchone()[0] < 2:
                    # Create new sample payments with remaining balances
                    sample_payments = [
                        (6001, 9001, 1, 75.00, 75.00, 'Credit Card', 0),
                        (6002, 9002, 2, 100.00, 100.00, 'Cash', 0)
                    ]
                    
                    for payment in sample_payments:
                        try:
                            cursor.execute("""
                                INSERT INTO PAYMENT (PayID, BookID, GusID, Pd_amt, Remain_bal, Method, Fully_pd)
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """, payment)
                        except Error as e:
                            # If payment already exists, just ignore the error
                            if "Duplicate entry" not in str(e):
                                raise
                    
                    connection.commit()
                    results['payments_created'] = True
            except Error as e:
                results['payment_error'] = str(e)
            
            cursor.close()
            connection.close()
            
            return jsonify({
                "success": True,
                "message": "Sample data created successfully",
                "details": results
            })
            
        except Error as e:
            if connection:
                connection.rollback()
                connection.close()
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    return jsonify({"error": "Database connection failed"}), 500

if __name__ == '__main__':
    app.run(debug=True)




## 2. Create a Room Availability Endpoint


@app.route('/api/rooms/<int:room_id>/availability', methods=['GET'])
def check_room_availability(room_id):
    check_in = request.args.get('check_in')
    check_out = request.args.get('check_out')
    
    if not check_in or not check_out:
        return jsonify({"error": "Check-in and check-out dates are required"}), 400
    
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            
            # Check if room exists
            cursor.execute("SELECT Room_no FROM ROOM WHERE Room_no = %s", (room_id,))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Room not found", "available": False}), 404
            
            # Check if room is already booked for the requested dates
            cursor.execute("""
                SELECT BookID FROM BOOKING 
                WHERE Room_no = %s 
                AND (
                    (Check_in <= %s AND Check_out >= %s) OR
                    (Check_in <= %s AND Check_out >= %s) OR
                    (Check_in >= %s AND Check_out <= %s)
                )
            """, (
                room_id,
                check_out, check_out,  # Room is booked on check-out date
                check_in, check_in,    # Room is booked on check-in date
                check_in, check_out    # Booking spans the entire requested period
            ))
            
            existing_booking = cursor.fetchone()
            cursor.close()
            connection.close()
            
            return jsonify({
                "room_id": room_id,
                "available": not bool(existing_booking)
            })
        except Error as e:
            return jsonify({"error": str(e), "available": False}), 500
    return jsonify({"error": "Database connection failed", "available": False}), 500