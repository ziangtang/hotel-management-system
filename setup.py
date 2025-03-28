import mysql.connector
from mysql.connector import Error
import os
import sys
import time
import subprocess

# Add the parent directory to the path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.config import DB_CONFIG

# Database name constant
DB_NAME = 'hotel_management'

def create_connection(host, user, password, database=None):
    """Create a connection to the MySQL database"""
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        print(f"Connected to MySQL{' database: ' + database if database else ''}")
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def setup_tables():
    """Set up the database tables"""
    connection = create_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password']
    )
    
    if not connection:
        print("Failed to connect to MySQL server. Make sure MySQL is running.")
        return False
    
    cursor = connection.cursor()
    
    try:
        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' created or already exists")
        
        # Switch to the database
        cursor.execute(f"USE {DB_NAME}")
        
        # Check if tables exist
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        if len(tables) > 0:
            drop_all = input("\nExisting tables found. Do you want to drop all tables and recreate? (y/n): ")
            if drop_all.lower() == 'y':
                print("Dropping all existing tables...")
                # Drop objects in the correct order to avoid foreign key constraints
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
                cursor.execute("DROP TRIGGER IF EXISTS UPDATE_ROOM_ON_CANCELLATION")
                cursor.execute("DROP FUNCTION IF EXISTS STAY_LEN")
                cursor.execute("DROP VIEW IF EXISTS PENDING_PMT")
                cursor.execute("DROP TABLE IF EXISTS ROOM")
                cursor.execute("DROP TABLE IF EXISTS REVIEW")
                cursor.execute("DROP TABLE IF EXISTS INVOICE1")
                cursor.execute("DROP TABLE IF EXISTS INVOICE")
                cursor.execute("DROP TABLE IF EXISTS CANCELLATION")
                cursor.execute("DROP TABLE IF EXISTS PAYMENT")
                cursor.execute("DROP TABLE IF EXISTS GUEST")
                cursor.execute("DROP TABLE IF EXISTS BOOKING")
                cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
                
                # Create tables
                create_tables(cursor)
                
                # Insert sample data
                insert_sample_data(cursor)
            else:
                # Check if data exists in existing tables
                print("Using existing tables...")
                cursor.execute("SELECT COUNT(*) FROM GUEST")
                guest_count = cursor.fetchone()[0]
                
                if guest_count == 0:
                    print("No data found in existing tables. Inserting sample data...")
                    insert_sample_data(cursor)
                else:
                    print(f"Data already exists in tables ({guest_count} guests found)")
        else:
            print("No tables found. Creating tables...")
            create_tables(cursor)
            
            print("Inserting sample data...")
            insert_sample_data(cursor)
        
        # Ensure ROOM table data is correct
        fix_room_table(cursor)
        
        connection.commit()
        print("\nDatabase setup completed successfully!")
        return True
    except Error as e:
        print(f"Error: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed")

