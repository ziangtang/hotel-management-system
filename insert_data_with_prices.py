import sys
import os

# Add the parent directory to the path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.config import DB_CONFIG

import mysql.connector
from mysql.connector import Error

def create_connection():
    try:
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        print("Database connection successful")
        return connection
    except Error as e:
        print(f"Database Error: {e}")
        return None

def insert_sample_data(connection):
    try:
        cursor = connection.cursor()
        
        # Check if tables are empty
        cursor.execute("SELECT COUNT(*) FROM BOOKING")
        booking_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM ROOM")
        room_count = cursor.fetchone()[0]
        
        if booking_count == 0 or room_count == 0:
            print(f"Inserting sample data (bookings: {booking_count}, rooms: {room_count})...")
            
            # Insert BOOKING data
            bookings = [
                (100001, 1, 720.00, '2024-05-10', '2024-05-15', '2024-04-01', 520, 'NV', 'Las Vegas', 'Sunset Blvd'),
                (100002, 2, 360.50, '2024-06-12', '2024-06-14', '2024-05-20', 610, 'FL', 'Miami', 'Ocean Drive'),
                (100003, 3, 815.75, '2024-07-05', '2024-07-10', '2024-06-01', 715, 'CA', 'Los Angeles', 'Hollywood Blvd'),
                (100004, 4, 450.00, '2024-08-01', '2024-08-05', '2024-07-10', 820, 'NY', 'Manhattan', '5th Avenue'),
                (100005, 5, 999.99, '2024-09-12', '2024-09-20', '2024-08-01', 910, 'IL', 'Chicago', 'Lake Shore Dr'),
                (100006, 6, 299.99, '2024-10-15', '2024-10-18', '2024-09-10', 1025, 'WA', 'Seattle', 'Pike Street'),
                (100007, 7, 600.00, '2024-11-05', '2024-11-10', '2024-10-20', 1130, 'TX', 'Dallas', 'Main Street'),
                (100008, 8, 540.00, '2024-04-18', '2024-04-20', '2024-03-10', 1140, 'CO', 'Denver', 'Union Street'),
                (100009, 9, 820.50, '2024-07-22', '2024-07-26', '2024-06-15', 1150, 'AZ', 'Phoenix', 'Desert Road'),
                (100010, 10, 400.00, '2024-08-05', '2024-08-10', '2024-07-05', 1160, 'NC', 'Charlotte', 'King Street'),
                (100011, 11, 690.00, '2024-09-25', '2024-09-28', '2024-08-15', 1170, 'OR', 'Portland', 'Main Ave'),
                (100012, 12, 750.00, '2024-10-12', '2024-10-15', '2024-09-22', 1180, 'TN', 'Nashville', 'Broadway'),
                (100013, 13, 680.00, '2024-03-05', '2024-03-10', '2024-02-20', 1190, 'MO', 'St. Louis', 'Market Street'),
                (100014, 14, 570.00, '2024-06-30', '2024-07-05', '2024-06-10', 1200, 'GA', 'Atlanta', 'Peach Street')
            ]
            
            for booking in bookings:
                try:
                    cursor.execute("""
                    INSERT INTO BOOKING VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, booking)
                except Error as e:
                    if "Duplicate entry" in str(e):
                        print(f"Booking {booking[0]} already exists, skipping")
                    else:
                        print(f"Error inserting booking {booking[0]}: {e}")
            
            connection.commit()
            print("Inserted booking data")
            
            # Insert GUEST data
            guests = [
                (1, 'Garcia', 'Maria', '(702)123-4567', 'maria.garcia@email.com', 'Sunset Blvd'),
                (2, 'Brown', 'David', '(305)987-6543', 'david.brown@email.com', 'Ocean Drive'),
                (3, 'Lee', 'Kevin', '(213)567-8901', 'kevin.lee@email.com', 'Hollywood Blvd'),
                (4, 'Johnson', 'Emma', '(646)345-6789', 'emma.johnson@email.com', '5th Avenue'),
                (5, 'Williams', 'Sophia', '(312)876-5432', 'sophia.williams@email.com', 'Lake Shore Dr'),
                (6, 'Davis', 'James', '(206)345-9876', 'james.davis@email.com', 'Pike Street'),
                (7, 'Martinez', 'Luis', '(214)678-2345', 'luis.martinez@email.com', 'Main Street'),
                (8, 'Taylor', 'John', '(720)456-7890', 'john.taylor@email.com', 'Union Street'),
                (9, 'White', 'Sarah', '(602)345-1234', 'sarah.white@email.com', 'Desert Road'),
                (10, 'Clark', 'Robert', '(704)876-4321', 'robert.clark@email.com', 'King Street'),
                (11, 'Hall', 'Emily', '(503)678-9876', 'emily.hall@email.com', 'Main Ave'),
                (12, 'Hernandez', 'Daniel', '(615)789-6543', 'daniel.hernandez@email.com', 'Broadway'),
                (13, 'Young', 'Jessica', '(314)567-3456', 'jessica.young@email.com', 'Market Street'),
                (14, 'Adams', 'Michael', '(404)234-5678', 'michael.adams@email.com', 'Peach Street')
            ]
            
            for guest in guests:
                try:
                    cursor.execute("""
                    INSERT INTO GUEST VALUES (%s, %s, %s, %s, %s, %s)
                    """, guest)
                except Error as e:
                    if "Duplicate entry" in str(e):
                        print(f"Guest {guest[0]} already exists, skipping")
                    else:
                        print(f"Error inserting guest {guest[0]}: {e}")
            
            connection.commit()
            print("Inserted guest data")
            
            # Insert ROOM data with price_per_night
            rooms = [
                (520, 100001, 'King', 4, 400, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 250.00),
                (610, 100002, 'Queen', 2, 250, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'TV, Mini fridge', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 180.00),
                (715, 100003, 'Standard', 4, 500, 'Y', 'Full kitchen', 'N', 'Large balcony', 'Y', 'Wi-Fi, Microwave', 'Y', 'Ocean', 'N', 'No city', 'N', 'No mountain', 220.00),
                (820, 100004, 'Standard', 6, 600, 'Y', 'Full kitchen', 'Y', 'Huge balcony', 'N', 'Wi-Fi, Jacuzzi', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 300.00),
                (910, 100005, 'Queen', 2, 300, 'N', 'No kitchen', 'N', 'Small balcony', 'Y', 'TV, Wi-Fi', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 175.00),
                (1025, 100006, 'Standard', 2, 200, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'TV, Wi-Fi', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 150.00),
                (1130, 100007, 'King', 4, 450, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, Mini Bar', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 275.00),
                (1140, 100008, 'King', 1, 150, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 200.00),
                (1150, 100009, 'Queen', 2, 280, 'N', 'No kitchen', 'Y', 'Small balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 185.00),
                (1160, 100010, 'Standard', 3, 350, 'Y', 'Full kitchen', 'N', 'Large balcony', 'Y', 'Wi-Fi, Office setup', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 210.00),
                (1170, 100011, 'Standard', 6, 750, 'Y', 'Full kitchen', 'Y', 'Massive balcony', 'N', 'Wi-Fi, Jacuzzi, Private Bar', 'Y', 'Ocean', 'Y', 'City', 'Y', 'Mountain', 450.00),
                (1180, 100012, 'King', 2, 220, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 195.00),
                (1190, 100013, 'King', 5, 500, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, Mini Bar, Home Theater', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 325.00),
                (1200, 100014, 'Queen', 3, 320, 'Y', 'Small kitchen', 'N', 'Small balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 225.00)
            ]
            
            for room in rooms:
                try:
                    cursor.execute("""
                    INSERT INTO ROOM VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, room)
                except Error as e:
                    if "Duplicate entry" in str(e):
                        print(f"Room {room[0]} already exists, updating price...")
                        try:
                            cursor.execute("""
                            UPDATE ROOM SET price_per_night = %s WHERE Room_no = %s
                            """, (room[17], room[0]))
                        except Error as e2:
                            print(f"Error updating room {room[0]} price: {e2}")
                    else:
                        print(f"Error inserting room {room[0]}: {e}")
            
            connection.commit()
            print("Inserted room data with prices")
            
            # Insert PAYMENT data
            payments = [
                (5671, 100001, 1, 720.00, 0.00, 'cash', 1),
                (5672, 100003, 3, 400.00, 415.75, 'debit card', 0),
                (5673, 100005, 5, 500.00, 499.99, 'credit card', 0),
                (5674, 100007, 7, 600.00, 0.00, 'credit card', 1),
                (5675, 100009, 9, 820.50, 0.00, 'debit card', 1),
                (5676, 100011, 11, 690.00, 0.00, 'cash', 1),
                (5677, 100013, 13, 680.00, 0.00, 'PayPal', 1)
            ]
            
            for payment in payments:
                try:
                    cursor.execute("""
                    INSERT INTO PAYMENT VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, payment)
                except Error as e:
                    if "Duplicate entry" in str(e):
                        print(f"Payment {payment[0]} already exists, skipping")
                    else:
                        print(f"Error inserting payment {payment[0]}: {e}")
            
            connection.commit()
            print("Inserted payment data")
            
            # Insert CANCELLATION data
            cancellations = [
                ('C0001', 100002, 2, 360.50, '2024-05-25'),
                ('C0002', 100004, 4, 450.00, '2024-07-15'),
                ('C0003', 100006, 6, 299.99, '2024-09-12'),
                ('C0004', 100008, 8, 540.00, '2024-04-15'),
                ('C0005', 100010, 10, 400.00, '2024-07-30'),
                ('C0006', 100012, 12, 750.00, '2024-10-08'),
                ('C0007', 100014, 14, 570.00, '2024-06-25')
            ]
            
            for cancellation in cancellations:
                try:
                    cursor.execute("""
                    INSERT INTO CANCELLATION VALUES (%s, %s, %s, %s, %s)
                    """, cancellation)
                except Error as e:
                    if "Duplicate entry" in str(e):
                        print(f"Cancellation {cancellation[0]} already exists, skipping")
                    else:
                        print(f"Error inserting cancellation {cancellation[0]}: {e}")
            
            connection.commit()
            print("Inserted cancellation data")
            
            # Insert INVOICE data
            invoices = [
                ('IN0001', 100001, 1, 720.00),
                ('IN0002', 100003, 3, 815.75),
                ('IN0003', 100005, 5, 999.99),
                ('IN0004', 100007, 7, 600.00),
                ('IN0005', 100009, 9, 820.50),
                ('IN0006', 100011, 11, 690.00),
                ('IN0007', 100013, 13, 680.00)
            ]
            
            for invoice in invoices:
                try:
                    cursor.execute("""
                    INSERT INTO INVOICE VALUES (%s, %s, %s, %s)
                    """, invoice)
                except Error as e:
                    if "Duplicate entry" in str(e):
                        print(f"Invoice {invoice[0]} already exists, skipping")
                    else:
                        print(f"Error inserting invoice {invoice[0]}: {e}")
            
            connection.commit()
            print("Inserted invoice data")
            
            # Insert INVOICE1 data
            invoice1s = [
                (100001, '2024-04-01'),
                (100003, '2024-06-01'),
                (100005, '2024-08-01'),
                (100007, '2024-10-20'),
                (100009, '2024-06-15'),
                (100011, '2024-08-15'),
                (100013, '2024-02-20')
            ]
            
            for invoice1 in invoice1s:
                try:
                    cursor.execute("""
                    INSERT INTO INVOICE1 VALUES (%s, %s)
                    """, invoice1)
                except Error as e:
                    if "Duplicate entry" in str(e):
                        print(f"Invoice1 {invoice1[0]} already exists, skipping")
                    else:
                        print(f"Error inserting invoice1 {invoice1[0]}: {e}")
            
            connection.commit()
            print("Inserted invoice1 data")
            
            # Insert REVIEW data
            reviews = [
                ('R0001', 1, 4, 'Nice hotel, but a bit noisy.', '2024-05-16'),
                ('R0002', 3, 5, 'Amazing experience, will come again!', '2024-07-12'),
                ('R0003', 5, 3, 'Average service, expected better.', '2024-09-25'),
                ('R0004', 7, 4, 'Great location and friendly staff.', '2024-11-12'),
                ('R0005', 9, 5, 'Best vacation ever, highly recommend!', '2024-07-28'),
                ('R0006', 11, 2, 'Room was small and not very clean.', '2024-09-30'),
                ('R0007', 13, 4, 'Good value for money.', '2024-03-12')
            ]
            
            for review in reviews:
                try:
                    cursor.execute("""
                    INSERT INTO REVIEW VALUES (%s, %s, %s, %s, %s)
                    """, review)
                except Error as e:
                    if "Duplicate entry" in str(e):
                        print(f"Review {review[0]} already exists, skipping")
                    else:
                        print(f"Error inserting review {review[0]}: {e}")
            
            connection.commit()
            print("Inserted review data")
        else:
            print(f"Database already has data (found {booking_count} bookings, {room_count} rooms)")
        
        cursor.close()
    except Error as e:
        print(f"Error inserting sample data: {e}")

if __name__ == "__main__":
    try:
        print("Starting data insertion script...")
        connection = create_connection()
        
        if connection:
            insert_sample_data(connection)
            
            # Verify data
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM ROOM")
            room_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM BOOKING")
            booking_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM GUEST")
            guest_count = cursor.fetchone()[0]
            
            print(f"\nDatabase Status:")
            print(f"- Rooms: {room_count}")
            print(f"- Bookings: {booking_count}")
            print(f"- Guests: {guest_count}")
            
            cursor.close()
            connection.close()
            print("\nData insertion completed")
    except Exception as e:
        print(f"Uncaught error: {e}") 