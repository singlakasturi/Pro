import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

def main():
    try:
        host = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "5432")
        dbname = os.getenv("DB_NAME", "lc")
        user = os.getenv("DB_USER", "postgres")
        password = os.getenv("DB_PASS", "postgres123")
        conn = psycopg2.connect(f"dbname={dbname} user={user} password={password} host={host} port={port}")
        cur = conn.cursor()
        
        # Check contests
        cur.execute("SELECT contest_id, title FROM contest WHERE contest_id = 'weekly-contest-420'")
        contest = cur.fetchall()
        print("Contests:", contest)
        
        # Check questions
        cur.execute("SELECT question_id, title, question_number FROM question WHERE question_id IN (3326, 3327)")
        questions = cur.fetchall()
        print("Questions in DB:", questions)
        
        # Check submissions count
        cur.execute("SELECT question_id, COUNT(*) FROM submission WHERE question_id IN (3326, 3327) GROUP BY question_id")
        submissions = cur.fetchall()
        print("Submissions count:", submissions)
        
        # Check plagiarism matches count
        cur.execute("SELECT question_id, COUNT(*) FROM plagiarism_match WHERE question_id IN (3326, 3327) GROUP BY question_id")
        matches = cur.fetchall()
        print("Plagiarism matches:", matches)
        
        cur.close()
        conn.close()
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    main()