def create_tables(cursor):
    """Create all required tables"""
    # BOOKING table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS BOOKING (
        BookID INT(6) NOT NULL,
        GusID INT(6) NOT NULL,
        Total_Price DECIMAL(5, 2) NOT NULL,
        Check_in DATE,
        Check_out DATE,
        Book_date DATE,
        Room_no INT(4),
        State VARCHAR(2),
        City VARCHAR(15),
        Street VARCHAR(15),
        PRIMARY KEY (BookID)
    )
    """)
    
    # GUEST table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS GUEST (
        GusID INT(6) NOT NULL,
        Lname VARCHAR(11) NOT NULL,
        Fname VARCHAR(11),
        Phone VARCHAR(15),
        Email VARCHAR(30),
        Address VARCHAR(15),
        PRIMARY KEY(GusID)
    )
    """)
    
    # PAYMENT table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS PAYMENT (
        PayID INT(6) NOT NULL,
        BookID INT(6),
        GusID INT(6) NOT NULL,
        Pd_amt DECIMAL,
        Remain_bal DECIMAL(10,2),
        Method VARCHAR(12),
        Fully_pd BIT(1),
        PRIMARY KEY(PayID)
    )
    """)
    
    # CANCELLATION table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS CANCELLATION (
        CanID VARCHAR(6) NOT NULL,
        BookID INT(6) NOT NULL,
        GusID INT(6) NOT NULL,
        Refund_amt DECIMAL,
        Can_date DATE,
        PRIMARY KEY(CanID)
    )
    """)
    
    # INVOICE table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS INVOICE (
        Invoi_no VARCHAR(6) NOT NULL,
        BookID INT(6),
        GusID INT(6) NOT NULL,
        Total_Price DECIMAL(5, 2) NOT NULL,
        PRIMARY KEY(Invoi_no)
    )
    """)
    
    # INVOICE1 table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS INVOICE1 (
        BookID INT(6),
        Book_date DATE,
        PRIMARY KEY(BookID)
    )
    """)
    
    # REVIEW table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS REVIEW (
        RevID VARCHAR(6) NOT NULL,
        GusID INT(6),
        Rating INT(1),
        Comments VARCHAR(100),
        Rev_date DATE,
        PRIMARY KEY (RevID)
    )
    """)
    
    # ROOM table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ROOM (
        Room_no INT(4) NOT NULL,
        BookID INT(6),
        Descriptions VARCHAR(100),
        Capacity INT(2),
        Square_ft INT(4),
        Deluxe_flag VARCHAR(1),
        Kitchen VARCHAR(100),
        Superior_flag VARCHAR(1),
        Balcony VARCHAR(20),
        Standard_flag VARCHAR(1),
        Amentities VARCHAR(50),
        Ocean_view_flag VARCHAR(1),
        Ocean VARCHAR(15),
        Cityview_flag VARCHAR(1),
        City VARCHAR(15),
        Mtview_flag VARCHAR(1),
        Mountain VARCHAR(15),
        price_per_night DECIMAL(10,2) DEFAULT 100.00,
        PRIMARY KEY(Room_no)
    )
    """)
    
    # Create view
    cursor.execute("""
    CREATE OR REPLACE VIEW PENDING_PMT AS
    SELECT P.PayID, B.GusID, B.Total_Price, P.Remain_bal
    FROM PAYMENT P
    JOIN BOOKING B ON B.GusID = P.GusID
    WHERE P.Remain_bal > 0
    """)
    
    # Create function
    try:
        cursor.execute("DROP FUNCTION IF EXISTS STAY_LEN")
        
        # Create the function using proper MySQL delimiter syntax
        cursor.execute("""
        CREATE FUNCTION STAY_LEN(Check_in DATE, Check_out DATE)
        RETURNS INT
        DETERMINISTIC
        BEGIN
            DECLARE NUMB_OF_DAY INT;
            SET NUMB_OF_DAY = DATEDIFF(Check_out, Check_in);
            RETURN NUMB_OF_DAY;
        END
        """)
    except Error as e:
        print(f"Error creating STAY_LEN function: {e}")
    
    # Create trigger
    try:
        cursor.execute("DROP TRIGGER IF EXISTS UPDATE_ROOM_ON_CANCELLATION")
        
        # Create the trigger
        cursor.execute("""
        CREATE TRIGGER UPDATE_ROOM_ON_CANCELLATION
        AFTER INSERT ON CANCELLATION
        FOR EACH ROW
        BEGIN
            UPDATE BOOKING
            SET Room_no = 0000
            WHERE BookID = NEW.BookID;
        END
        """)
    except Error as e:
        print(f"Error creating UPDATE_ROOM_ON_CANCELLATION trigger: {e}")
    
    print("Tables, view, function, and trigger created successfully")

