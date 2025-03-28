import sys
import os

# Add the parent directory to the path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.config import DB_CONFIG

import mysql.connector
from mysql.connector import Error

def check_table_schema():
    try:
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        print("Database connection successful")
        
        cursor = connection.cursor()
        
        # Check GUEST table columns
        cursor.execute("DESCRIBE GUEST")
        columns = cursor.fetchall()
        
        print("\nGUEST Table Columns:")
        print("---------------------")
        for column in columns:
            print(f"Column: {column[0]}")
            print(f"Type: {column[1]}")
            print(f"Null: {column[2]}")
            print(f"Key: {column[3]}")
            print(f"Default: {column[4]}")
            print(f"Extra: {column[5]}")
            print()
        
        # Check recent customers
        cursor.execute("SELECT * FROM GUEST ORDER BY GusID DESC LIMIT 3")
        guests = cursor.fetchall()
        
        print("\nRecent Customers:")
        print("----------------")
        for guest in guests:
            print(f"ID: {guest[0]}")
            print(f"Last Name: {guest[1]}")
            print(f"First Name: {guest[2]}")
            print(f"Phone: {guest[3]}")
            print(f"Email: {guest[4]}")
            print(f"Address: {guest[5]}")
            print(f"Address Length: {len(guest[5]) if guest[5] else 0} characters")
            print()
        
        cursor.close()
        connection.close()
        print("Database connection closed")
        
    except Error as e:
        print(f"Database Error: {e}")

if __name__ == "__main__":
    check_table_schema() 