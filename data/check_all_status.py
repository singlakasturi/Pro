import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "lc")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres123")

def main():
    try:
        conn = psycopg2.connect(
            host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
            user=DB_USER, password=DB_PASS,
        )
        cur = conn.cursor()

        # Get all contests and questions
        cur.execute("""
            SELECT q.contest_contest_id, q.question_id, q.question_number, q.title, 
                   (SELECT COUNT(*) FROM submission s WHERE s.question_id = q.question_id) as sub_count,
                   (SELECT COUNT(*) FROM plagiarism_match pm WHERE pm.question_id = q.question_id) as match_count
            FROM question q
            ORDER BY q.contest_contest_id, q.question_id
        """)
        rows = cur.fetchall()
        print(f"{'Contest':<20} | {'QID':<6} | {'Num':<3} | {'Submissions':<12} | {'Matches':<8} | {'Title'}")
        print("-" * 100)
        
        missing_count = 0
        total_count = 0
        for r in rows:
            contest, qid, num, title, subs, matches = r
            print(f"{contest[:20]:<20} | {qid:<6} | {num:<3} | {subs:<12} | {matches:<8} | {title[:40]}")
            total_count += 1
            if subs >= 2 and matches == 0:
                missing_count += 1
                
        print("-" * 100)
        print(f"Total questions: {total_count}")
        print(f"Questions with submissions but 0 matches: {missing_count}")

        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    main()
