import os
import urllib.request
import urllib.error
import json

from dotenv import load_dotenv

load_dotenv()

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8080")
qid = 3970

def main():
    print(f"Triggering plagiarism check for Q{qid} ... ", end="", flush=True)
    try:
        url = f"{API_BASE}/api/v1/plagiarism/run/{qid}"
        req = urllib.request.Request(url, method="POST", data=b"")
        req.add_header("Content-Type", "application/json")
        admin_token = os.getenv("ADMIN_SECRET_KEY")
        req.add_header("X-Admin-Token", admin_token)
        resp = urllib.request.urlopen(req, timeout=900)
        body = json.loads(resp.read().decode())
        print(f"Success! Found {len(body)} matches.")
    except urllib.error.HTTPError as e:
        print(f"HTTP ERROR: {e.code} - {e.reason}")
        try:
            print(f"Response body: {e.read().decode()}")
        except Exception:
            pass
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    main()
