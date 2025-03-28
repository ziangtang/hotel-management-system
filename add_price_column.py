import sys
sys.path.append('./backend')

from backend.config import DB_CONFIG
import mysql.connector
from mysql.connector import Error

def add_price_column():
    try:
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Check if price_per_night column already exists
        cursor.execute("SHOW COLUMNS FROM ROOM LIKE 'price_per_night'")
        column_exists = cursor.fetchone()
        
        if not column_exists:
            # Add price_per_night column to ROOM table
            cursor.execute("""
            ALTER TABLE ROOM
            ADD COLUMN price_per_night DECIMAL(10,2) DEFAULT 100.00
            """)
            
            # Update prices based on room type for existing rooms
            cursor.execute("""
            UPDATE ROOM
            SET price_per_night = 
                CASE 
                    WHEN Deluxe_flag = 'Y' THEN 200.00
                    WHEN Superior_flag = 'Y' THEN 175.00
                    WHEN Standard_flag = 'Y' THEN 150.00
                    ELSE 100.00
                END
            """)
            
            connection.commit()
            print("Price column added and prices set for all rooms")
        else:
            print("Price column already exists")
        
        # Verify column was added
        cursor.execute("SELECT Room_no, Descriptions, price_per_night FROM ROOM LIMIT 5")
        rooms = cursor.fetchall()
        print("\nSample room prices:")
        for room in rooms:
            print(f"Room {room[0]} ({room[1]}): ${room[2]}")
        
        cursor.close()
        connection.close()
    except Error as e:
        print(f"Database Error: {e}")

if __name__ == "__main__":
    add_price_column() 