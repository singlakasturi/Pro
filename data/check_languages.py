import os
import psycopg2
from dotenv import load_dotenv

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

        # Get all matches for Q3970
        cur.execute("""
            SELECT id, submission_id1, submission_id2, similarity 
            FROM plagiarism_match 
            WHERE question_id = 3970
        """)
        
        rows = cur.fetchall()
        cross_lang_matches = []
        for r in rows:
            sub1, sub2 = r[1], r[2]
            cur.execute("SELECT language FROM submission WHERE submission_id = %s", (sub1,))
            l1 = cur.fetchone()[0]
            cur.execute("SELECT language FROM submission WHERE submission_id = %s", (sub2,))
            l2 = cur.fetchone()[0]
            
            # Normalize dialects (e.g., python and python3, cpp and c++)
            def norm(lang):
                lang = lang.lower().strip() if lang else ""
                if lang in ("python", "python3"): return "python"
                if lang in ("cpp", "c++"): return "cpp"
                return lang

            if norm(l1) != norm(l2):
                cross_lang_matches.append({
                    "id": r[0],
                    "lang1": l1,
                    "lang2": l2,
                    "similarity": r[3]
                })

        print(f"Total matches: {len(rows)}")
        print(f"Total cross-language matches: {len(cross_lang_matches)}")
        for m in sorted(cross_lang_matches, key=lambda x: x['similarity'], reverse=True)[:15]:
            print(f"Match ID: {m['id']} | Lang1: {m['lang1']} | Lang2: {m['lang2']} | Similarity: {m['similarity']:.2f}%")

        conn.close()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    main()
