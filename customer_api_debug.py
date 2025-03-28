import sys
import os
import json
import requests

# Base URL for the API
API_URL = "http://localhost:5000/api"

def test_create_customer():
    """Test creating a new customer"""
    
    # Sample customer data
    customer_data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe_test@example.com",
        "phone": "(555) 123-4567",
        "street": "123 Main St",
        "city": "Boston",
        "state": "MA"
    }
    
    print("\n1. Testing Create Customer")
    print("--------------------------")
    print(f"Request URL: {API_URL}/customers")
    print(f"Request data: {json.dumps(customer_data, indent=2)}")
    
    try:
        response = requests.post(f"{API_URL}/customers", json=customer_data)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {json.dumps(dict(response.headers), indent=2)}")
        
        if response.status_code == 201:
            print("Success! Customer created.")
            customer_id = response.json().get("id")
            print(f"New customer ID: {customer_id}")
            return customer_id
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Exception: {str(e)}")
        return None

def test_update_customer(customer_id):
    """Test updating an existing customer"""
    if not customer_id:
        print("\nSkipping update test - no customer ID")
        return
    
    # Updated customer data
    updated_data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe_test@example.com",
        "phone": "(555) 123-4567",
        "street": "456 Updated St",
        "city": "Cambridge",
        "state": "MA"
    }
    
    print("\n2. Testing Update Customer")
    print("--------------------------")
    print(f"Request URL: {API_URL}/customers/{customer_id}")
    print(f"Request data: {json.dumps(updated_data, indent=2)}")
    
    try:
        response = requests.put(f"{API_URL}/customers/{customer_id}", json=updated_data)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {json.dumps(dict(response.headers), indent=2)}")
        
        if response.status_code == 200:
            print("Success! Customer updated.")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")

def test_get_customer(customer_id):
    """Test retrieving a customer"""
    if not customer_id:
        print("\nSkipping get test - no customer ID")
        return
    
    print("\n3. Testing Get Customer")
    print("----------------------")
    print(f"Request URL: {API_URL}/customers/{customer_id}")
    
    try:
        response = requests.get(f"{API_URL}/customers/{customer_id}")
        
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            print("Success! Customer retrieved.")
            print(f"Customer data: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    print("Customer API Debug Tool")
    print("======================")
    
    # Test creating a customer
    customer_id = test_create_customer()
    
    # Test updating the customer
    test_update_customer(customer_id)
    
    # Test retrieving the customer
    test_get_customer(customer_id) 