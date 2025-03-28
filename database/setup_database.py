import mysql.connector
from mysql.connector import Error
import os
import sys

# Add the parent directory to the path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.config import DB_CONFIG

DB_NAME = 'hotel_management'

def create_connection(host_name, user_name, user_password, db_name=None):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db_name
        )
        print("MySQL Database connection successful")
    except Error as err:
        print(f"Error: '{err}'")
    return connection

def create_database(connection, query):
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        print("Database created successfully")
    except Error as err:
        print(f"Error: '{err}'")

def execute_script_file(connection, file_path):
    cursor = connection.cursor()
    try:
        with open(file_path, 'r') as file:
            script = file.read()
            # Split script into individual statements
            statements = script.split(';')
            for statement in statements:
                statement = statement.strip()
                if statement:
                    try:
                        cursor.execute(statement)
                        # Consume any result to prevent "Unread result found" error
                        if cursor.with_rows:
                            cursor.fetchall()
                    except Error as err:
                        print(f"Error executing statement: {err}")
                        print(f"Statement: {statement[:100]}...")
            connection.commit()
        print(f"Script {file_path} executed successfully")
    except Error as err:
        print(f"Error: '{err}'")
    except IOError as err:
        print(f"Error reading file: '{err}'")

def fix_room_table(connection):
    """Fix the ROOM table by inserting with explicit column names"""
    print("Ensuring ROOM table has proper data...")
    cursor = connection.cursor()
    
    try:
        # First check if ROOM table exists and has data
        cursor.execute("SELECT COUNT(*) FROM ROOM")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("ROOM table is empty. Adding room data with correct format...")
            
            # Clear any potential partial data
            cursor.execute("DELETE FROM ROOM")
            
            # Insert the corrected data with explicit columns
            room_data = """
            INSERT INTO ROOM 
            (Room_no, BookID, Descriptions, Capacity, Square_ft, Deluxe_flag, Kitchen, 
            Superior_flag, Balcony, Standard_flag, Amentities, Ocean_view_flag, Ocean, 
            Cityview_flag, City, Mtview_flag, Mountain, price_per_night) VALUES 
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
            """
            
            # Execute each INSERT separately to avoid issues
            statements = room_data.split('),')
            for i, stmt in enumerate(statements):
                if i < len(statements) - 1:
                    stmt = stmt + ")"
                
                try:
                    cursor.execute(stmt)
                except Error as err:
                    print(f"Error inserting room data: {err}")
                    print(f"Statement: {stmt[:100]}...")
            
            connection.commit()
            print("ROOM table data inserted successfully")
            
            # Verify the fix
            cursor.execute("SELECT COUNT(*) FROM ROOM")
            new_count = cursor.fetchone()[0]
            print(f"ROOM table now has {new_count} records")
        else:
            print(f"ROOM table already contains {count} records")
        
        return True
    except Error as err:
        print(f"Error fixing ROOM table: {err}")
        return False

def main():
    # Create a connection to MySQL server without specifying a database
    connection = create_connection(
        DB_CONFIG['host'], 
        DB_CONFIG['user'], 
        DB_CONFIG['password']
    )
    
    if connection is not None:
        # Create database
        create_database(connection, f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        
        # Close the connection
        connection.close()
        
        # Reconnect with the database selected
        connection = create_connection(
            DB_CONFIG['host'], 
            DB_CONFIG['user'], 
            DB_CONFIG['password'], 
            DB_NAME
        )
        
        if connection is not None:
            # Get the current directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Execute the DDL script to create tables
            ddl_path = os.path.join(current_dir, 'dbDDL.sql')
            execute_script_file(connection, ddl_path)
            
            # Execute the DML script to insert sample data
            dml_path = os.path.join(current_dir, 'dbDML.sql')
            execute_script_file(connection, dml_path)
            
            # Fix the ROOM table data if needed
            fix_room_table(connection)
            
            print("Database setup completed successfully!")
            connection.close()

if __name__ == "__main__":
    main()