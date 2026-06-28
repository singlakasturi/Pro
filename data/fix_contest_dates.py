"""
One-shot script: fetch real contest start times from LeetCode and update the DB.
"""

import os
import json
import sys
import time
import urllib.request
from datetime import datetime, timezone
from random import randint
from dotenv import load_dotenv

from typing import Optional

import psycopg2

load_dotenv()

# ── DB config ────────────────────────────────────────────────────────────────
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "lc")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres123")

# ── LeetCode API ─────────────────────────────────────────────────────────────
CONTEST_INFO_URL = "https://leetcode.com/contest/api/info/{slug}/"
HEADERS = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "content-type": "application/json",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "referer": "https://leetcode.com/contest",
}

MAX_RETRIES = 5
REQUEST_TIMEOUT_SEC = 15


def fetch_contest_start_time(slug: str) -> Optional[int]:
    """Return the Unix-epoch start_time for a contest slug, or None on failure."""
    url = CONTEST_INFO_URL.format(slug=slug)
    delay = 1
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            resp = urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_SEC)
            data = json.loads(resp.read().decode())
            contest_obj = data.get("contest", data)  # API nests under "contest"
            start = contest_obj.get("start_time") or contest_obj.get("startTime")
            if start:
                return int(start)
            print(f"  [!] No start_time key in response for {slug}: {list(contest_obj.keys())}")
            return None
        except Exception as e:
            print(f"  [X] Attempt {attempt+1}/{MAX_RETRIES} failed for {slug}: {e}")
            time.sleep(randint(1, delay))
            delay = min(delay * 2, 10)
    return None


def main():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS,
    )
    cur = conn.cursor()

    # Get all contest slugs
    cur.execute("SELECT contest_id FROM contest ORDER BY contest_id")
    slugs = [row[0] for row in cur.fetchall()]
    print(f"Found {len(slugs)} contests in DB.\n")

    updated = 0
    failed = []

    for i, slug in enumerate(slugs, 1):
        print(f"[{i}/{len(slugs)}] {slug} … ", end="", flush=True)
        epoch = fetch_contest_start_time(slug)
        if epoch is None:
            print("SKIPPED")
            failed.append(slug)
            continue

        dt = datetime.fromtimestamp(epoch, tz=timezone.utc)
        cur.execute(
            "UPDATE contest SET start_date = %s WHERE contest_id = %s",
            (dt, slug),
        )
        print(f"-> {dt.strftime('%Y-%m-%d %H:%M UTC')}")
        updated += 1

        # Be polite to LeetCode
        time.sleep(1)

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nDone. Updated {updated}/{len(slugs)} contests.")
    if failed:
        print(f"Failed: {failed}")


if __name__ == "__main__":
    main()
