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
                if statement.strip():
                    cursor.execute(statement)
            connection.commit()
        print(f"Script {file_path} executed successfully")
    except Error as err:
        print(f"Error: '{err}'")
    except IOError as err:
        print(f"Error reading file: '{err}'")

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
            
            print("Database setup completed successfully!")
            connection.close()

if __name__ == "__main__":
    main()