import requests
import pymongo
import time
import random
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

IDENTITY_API_URL = "http://identity:3001/api/auth/register"

def send_request_with_retry(url, data):
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    session.mount('http://', HTTPAdapter(max_retries=retries))
    try:
        return session.post(url, json=data, timeout=10)
    except Exception as e:
        print(f"Connection failed: {e}")
        return None

def main():
    print("Initializing ETL Seeder Pipeline...")
    # Connect to MongoDB (Source)
    client = pymongo.MongoClient("mongodb://mongodb:27017/")
    db = client["fiks_ml"]
    collection = db["generated_names"]
    
    # Extract "generated" names
    cursor = collection.find({"status": "generated"})
    
    success_count = 0
    
    for doc in cursor:
        user_data = {
            "emri": f"{doc['name']} {doc['surname']}",
            "email": doc["email"],
            "fjalekalimi": "Password123!",
            "roli": "shfrytezues",
            "adresa": "Rruga ML Pipeline 123",
            "qyteti_id": random.randint(1, 9)
        }
        
        try:
            # Transform & Load (API Call)
            print(f"Seeding user: {user_data['email']}")
            
            response = send_request_with_retry(IDENTITY_API_URL, user_data)
            
            if response and response.status_code == 201:
                print(f"✅ Registered: {user_data['emri']}")
                # Update status in Data Lake (Mongo)
                collection.update_one({"_id": doc["_id"]}, {"$set": {"status": "seeded"}})
                success_count += 1
            else:
                if response:
                    print(f"❌ Failed: {response.text}")
                else:
                    print("❌ Failed: No Response")
                
        except Exception as e:
            print(f"Error seeding {doc['name']}: {e}")
            
    print(f"ETL Job Complete. Successfully seeded {success_count} users.")

if __name__ == "__main__":
    # Wait for generator to finish
    time.sleep(15) 
    main()
