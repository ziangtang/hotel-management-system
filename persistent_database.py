import mysql.connector
from mysql.connector import Error
import os
import sys

# Add the parent directory to the path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.config import DB_CONFIG

# Database name constant
DB_NAME = 'hotel_management'

def create_database_connection(host, user, password, database=None):
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

def check_database_exists():
    """Check if the database exists"""
    # Connect to MySQL without specifying database
    connection = create_database_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password']
    )
    
    if not connection:
        print("Failed to connect to MySQL server")
        return False
    
    cursor = connection.cursor()
    cursor.execute("SHOW DATABASES")
    databases = [db[0] for db in cursor.fetchall()]
    
    exists = DB_NAME in databases
    if exists:
        print(f"Database '{DB_NAME}' exists")
    else:
        print(f"Database '{DB_NAME}' does not exist")
    
    cursor.close()
    connection.close()
    return exists

def create_database():
    """Create the database if it doesn't exist"""
    connection = create_database_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password']
    )
    
    if not connection:
        print("Failed to connect to MySQL server")
        return False
    
    cursor = connection.cursor()
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' created or already exists")
        return True
    except Error as e:
        print(f"Error creating database: {e}")
        return False
    finally:
        cursor.close()
        connection.close()

def execute_sql_script(file_path):
    """Execute an SQL script file"""
    connection = create_database_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password'],
        DB_NAME
    )
    
    if not connection:
        print(f"Failed to connect to database '{DB_NAME}'")
        return False
    
    cursor = connection.cursor()
    
    try:
        with open(file_path, 'r') as file:
            script = file.read()
            
            # Split script into statements (handle multiple statements)
            statements = script.split(';')
            
            for statement in statements:
                statement = statement.strip()
                if statement:  # Skip empty statements
                    try:
                        cursor.execute(statement)
                        # Consume any result to avoid "unread result" errors
                        if cursor.with_rows:
                            cursor.fetchall()
                    except Error as e:
                        print(f"Error executing statement: {e}")
                        print(f"Statement: {statement[:100]}...")
            
            connection.commit()
            print(f"Executed script: {file_path}")
            return True
    except Error as e:
        print(f"Error executing script {file_path}: {e}")
        return False
    except IOError as e:
        print(f"Error reading file {file_path}: {e}")
        return False
    finally:
        cursor.close()
        connection.close()

def check_tables_exist():
    """Check if tables exist in the database"""
    connection = create_database_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password'],
        DB_NAME
    )
    
    if not connection:
        return False
    
    cursor = connection.cursor()
    
    try:
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        expected_tables = ['booking', 'guest', 'payment', 'cancellation', 'invoice', 'invoice1', 'review', 'room']
        
        for table in expected_tables:
            if table.lower() not in tables:
                print(f"Table '{table}' not found")
                return False
        
        print("All expected tables exist")
        return True
    except Error as e:
        print(f"Error checking tables: {e}")
        return False
    finally:
        cursor.close()
        connection.close()

def check_data_exists():
    """Check if sample data exists in the tables"""
    connection = create_database_connection(
        DB_CONFIG['host'],
        DB_CONFIG['user'],
        DB_CONFIG['password'],
        DB_NAME
    )
    
    if not connection:
        return False
    
    cursor = connection.cursor()
    
    try:
        # Check various tables for data
        tables = ['GUEST', 'BOOKING', 'ROOM']
        has_data = True
        
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"Table {table} has {count} records")
            if count == 0:
                has_data = False
        
        return has_data
    except Error as e:
        print(f"Error checking for data: {e}")
        return False
    finally:
        cursor.close()
        connection.close()

def main():
    """Main function to ensure database is set up properly"""
    print("\n=== Persistent Database Setup ===\n")
    
    # Step 1: Check if database exists, create if needed
    if not check_database_exists():
        if not create_database():
            print("Failed to create database. Exiting.")
            return
    
    # Step 2: Check if tables exist, create if needed
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    tables_exist = check_tables_exist()
    if not tables_exist:
        print("Creating tables...")
        ddl_path = os.path.join(current_dir, 'database', 'dbDDL.sql')
        if not os.path.exists(ddl_path):
            print(f"DDL file not found at {ddl_path}")
            return
        
        if not execute_sql_script(ddl_path):
            print("Failed to create tables. Exiting.")
            return
    
    # Step 3: Check if data exists, insert if needed
    data_exists = check_data_exists()
    if not data_exists:
        print("Inserting sample data...")
        dml_path = os.path.join(current_dir, 'database', 'dbDML.sql')
        if not os.path.exists(dml_path):
            print(f"DML file not found at {dml_path}")
            return
        
        if not execute_sql_script(dml_path):
            print("Failed to insert sample data. Exiting.")
            return
    
    print("\n=== Database is ready! ===\n")

if __name__ == "__main__":
    main() 