def insert_sample_data(cursor):
    """Insert sample data into tables"""
    # Insert BOOKING data
    booking_data = [
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
    
    cursor.executemany("""
    INSERT INTO BOOKING 
    (BookID, GusID, Total_Price, Check_in, Check_out, Book_date, Room_no, State, City, Street)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, booking_data)
    
    # Insert GUEST data
    guest_data = [
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
    
    cursor.executemany("""
    INSERT INTO GUEST 
    (GusID, Lname, Fname, Phone, Email, Address)
    VALUES (%s, %s, %s, %s, %s, %s)
    """, guest_data)
    
    # Insert PAYMENT data
    payment_data = [
        (5671, 100001, 1, 720.00, 0.00, 'cash', 1),
        (5672, 100003, 3, 400.00, 415.75, 'debit card', 0),
        (5673, 100005, 5, 500.00, 499.99, 'credit card', 0),
        (5674, 100007, 7, 600.00, 0.00, 'credit card', 1),
        (5675, 100009, 9, 820.50, 0.00, 'debit card', 1),
        (5676, 100011, 11, 690.00, 0.00, 'cash', 1),
        (5677, 100013, 13, 680.00, 0.00, 'PayPal', 1)
    ]
    
    cursor.executemany("""
    INSERT INTO PAYMENT 
    (PayID, BookID, GusID, Pd_amt, Remain_bal, Method, Fully_pd)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, payment_data)
    
    # Insert CANCELLATION data
    cancellation_data = [
        ('C0001', 100002, 2, 360.50, '2024-05-25'),
        ('C0002', 100004, 4, 450.00, '2024-07-15'),
        ('C0003', 100006, 6, 299.99, '2024-09-12'),
        ('C0004', 100008, 8, 540.00, '2024-04-15'),
        ('C0005', 100010, 10, 400.00, '2024-07-30'),
        ('C0006', 100012, 12, 750.00, '2024-10-08'),
        ('C0007', 100014, 14, 570.00, '2024-06-25')
    ]
    
    cursor.executemany("""
    INSERT INTO CANCELLATION 
    (CanID, BookID, GusID, Refund_amt, Can_date)
    VALUES (%s, %s, %s, %s, %s)
    """, cancellation_data)
    
    # Insert INVOICE data
    invoice_data = [
        ('IN0001', 100001, 1, 720.00),
        ('IN0002', 100003, 3, 815.75),
        ('IN0003', 100005, 5, 999.99),
        ('IN0004', 100007, 7, 600.00),
        ('IN0005', 100009, 9, 820.50),
        ('IN0006', 100011, 11, 690.00),
        ('IN0007', 100013, 13, 680.00)
    ]
    
    cursor.executemany("""
    INSERT INTO INVOICE 
    (Invoi_no, BookID, GusID, Total_Price)
    VALUES (%s, %s, %s, %s)
    """, invoice_data)
    
    # Insert INVOICE1 data
    invoice1_data = [
        (100001, '2024-04-01'),
        (100003, '2024-06-01'),
        (100005, '2024-08-01'),
        (100007, '2024-10-20'),
        (100009, '2024-06-15'),
        (100011, '2024-08-15'),
        (100013, '2024-02-20')
    ]
    
    cursor.executemany("""
    INSERT INTO INVOICE1 
    (BookID, Book_date)
    VALUES (%s, %s)
    """, invoice1_data)
    
    # Insert REVIEW data
    review_data = [
        ('R0001', 1, 4, 'Nice hotel, but a bit noisy.', '2024-05-16'),
        ('R0002', 3, 5, 'Amazing experience, will come again!', '2024-07-12'),
        ('R0003', 5, 3, 'Average service, expected better.', '2024-09-25'),
        ('R0004', 7, 4, 'Great location and friendly staff.', '2024-11-12'),
        ('R0005', 9, 5, 'Best vacation ever, highly recommend!', '2024-07-28'),
        ('R0006', 11, 2, 'Room was small and not very clean.', '2024-09-30'),
        ('R0007', 13, 4, 'Good value for money.', '2024-03-12')
    ]
    
    cursor.executemany("""
    INSERT INTO REVIEW 
    (RevID, GusID, Rating, Comments, Rev_date)
    VALUES (%s, %s, %s, %s, %s)
    """, review_data)
    
    print("Sample data inserted successfully")

def fix_room_table(cursor):
    """Fix the ROOM table by inserting with explicit column names"""
    print("Ensuring ROOM table has proper data...")
    
    try:
        # First check if ROOM table exists and has data
        cursor.execute("SELECT COUNT(*) FROM ROOM")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("ROOM table is empty. Adding room data with correct format...")
            
            # Clear any potential partial data
            cursor.execute("DELETE FROM ROOM")
            
            # Insert the corrected data with explicit columns
            room_data = [
                (520, 100001, 'King', 4, 400, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 120.00),
                (610, 100002, 'Queen', 2, 250, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'TV, Mini fridge', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 90.00),
                (715, 100003, 'Standard', 4, 500, 'Y', 'Full kitchen', 'N', 'Large balcony', 'Y', 'Wi-Fi, Microwave', 'Y', 'Ocean', 'N', 'No city', 'N', 'No mountain', 150.00),
                (820, 100004, 'Standard', 6, 600, 'Y', 'Full kitchen', 'Y', 'Huge balcony', 'N', 'Wi-Fi, Jacuzzi', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 200.00),
                (910, 100005, 'Queen', 2, 300, 'N', 'No kitchen', 'N', 'Small balcony', 'Y', 'TV, Wi-Fi', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 110.00),
                (1025, 100006, 'Standard', 2, 200, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'TV, Wi-Fi', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 85.00),
                (1130, 100007, 'King', 4, 450, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, Mini Bar', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 180.00),
                (1140, 100008, 'King', 1, 150, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 75.00),
                (1150, 100009, 'Queen', 2, 280, 'N', 'No kitchen', 'Y', 'Small balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 95.00),
                (1160, 100010, 'Standard', 3, 350, 'Y', 'Full kitchen', 'N', 'Large balcony', 'Y', 'Wi-Fi, Office setup', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 130.00),
                (1170, 100011, 'Standard', 6, 750, 'Y', 'Full kitchen', 'Y', 'Massive balcony', 'N', 'Wi-Fi, Jacuzzi, Private Bar', 'Y', 'Ocean', 'Y', 'City', 'Y', 'Mountain', 250.00),
                (1180, 100012, 'King', 2, 220, 'N', 'No kitchen', 'N', 'No balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'N', 'No city', 'Y', 'Mountain', 80.00),
                (1190, 100013, 'King', 5, 500, 'Y', 'Full kitchen', 'Y', 'Large balcony', 'N', 'Wi-Fi, Mini Bar, Home Theater', 'Y', 'Ocean', 'Y', 'City', 'N', 'No mountain', 190.00),
                (1200, 100014, 'Queen', 3, 320, 'Y', 'Small kitchen', 'N', 'Small balcony', 'Y', 'Wi-Fi, TV', 'N', 'No ocean', 'Y', 'City', 'N', 'No mountain', 120.00)
            ]
            
            cursor.executemany("""
            INSERT INTO ROOM 
            (Room_no, BookID, Descriptions, Capacity, Square_ft, Deluxe_flag, Kitchen, 
            Superior_flag, Balcony, Standard_flag, Amentities, Ocean_view_flag, Ocean, 
            Cityview_flag, City, Mtview_flag, Mountain, price_per_night) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, room_data)
            
            print(f"ROOM table data inserted successfully ({len(room_data)} rooms)")
        else:
            print(f"ROOM table already contains {count} records")
        
        return True
    except Error as e:
        print(f"Error fixing ROOM table: {e}")
        return False

def check_database_status():
    """Check database status and print useful information"""
    connection = create_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password'],
        DB_NAME
    )
    
    if not connection:
        print("Failed to connect to database for status check")
        return
    
    cursor = connection.cursor()
    
    try:
        # Print tables and record counts
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        print("\nDatabase Status:")
        print("=" * 40)
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"Table {table}: {count} records")
        
        # Print storage engine information
        print("\nStorage Engine Information:")
        print("=" * 40)
        
        cursor.execute("SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit'")
        result = cursor.fetchone()
        print(f"innodb_flush_log_at_trx_commit: {result[1]}")
        
        cursor.execute("SHOW VARIABLES LIKE 'innodb_file_per_table'")
        result = cursor.fetchone()
        print(f"innodb_file_per_table: {result[1]}")
        
    except Error as e:
        print(f"Error checking database status: {e}")
    finally:
        cursor.close()
        connection.close()

def start_backend():
    """Start the backend server"""
    print("\nStarting backend server...")
    try:
        process = subprocess.Popen(
            ["python", "backend/app.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        # Wait a bit to make sure it starts
        time.sleep(2)
        print("Backend server started successfully")
        return True
    except Exception as e:
        print(f"Error starting backend server: {e}")
        return False

def start_frontend():
    """Start the frontend server"""
    print("\nStarting frontend server...")
    try:
        process = subprocess.Popen(
            ["cd", "frontend", "&&", "npm", "start"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
            text=True
        )
        # Wait a bit to make sure it starts
        time.sleep(2)
        print("Frontend server started successfully")
        return True
    except Exception as e:
        print(f"Error starting frontend server: {e}")
        return False

if __name__ == "__main__":
    print("\n=== Hotel Management System Setup ===\n")
    
    print("This script will set up the hotel management database and ensure data persistence.")
    
    # Make multiple attempts with a short delay
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        print(f"\nAttempt {attempt}/{max_attempts} to set up database...")
        
        if setup_tables():
            print("\nDatabase setup successfully!")
            check_database_status()
            
            start_services = input("\nDo you want to start the backend and frontend servers? (y/n): ")
            if start_services.lower() == 'y':
                backend_started = start_backend()
                if backend_started:
                    start_frontend()
            
            print("\nSetup completed. Your database is now persistent and properly configured.")
            break
        else:
            if attempt < max_attempts:
                print(f"Database setup failed. Retrying in 2 seconds...")
                time.sleep(2)
            else:
                print("All attempts to set up database failed. Please check your MySQL configuration.")
                sys.exit(1) 