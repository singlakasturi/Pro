import os
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def calculate_contest_date(slug):
    try:
        if slug.startswith("weekly-contest-"):
            number = int(slug.replace("weekly-contest-", ""))
            # Weekly Contest 507 was on Sunday, June 21, 2026
            base_date = datetime(2026, 6, 21, 8, 0, 0)
            return base_date - timedelta(weeks=507 - number)
        elif slug.startswith("biweekly-contest-"):
            number = int(slug.replace("biweekly-contest-", ""))
            # Biweekly Contest 141 was on Saturday, October 12, 2024
            base_date = datetime(2024, 10, 12, 20, 0, 0)
            return base_date - timedelta(weeks=(141 - number) * 2)
    except Exception as e:
        print(f"Error parsing slug {slug}: {e}")
    return None

def main():
    try:
        host = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "5432")
        dbname = os.getenv("DB_NAME", "lc")
        user = os.getenv("DB_USER", "postgres")
        password = os.getenv("DB_PASS", "postgres123")
        conn = psycopg2.connect(f"dbname={dbname} user={user} password={password} host={host} port={port}")
        cur = conn.cursor()
        
        # Get all contests
        cur.execute("SELECT contest_id, start_date FROM contest")
        contests = cur.fetchall()
        print("Existing contests in database:")
        for contest_id, start_date in contests:
            print(f"Slug: {contest_id}, Current Date: {start_date}")
            
            correct_date = calculate_contest_date(contest_id)
            if correct_date:
                cur.execute(
                    "UPDATE contest SET start_date = %s WHERE contest_id = %s",
                    (correct_date, contest_id)
                )
                print(f" -> Updated to: {correct_date}")
        
        conn.commit()
        cur.close()
        conn.close()
        print("All contest dates successfully updated!")
    except Exception as e:
        print("ERROR running migration:", e)

if __name__ == "__main__":
    main()
