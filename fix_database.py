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

def fix_room_table(connection):
    try:
        cursor = connection.cursor()
        
        # Check if price_per_night column exists
        cursor.execute("SHOW COLUMNS FROM ROOM LIKE 'price_per_night'")
        if not cursor.fetchone():
            # Add price_per_night column if it doesn't exist
            cursor.execute("""
            ALTER TABLE ROOM
            ADD COLUMN price_per_night DECIMAL(10,2) DEFAULT 200.00
            """)
            print("Added price_per_night column to ROOM table")
        
        # Set prices based on room type for all rooms
        cursor.execute("""
        UPDATE ROOM
        SET price_per_night = 
            CASE 
                WHEN Descriptions = 'King' THEN 250.00
                WHEN Descriptions = 'Queen' THEN 200.00
                WHEN Descriptions = 'Standard' AND Deluxe_flag = 'Y' THEN 220.00
                WHEN Descriptions = 'Standard' THEN 180.00
                ELSE 150.00
            END
        """)
        
        connection.commit()
        print("Updated prices for all rooms")
        
        # Verify data
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
    except Error as e:
        print(f"Error fixing room table: {e}")

def reload_data_if_needed(connection):
    try:
        cursor = connection.cursor()
        
        # Check if tables are empty
        cursor.execute("SELECT COUNT(*) FROM BOOKING")
        booking_count = cursor.fetchone()[0]
        
        if booking_count == 0:
            # If tables are empty, run the dbDML.sql script
            print("Tables are empty, reloading data...")
            
            # Get the current directory (should be project root)
            current_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Path to dbDML.sql
            dml_file = os.path.join(current_dir, 'database', 'dbDML.sql')
            
            print(f"Loading data from: {dml_file}")
            
            # Execute the SQL script
            with open(dml_file, 'r') as file:
                sql_script = file.read()
                
                # Split the script by semicolons
                statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]
                
                for statement in statements:
                    try:
                        cursor.execute(statement)
                        # Consume result to prevent "unread result found" error
                        if cursor.with_rows:
                            cursor.fetchall()
                    except Error as e:
                        print(f"Error executing statement: {e}")
                        print(f"Statement: {statement[:100]}...")
                
                connection.commit()
                print("Data reload completed")
        else:
            print(f"Tables already have data (found {booking_count} bookings), no need to reload")
        
        cursor.close()
    except Error as e:
        print(f"Error reloading data: {e}")

if __name__ == "__main__":
    connection = create_connection()
    
    if connection:
        fix_room_table(connection)
        reload_data_if_needed(connection)
        
        # Close connection
        connection.close()
        print("\nDatabase fix completed") 