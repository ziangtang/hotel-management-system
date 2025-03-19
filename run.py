import os
import subprocess
import sys
import time
import webbrowser

def setup_database():
    print("Setting up the database...")
    db_setup_script = os.path.join('database', 'setup_database.py')
    subprocess.run([sys.executable, db_setup_script], check=True)

def start_backend():
    print("Starting the backend server...")
    backend_script = os.path.join('backend', 'app.py')
    backend_process = subprocess.Popen([sys.executable, backend_script])
    return backend_process

def start_frontend():
    print("Starting the frontend development server...")
    os.chdir('frontend')
    frontend_process = subprocess.Popen(['npm', 'start'], shell=True)
    os.chdir('..')
    return frontend_process

def main():
    # Setup the database first
    try:
        setup_database()
    except subprocess.CalledProcessError:
        print("Database setup failed. Please check the error messages above.")
        return
    
    # Start the backend server
    backend_process = start_backend()
    
    # Wait for the backend to start
    print("Waiting for the backend server to start...")
    time.sleep(5)
    
    # Start the frontend development server
    frontend_process = start_frontend()
    
    # Open the application in the default web browser
    print("Opening the application in your web browser...")
    webbrowser.open('http://localhost:3000')
    
    print("\nHotel Management System is running!")
    print("Press Ctrl+C to stop the application.")
    
    try:
        # Keep the script running until interrupted
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping the application...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Application stopped.")

if __name__ == "__main__":
    main()