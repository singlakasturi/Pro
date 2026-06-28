import os
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv()

def main():
    qid = 4274
    api_base = os.getenv("API_BASE_URL", "http://localhost:8080")
    url = f"{api_base}/api/v1/plagiarism/run/{qid}"
    req = urllib.request.Request(url, method="POST", data=b"")
    req.add_header("Content-Type", "application/json")
    admin_token = os.getenv("ADMIN_SECRET_KEY")
    req.add_header("X-Admin-Token", admin_token)
    try:
        print(f"Triggering plagiarism check for Q{qid} ...")
        resp = urllib.request.urlopen(req, timeout=300)
        body = json.loads(resp.read().decode())
        print(f"Success! Found {len(body)} matches.")
        if len(body) > 0:
            print("First 3 matches:")
            for m in body[:3]:
                print(m)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    main()
