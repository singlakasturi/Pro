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
        
        cur.execute("SELECT contest_id, title FROM contest")
        contests = cur.fetchall()
        print(f"Total Contests in DB: {len(contests)}")
        for c in contests:
            print(f"- ID: {c[0]}, Title: {c[1]}")
            
        cur.execute("SELECT question_id, contest_contest_id, question_number, title FROM question ORDER BY contest_contest_id, question_number")
        questions = cur.fetchall()
        print(f"\nTotal Questions in DB: {len(questions)}")
        for q in questions:
            print(f"- ID: {q[0]}, Contest: {q[1]}, Num: {q[2]}, Title: {q[3]}")
            
        cur.close()
        conn.close()
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    main()
