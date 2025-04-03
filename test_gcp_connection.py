import mysql.connector
from mysql.connector import Error

# GCP MySQL Connection configuration
DB_CONFIG = {
    'host': '34.136.157.193',
    'port': 3306,  # Explicitly define the port
    'user': 'cs5200user',
    'password': 'StrongPassword123!',
    'database': 'hotel_management',
    'connect_timeout': 10  # Add timeout parameter (10 seconds)
}

def test_gcp_connection():
    """Test connection to GCP MySQL database"""
    try:
        # Attempt to establish connection
        print("Attempting to connect to GCP MySQL...")
        connection = mysql.connector.connect(**DB_CONFIG)
        
        if connection.is_connected():
            # Get server information
            db_info = connection.get_server_info()
            print(f"SUCCESS: Connected to GCP MySQL Server version: {db_info}")
            
            # Get cursor and execute a simple query
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            database_name = cursor.fetchone()[0]
            print(f"Connected to database: {database_name}")
            
            try:
                # Test a simple query to verify data access
                print("\nChecking database tables:")
                cursor.execute("SHOW TABLES;")
                tables = cursor.fetchall()
                
                if tables:
                    table_names = [table[0] for table in tables]
                    print(f"Tables in the database: {table_names}")
                    
                    # Get row count from a few tables to verify data
                    print("\nChecking row counts in tables:")
                    for table in table_names[:3]:  # Check first 3 tables
                        try:
                            cursor.execute(f"SELECT COUNT(*) FROM {table};")
                            row_count = cursor.fetchone()[0]
                            print(f"- Table '{table}' has {row_count} rows")
                        except Error as e:
                            print(f"- Error counting rows in '{table}': {e}")
                else:
                    print("No tables found in the database.")
            except Error as e:
                print(f"Error executing table queries: {e}")
            
            # Close cursor and connection
            cursor.close()
            connection.close()
            print("\nMySQL connection closed")
            return True
        
    except Error as e:
        print(f"ERROR: Could not connect to GCP MySQL database: {e}")
        return False

if __name__ == "__main__":
    print("=== GCP MySQL Connection Test ===")
    test_gcp_connection() 