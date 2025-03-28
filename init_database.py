import mysql.connector
from mysql.connector import Error
import os
import sys
import time

# Add the parent directory to the path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.config import DB_CONFIG

# Database name constant
DB_NAME = 'hotel_management'

def create_connection(host, user, password, database=None):
    """Create a connection to the MySQL database"""
    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        print(f"Connected to MySQL{' database: ' + database if database else ''}")
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def setup_database():
    """Set up the database, create tables if they don't exist, and populate with data"""
    connection = create_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password']
    )
    
    if not connection:
        print("Failed to connect to MySQL server. Make sure MySQL is running.")
        return False
    
    cursor = connection.cursor()
    
    try:
        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' created or already exists")
        
        # Close connection to connect with database selected
        cursor.close()
        connection.close()
        
        # Connect to the database
        connection = create_connection(
            DB_CONFIG['host'],
            DB_CONFIG['user'],
            DB_CONFIG['password'],
            DB_NAME
        )
        
        if not connection:
            print(f"Failed to connect to database '{DB_NAME}'")
            return False
        
        cursor = connection.cursor()
        
        # Check if tables already exist
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        if len(tables) == 0:
            print("No tables found. Creating tables...")
            
            # Get the current directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Execute DDL script to create tables
            ddl_path = os.path.join(current_dir, 'database', 'dbDDL.sql')
            if os.path.exists(ddl_path):
                with open(ddl_path, 'r') as file:
                    script = file.read()
                    statements = script.split(';')
                    
                    for statement in statements:
                        statement = statement.strip()
                        if statement:
                            try:
                                cursor.execute(statement)
                                # Consume result to avoid "unread result" errors
                                if cursor.with_rows:
                                    cursor.fetchall()
                            except Error as e:
                                print(f"Error executing DDL statement: {e}")
                                print(f"Statement: {statement[:100]}...")
                    
                    connection.commit()
                    print("Tables created successfully")
            else:
                print(f"DDL file not found at {ddl_path}")
                return False
            
            # Check if data exists
            cursor.execute("SELECT COUNT(*) FROM GUEST")
            guest_count = cursor.fetchone()[0]
            
            if guest_count == 0:
                print("No data found. Inserting sample data...")
                
                # Execute corrected DML script to insert data
                dml_path = os.path.join(current_dir, 'database', 'corrected_dbDML.sql')
                if os.path.exists(dml_path):
                    with open(dml_path, 'r') as file:
                        script = file.read()
                        statements = script.split(';')
                        
                        for statement in statements:
                            statement = statement.strip()
                            if statement:
                                try:
                                    cursor.execute(statement)
                                    # Consume result to avoid "unread result" errors
                                    if cursor.with_rows:
                                        cursor.fetchall()
                                except Error as e:
                                    print(f"Error executing DML statement: {e}")
                                    print(f"Statement: {statement[:100]}...")
                        
                        connection.commit()
                        print("Sample data inserted successfully")
                else:
                    print(f"Corrected DML file not found at {dml_path}")
                    return False
        else:
            print(f"Tables already exist in database '{DB_NAME}'")
            
            # Check if data exists
            cursor.execute("SELECT COUNT(*) FROM GUEST")
            guest_count = cursor.fetchone()[0]
            
            if guest_count == 0:
                print("Database exists but no data found. Inserting sample data...")
                
                # Execute corrected DML script to insert data
                dml_path = os.path.join(current_dir, 'database', 'corrected_dbDML.sql')
                if os.path.exists(dml_path):
                    with open(dml_path, 'r') as file:
                        script = file.read()
                        statements = script.split(';')
                        
                        for statement in statements:
                            statement = statement.strip()
                            if statement:
                                try:
                                    cursor.execute(statement)
                                    # Consume result to avoid "unread result" errors
                                    if cursor.with_rows:
                                        cursor.fetchall()
                                except Error as e:
                                    print(f"Error executing DML statement: {e}")
                                    print(f"Statement: {statement[:100]}...")
                        
                        connection.commit()
                        print("Sample data inserted successfully")
                else:
                    print(f"Corrected DML file not found at {dml_path}")
                    return False
            else:
                print(f"Database '{DB_NAME}' is already set up with data")
        
        return True
    except Error as e:
        print(f"Error: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection closed")

def check_database_status():
    """Check database status and print useful information"""
    connection = create_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password'],
        DB_NAME
    )
    
    if not connection:
        print("Failed to connect to database for status check")
        return
    
    cursor = connection.cursor()
    
    try:
        # Print tables and record counts
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        print("\nDatabase Status:")
        print("=" * 40)
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"Table {table}: {count} records")
        
        # Print storage engine information
        print("\nStorage Engine Information:")
        print("=" * 40)
        
        cursor.execute("SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit'")
        result = cursor.fetchone()
        print(f"innodb_flush_log_at_trx_commit: {result[1]}")
        
        cursor.execute("SHOW VARIABLES LIKE 'innodb_file_per_table'")
        result = cursor.fetchone()
        print(f"innodb_file_per_table: {result[1]}")
        
    except Error as e:
        print(f"Error checking database status: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    print("\n=== Hotel Management Database Initializer ===\n")
    
    # Make multiple attempts with a short delay
    max_attempts = 3
    for attempt in range(1, max_attempts + 1):
        print(f"Attempt {attempt}/{max_attempts} to set up database...")
        
        if setup_database():
            print("\nDatabase setup successfully!")
            check_database_status()
            print("\nYou can now start the backend and frontend applications.")
            break
        else:
            if attempt < max_attempts:
                print(f"Database setup failed. Retrying in 2 seconds...")
                time.sleep(2)
            else:
                print("All attempts to set up database failed. Please check your MySQL configuration.")
                sys.exit(1) 