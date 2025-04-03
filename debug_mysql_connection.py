import mysql.connector
from mysql.connector import Error
import time
import sys

# GCP MySQL Connection configuration
DB_CONFIG = {
    'host': '34.136.157.193',
    'port': 3306,
    'user': 'cs5200user',
    'password': 'StrongPassword123!',
    'database': 'hotel_management',
    'connect_timeout': 5  # Short timeout
}

def debug_connection():
    """Test MySQL connection with detailed error reporting"""
    print(f"\n=== MySQL Connection Debug ===")
    print(f"Host: {DB_CONFIG['host']}")
    print(f"Port: {DB_CONFIG['port']}")
    print(f"User: {DB_CONFIG['user']}")
    print(f"Database: {DB_CONFIG['database']}")
    print(f"Timeout: {DB_CONFIG['connect_timeout']} seconds")
    print("-" * 30)
    
    start_time = time.time()
    print("Connecting to MySQL...")
    
    try:
        # First try connecting without specifying the database
        test_config = DB_CONFIG.copy()
        del test_config['database']
        
        print("Step 1: Testing connection without specifying database...")
        connection = mysql.connector.connect(**test_config)
        
        if connection.is_connected():
            server_info = connection.get_server_info()
            print(f"✓ Connected to MySQL Server version {server_info}")
            
            # Test if we can query for databases
            cursor = connection.cursor()
            print("Step 2: Listing available databases...")
            cursor.execute("SHOW DATABASES")
            databases = [db[0] for db in cursor.fetchall()]
            print(f"Available databases: {', '.join(databases)}")
            
            # Check if our target database exists
            if DB_CONFIG['database'] in databases:
                print(f"✓ Database '{DB_CONFIG['database']}' exists")
            else:
                print(f"✗ Database '{DB_CONFIG['database']}' does not exist")
                print("  You need to create this database first")
                
            cursor.close()
            connection.close()
            print("Connection closed")
            
            # Now try connecting with the database specified
            print(f"\nStep 3: Testing connection to database '{DB_CONFIG['database']}'...")
            connection = mysql.connector.connect(**DB_CONFIG)
            
            if connection.is_connected():
                print(f"✓ Successfully connected to database '{DB_CONFIG['database']}'")
                
                # Test if we can query for tables
                cursor = connection.cursor()
                print("Step 4: Listing tables in the database...")
                cursor.execute("SHOW TABLES")
                tables = [table[0] for table in cursor.fetchall()]
                
                if tables:
                    print(f"✓ Found {len(tables)} tables: {', '.join(tables)}")
                else:
                    print("✗ No tables found in the database")
                
                cursor.close()
                connection.close()
                print("Connection closed")
                return True
        
    except Error as e:
        duration = time.time() - start_time
        print(f"✗ MySQL Connection Error ({duration:.2f}s): {e}")
        
        # Provide more specific error guidance
        error_str = str(e).lower()
        
        if "access denied" in error_str:
            print("\nAccess denied error detected. This means:")
            print("1. The username or password is incorrect")
            print("2. The user doesn't have permission to access from your IP address")
            print("3. The user may not have permission to access the specified database")
            
        elif "unknown database" in error_str:
            print("\nUnknown database error detected. This means:")
            print(f"1. The database '{DB_CONFIG['database']}' does not exist")
            print("2. You need to create this database first")
            
        elif "can't connect" in error_str or "connection refused" in error_str:
            print("\nConnection refused error detected. This means:")
            print("1. The MySQL server is not running")
            print("2. Firewall rules are blocking the connection")
            print("3. The hostname or port is incorrect")
            
        elif "timed out" in error_str:
            print("\nConnection timeout error detected. This means:")
            print("1. Network latency issues")
            print("2. Firewall blocking the connection")
            print("3. The MySQL server is overloaded")
        
        return False
    
    return False

if __name__ == "__main__":
    debug_connection() 