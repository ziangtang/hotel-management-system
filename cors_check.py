import requests
import json

def test_api():
    """Test various API endpoints to check for issues"""
    base_url = "http://localhost:5000/api"
    
    endpoints = [
        "/rooms",
        "/customers",
        "/reservations"
    ]
    
    print("API Test Results:")
    print("-" * 50)
    
    for endpoint in endpoints:
        url = base_url + endpoint
        print(f"\nTesting endpoint: {url}")
        
        try:
            response = requests.get(url)
            
            # Print status and headers
            print(f"Status: {response.status_code}")
            print(f"Content-Type: {response.headers.get('Content-Type')}")
            
            # Check for CORS headers
            if "Access-Control-Allow-Origin" in response.headers:
                print(f"CORS: {response.headers.get('Access-Control-Allow-Origin')}")
            else:
                print("CORS: No Access-Control-Allow-Origin header found")
            
            # Print data preview
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    count = len(data)
                    print(f"Data count: {count} items")
                    
                    if count > 0:
                        # Check first item for price_per_night if it's the rooms endpoint
                        if endpoint == "/rooms":
                            first_item = data[0]
                            if "price_per_night" in first_item:
                                print(f"Price found: ${first_item['price_per_night']}")
                            else:
                                print("Price NOT found in data")
                            
                            # Print sample room data
                            print("\nSample room data:")
                            print(json.dumps(first_item, indent=2)[:500] + "...")
                else:
                    print("Data: Not a list")
            
        except Exception as e:
            print(f"Error: {str(e)}")
    
    print("\n" + "-" * 50)

if __name__ == "__main__":
    test_api() 