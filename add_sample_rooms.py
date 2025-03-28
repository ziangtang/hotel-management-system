import sys
sys.path.append('./backend')

from backend.config import DB_CONFIG
import mysql.connector
from mysql.connector import Error

def add_sample_rooms():
    try:
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Check if we already have room data
        cursor.execute("SELECT COUNT(*) FROM ROOM")
        count = cursor.fetchone()[0]
        
        if count == 0:
            # Sample room data
            rooms = [
                (101, None, 'King', 2, 400, 'Y', 'Full Kitchen', 'N', 'Large Balcony', 'N', 'Wi-Fi, TV, Mini-bar', 'Y', 'Full Ocean', 'N', None, 'N', None, 250.00),
                (102, None, 'Queen', 2, 350, 'N', 'Kitchenette', 'Y', 'Small Balcony', 'N', 'Wi-Fi, TV', 'N', None, 'Y', 'City View', 'N', None, 200.00),
                (103, None, 'Standard', 2, 300, 'N', 'No Kitchen', 'N', 'No Balcony', 'Y', 'Wi-Fi', 'N', None, 'N', None, 'Y', 'Mountain View', 150.00),
                (104, None, 'King', 4, 500, 'Y', 'Full Kitchen', 'Y', 'Large Balcony', 'N', 'Wi-Fi, TV, Mini-bar, Jacuzzi', 'Y', 'Panoramic Ocean', 'N', None, 'N', None, 350.00),
                (105, None, 'Queen', 3, 400, 'N', 'Kitchenette', 'Y', 'Small Balcony', 'N', 'Wi-Fi, TV, Mini-bar', 'N', None, 'Y', 'Downtown View', 'N', None, 220.00)
            ]
            
            for room in rooms:
                cursor.execute("""
                INSERT INTO ROOM (Room_no, BookID, Descriptions, Capacity, Square_ft, Deluxe_flag, 
                                 Kitchen, Superior_flag, Balcony, Standard_flag, Amentities,
                                 Ocean_view_flag, Ocean, Cityview_flag, City, Mtview_flag, Mountain, price_per_night)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, room)
            
            connection.commit()
            print(f"Added {len(rooms)} sample rooms to the database")
        else:
            print(f"Database already has {count} rooms")
            
            # Update sample data with prices just in case
            cursor.execute("""
            UPDATE ROOM
            SET price_per_night = 
                CASE 
                    WHEN Room_no = 101 THEN 250.00
                    WHEN Room_no = 102 THEN 200.00
                    WHEN Room_no = 103 THEN 150.00
                    WHEN Room_no = 104 THEN 350.00
                    WHEN Room_no = 105 THEN 220.00
                    ELSE price_per_night
                END
            WHERE Room_no IN (101, 102, 103, 104, 105)
            """)
            connection.commit()
            print("Updated prices for sample rooms")
        
        # Check what's in the database now
        cursor.execute("SELECT Room_no, Descriptions, price_per_night FROM ROOM")
        rooms = cursor.fetchall()
        print("\nCurrent rooms in database:")
        for room in rooms:
            print(f"Room {room[0]}: {room[1]} - ${room[2]:.2f}/night")
        
        cursor.close()
        connection.close()
    except Error as e:
        print(f"Database Error: {e}")

if __name__ == "__main__":
    add_sample_rooms() 