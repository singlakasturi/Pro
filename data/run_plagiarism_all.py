"""
Trigger JPlag plagiarism check for all questions that don't have matches yet.
"""
import os
import json
import time
import urllib.request
import psycopg2
from dotenv import load_dotenv

load_dotenv()

API_BASE = os.getenv("API_BASE_URL", "http://localhost:8080")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "lc")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres123")


def main():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS,
    )
    cur = conn.cursor()

    # Get all question IDs
    cur.execute("SELECT DISTINCT question_id FROM submission ORDER BY question_id")
    all_questions = [r[0] for r in cur.fetchall()]

    # Get questions that already have matches
    cur.execute("SELECT DISTINCT question_id FROM plagiarism_match")
    done_questions = {r[0] for r in cur.fetchall()}

    conn.close()

    pending = [q for q in all_questions if q not in done_questions]
    print(f"Total questions: {len(all_questions)}")
    print(f"Already done: {len(done_questions)}")
    print(f"Pending: {len(pending)}")
    print()

    for i, qid in enumerate(pending, 1):
        print(f"[{i}/{len(pending)}] Running plagiarism check for Q{qid} ... ", end="", flush=True)
        try:
            url = f"{API_BASE}/api/v1/plagiarism/run/{qid}"
            req = urllib.request.Request(url, method="POST", data=b"")
            req.add_header("Content-Type", "application/json")
            admin_token = os.getenv("ADMIN_SECRET_KEY")
            req.add_header("X-Admin-Token", admin_token)
            resp = urllib.request.urlopen(req, timeout=300)
            body = json.loads(resp.read().decode())
            print(f"found {len(body)} matches")
        except Exception as e:
            print(f"ERROR: {e}")
        time.sleep(0.5)

    print("\nDone!")


if __name__ == "__main__":
    main()
