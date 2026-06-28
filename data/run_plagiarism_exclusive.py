import os
import urllib.request
import json
import time
from dotenv import load_dotenv

load_dotenv()

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8080")

def main():
    target_qids = [4263, 4274]
    print(f"Running plagiarism check exclusively for QIDs: {target_qids}")
    print()

    for i, qid in enumerate(target_qids, 1):
        print(f"[{i}/{len(target_qids)}] Triggering plagiarism check for Q{qid} ... ", end="", flush=True)
        try:
            url = f"{API_BASE}/api/v1/plagiarism/run/{qid}"
            req = urllib.request.Request(url, method="POST", data=b"")
            req.add_header("Content-Type", "application/json")
            admin_token = os.getenv("ADMIN_SECRET_KEY")
            req.add_header("X-Admin-Token", admin_token)
            resp = urllib.request.urlopen(req, timeout=300)
            body = json.loads(resp.read().decode())
            print(f"success! Found {len(body)} matches.")
        except Exception as e:
            print(f"ERROR: {e}")
        time.sleep(0.5)

    print("\nExclusive plagiarism run complete!")

if __name__ == "__main__":
    main()
