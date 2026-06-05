import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://127.0.0.1:8000/posts/"

def publish_new_blog(title, content):
    payload = {
        "title": title,
        "content": content
    }
    
    admin_token = os.getenv("ADMIN_TOKEN", "default_admin_secret_token_123!")
    headers = {
        "X-Admin-Token": admin_token
    }
    
    try:
        print(f"Publishing blog: '{title}'...")
        # This formally triggers the FastApi endpoint, ensuring the automatic emails are blasted to subscribers!
        response = requests.post(API_URL, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("Successfully published! All subscribers have been emailed automatically.")
        else:
            print(f"Failed to publish. Server responded with: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection error: {e}")
        print("Please ensure your local FastApi server is running (uvicorn main:app --reload)")

if __name__ == "__main__":
    new_title = "The Global Commodities Surge: What To Expect"
    new_content = """
    <strong>Commodities are soaring.</strong><br><br>
    While the S&P 500 flatlines, physical commodities like gold, silver, and crude are marking record expansions. Does this signify an underlying inflationary baseline?<br><br>
    With the recent global ceasefire remaining volatile, resource hoarding continues to be the dominant macro strategy for large institutional investors.<br><br>
    <em>Stay hedged and properly diversified!</em>
    """
    
    publish_new_blog(new_title, new_content.strip())
