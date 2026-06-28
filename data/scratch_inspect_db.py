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

        print("--- PLAGIARISM MATCH COUNT FOR 4104 ---")
        cur.execute("SELECT count(*) FROM plagiarism_match WHERE question_id = 4104")
        print("Count for 4104:", cur.fetchone()[0])

        print("--- PLAGIARISM MATCH COUNT FOR 4274 ---")
        cur.execute("SELECT count(*) FROM plagiarism_match WHERE question_id = 4274")
        print("Count for 4274:", cur.fetchone()[0])

        print("\n--- SAMPLE MATCHES FOR 4104 ---")
        cur.execute("SELECT id, contest_id, question_id, similarity, submission_id1, submission_id2, username1, username2, language FROM plagiarism_match WHERE question_id = 4104 LIMIT 5")
        for r in cur.fetchall():
            print(r)

        print("\n--- SAMPLE MATCHES FOR 4274 ---")
        cur.execute("SELECT id, contest_id, question_id, similarity, submission_id1, submission_id2, username1, username2, language FROM plagiarism_match WHERE question_id = 4274 LIMIT 5")
        for r in cur.fetchall():
            print(r)

        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    main()
