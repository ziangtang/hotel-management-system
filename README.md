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