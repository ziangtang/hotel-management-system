import sys
sys.path.append('./backend')

from backend.config import DB_CONFIG
import mysql.connector

def create_stay_len_function():
    try:
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Create STAY_LEN function if it doesn't exist
        cursor.execute("""
        CREATE FUNCTION IF NOT EXISTS STAY_LEN(check_in_date DATE, check_out_date DATE)
        RETURNS INT
        DETERMINISTIC
        RETURN DATEDIFF(check_out_date, check_in_date)
        """)
        
        connection.commit()
        print("STAY_LEN function created successfully")
        
        # Check if function exists
        cursor.execute("SHOW FUNCTION STATUS WHERE Db = %s AND Name = 'STAY_LEN'", (DB_CONFIG['database'],))
        function = cursor.fetchone()
        if function:
            print(f"Function verified: {function[1]}")
        else:
            print("Warning: Function was not created properly")
        
        cursor.close()
        connection.close()
    except mysql.connector.Error as e:
        print(f"Database Error: {e}")

if __name__ == "__main__":
    create_stay_len_function() 