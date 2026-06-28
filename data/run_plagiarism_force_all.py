import os
import sys
import psycopg2
import urllib.request
import json
import time
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "lc")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres123")
API_BASE = os.getenv("API_BASE_URL", "http://localhost:8080")

TIMEOUT = 900  # 15 minutes per question
MAX_RETRIES = 2

def main():
    skip_existing = "--skip-existing" in sys.argv

    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS,
    )
    cur = conn.cursor()

    # Get all questions with at least 2 submissions from the DB
    cur.execute("""
        SELECT question_id 
        FROM submission 
        GROUP BY question_id 
        HAVING count(*) >= 2
    """)
    target_qids = sorted([r[0] for r in cur.fetchall()])

    # Get questions that already have plagiarism matches
    already_done = set()
    if skip_existing:
        cur.execute("""
            SELECT DISTINCT question_id 
            FROM plagiarism_match
        """)
        already_done = set(r[0] for r in cur.fetchall())

    conn.close()

    print(f"Total eligible QIDs: {len(target_qids)}")
    if skip_existing:
        print(f"Already done (skipping): {len(already_done)}")
    print()

    failed = []
    succeeded = 0
    skipped = 0

    for i, qid in enumerate(target_qids, 1):
        if skip_existing and qid in already_done:
            print(f"[{i}/{len(target_qids)}] Q{qid} ... skipped (already has matches)")
            skipped += 1
            continue

        success = False
        for attempt in range(1, MAX_RETRIES + 1):
            label = f"[{i}/{len(target_qids)}] Q{qid}"
            if attempt > 1:
                label += f" (retry {attempt}/{MAX_RETRIES})"
            print(f"{label} ... ", end="", flush=True)
            try:
                url = f"{API_BASE}/api/v1/plagiarism/run/{qid}"
                req = urllib.request.Request(url, method="POST", data=b"")
                req.add_header("Content-Type", "application/json")
                admin_token = os.getenv("ADMIN_SECRET_KEY")
                req.add_header("X-Admin-Token", admin_token)
                resp = urllib.request.urlopen(req, timeout=TIMEOUT)
                body = json.loads(resp.read().decode())
                print(f"success! Found {len(body)} matches.")
                success = True
                succeeded += 1
                break
            except Exception as e:
                print(f"ERROR: {e}")
                if attempt < MAX_RETRIES:
                    time.sleep(2)
        if not success:
            failed.append(qid)
        time.sleep(0.5)

    print(f"\nForce plagiarism run complete!")
    print(f"Succeeded: {succeeded} | Skipped: {skipped} | Failed: {len(failed)}")
    if failed:
        print(f"Failed QIDs ({len(failed)}): {failed}")

if __name__ == "__main__":
    main()
