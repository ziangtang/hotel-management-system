import mysql.connector
from mysql.connector import Error
import os
import sys

# Add the parent directory to the path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.config import DB_CONFIG

def check_mysql_config():
    """Check MySQL configuration parameters that might affect data persistence"""
    try:
        # Connect to MySQL server
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        
        if not connection.is_connected():
            print("Failed to connect to MySQL server")
            return
            
        print("Connected to MySQL server successfully")
        
        cursor = connection.cursor()
        
        # Check MySQL version
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()[0]
        print(f"MySQL version: {version}")
        
        # Check data directory location
        cursor.execute("SHOW VARIABLES LIKE 'datadir'")
        datadir = cursor.fetchone()[1]
        print(f"Data directory: {datadir}")
        
        # Check default storage engine
        cursor.execute("SHOW VARIABLES LIKE 'default_storage_engine'")
        storage_engine = cursor.fetchone()[1]
        print(f"Default storage engine: {storage_engine}")
        
        # Check if database exists
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        if 'hotel_management' in databases:
            print("'hotel_management' database exists")
            
            # Connect to the hotel_management database
            cursor.close()
            connection.close()
            
            connection = mysql.connector.connect(
                host=DB_CONFIG['host'],
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                database='hotel_management'
            )
            cursor = connection.cursor()
            
            # Check tables in the database
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"Tables in 'hotel_management': {[table[0] for table in tables]}")
            
            # Check storage engines for tables
            print("\nTable storage engines:")
            for table in tables:
                cursor.execute(f"SHOW CREATE TABLE {table[0]}")
                create_table = cursor.fetchone()[1]
                if "ENGINE=" in create_table:
                    engine = create_table.split("ENGINE=")[1].split(" ")[0]
                    print(f"  {table[0]}: {engine}")
        else:
            print("'hotel_management' database does not exist")
        
        cursor.close()
        connection.close()
        
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")

if __name__ == "__main__":
    check_mysql_config() 