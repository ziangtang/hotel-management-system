import sys
sys.path.append('./backend')

from backend.config import DB_CONFIG
import mysql.connector

def check_bookings():
    try:
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        # Check if BOOKING table exists
        cursor.execute("SHOW TABLES LIKE 'BOOKING'")
        if not cursor.fetchone():
            print("BOOKING table does not exist!")
            return
        
        # Check bookings
        cursor.execute("SELECT BookID, Check_in, Check_out FROM BOOKING")
        results = cursor.fetchall()
        print(f"Found {len(results)} bookings:")
        for row in results:
            print(row)
        
        # Test STAY_LEN function
        print("\nTesting STAY_LEN function:")
        try:
            cursor.execute("SELECT BookID, Check_in, Check_out, STAY_LEN(Check_in, Check_out) AS stay_days FROM BOOKING")
            results = cursor.fetchall()
            for row in results:
                print(f"BookID: {row[0]}, Check-in: {row[1]}, Check-out: {row[2]}, Stay Length: {row[3]} days")
        except mysql.connector.Error as e:
            print(f"Error testing STAY_LEN function: {e}")
        
        # Check if STAY_LEN function exists
        print("\nChecking if STAY_LEN function exists:")
        cursor.execute("SHOW FUNCTION STATUS WHERE Db = %s", (DB_CONFIG['database'],))
        functions = cursor.fetchall()
        print(f"Found {len(functions)} functions:")
        for func in functions:
            print(f"Function: {func[1]}")
        
        cursor.close()
        connection.close()
    except mysql.connector.Error as e:
        print(f"Database Error: {e}")

if __name__ == "__main__":
    check_bookings() 