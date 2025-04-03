# GCP Config
![image](https://github.com/user-attachments/assets/68967cda-a9e7-4f0f-8eff-e93de6f1eb7a)
![image](https://github.com/user-attachments/assets/f22240ec-3780-495e-bd08-40a6de9a2c6e)



# Dashboard
![image](https://github.com/user-attachments/assets/5fb69dac-8cef-4739-aa1c-16afa252023a)

# Room types
![image](https://github.com/user-attachments/assets/23ebb22e-107e-4051-b8b5-a82d5dc79f77)

# Rooms
![image](https://github.com/user-attachments/assets/64db4eb8-56f8-4352-8760-24816f562002)

# Reservation
![image](https://github.com/user-attachments/assets/1b2c8882-6e5f-4d31-9180-e733968beff1)

# Customer
![image](https://github.com/user-attachments/assets/520af431-ff07-4210-8cb1-961a801247d6)

# SQL query interface
![image](https://github.com/user-attachments/assets/9c83531c-b467-4d24-aae8-515cc5273a09)

# DB feature
![image](https://github.com/user-attachments/assets/84f990fe-de4f-4092-9af1-61c7f0b1456a)

# Error handler
![image](https://github.com/user-attachments/assets/9c451028-7d23-42a2-bafd-3c434b01e227)

# Hotel Management System

## Database Persistence Fix

We've identified and fixed issues with data persistence in the MySQL database. The key problems were:

1. The database was being recreated on every application restart due to DROP statements in the DDL file
2. The ROOM table insert statement had a column count mismatch (`price_per_night` column was missing), causing data insertion to fail
3. MySQL functions and triggers were not being created correctly due to missing DELIMITER statements

## How to Fix and Run the Application

### Quick Fix: Use the Setup Script

Run the all-in-one setup script that properly initializes the database with persistent data:

```
python setup.py
```

This script:
- Creates the database if it doesn't exist
- Gives you the option to recreate tables or use existing ones
- Creates all tables, views, functions, and triggers correctly
- Inserts sample data with the proper format
- Verifies the database status
- Offers to start both the backend and frontend servers

The script verifies all steps and displays helpful information about your database.

### Restart Just the Servers

If you've already set up the database and just need to start the servers:

```
# Start backend
cd backend
python app.py

# Start frontend (in a new terminal)
cd frontend
npm start
```

## Technical Details of the Fix

1. Fixed the ROOM table insert by adding explicit column specifications
2. Created a robust database setup process that doesn't lose data between restarts
3. Fixed function and trigger creation to use proper MySQL syntax
4. Added proper error handling and diagnostics 
5. Corrected GuestID format in all tables (from leading zeros format to standard integers)
6. Ensured all table relationships are maintained

## Project Structure

- `/backend` - Flask backend API
- `/frontend` - React frontend application
- `/database` - SQL scripts for database setup
- `setup.py` - All-in-one setup script
- `fix_room_table.py` - Script to fix ROOM table data specifically
- `check_mysql_config.py` - MySQL configuration checker
- `persistent_database.py` - Additional database persistence troubleshooter
- `README.md` - This documentation

## If You Continue to Experience Data Loss

If you continue to experience data loss after implementing these fixes, please check:

1. MySQL service configuration - ensure it's set to run automatically
2. Check MySQL data directory permissions 
3. Verify that no other scripts are dropping or recreating the database

The setup script outputs valuable diagnostics information, including storage engine settings that affect persistence.

## Common Error: Function Syntax

When creating MySQL functions directly through SQL scripts, ensure you use proper DELIMITER statements:

```sql
DELIMITER //
CREATE FUNCTION STAY_LEN(Check_in DATE, Check_out DATE) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE NUMB_OF_DAY INT;
    SET NUMB_OF_DAY = DATEDIFF(Check_out, Check_in);
    RETURN NUMB_OF_DAY;
END//
DELIMITER ;
``` 
