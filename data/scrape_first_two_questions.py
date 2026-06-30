import os
import sys
import time
import logging
import psycopg2
from dotenv import load_dotenv

# Ensure we are in the data directory and can import relative modules
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from scraping.submissions.run import (
    get_questions,
    get_all_submissions,
    save_api,
    close_playwright,
    API_CLIENT
)

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migration/scrape_q1_q2")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "lc")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres123")

def get_existing_contests():
    """Retrieve all contest slugs from the database."""
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS
    )
    cur = conn.cursor()
    cur.execute("SELECT contest_id FROM contest ORDER BY contest_id DESC")
    contests = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return contests

def check_questions_scraped(contest_slug):
    """Check if Q1 and Q2 are already populated for this contest."""
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS
    )
    cur = conn.cursor()
    cur.execute(
        "SELECT COUNT(*) FROM question WHERE contest_contest_id = %s AND question_number IN (1, 2)",
        (contest_slug,)
    )
    count = cur.fetchone()[0]
    cur.close()
    conn.close()
    return count >= 2

def main():
    # Set default page limit to 10 to be polite to LeetCode and run relatively fast.
    # Can be overridden by setting PAGE_LIMIT environment variable.
    if not os.getenv("PAGE_LIMIT"):
        os.environ["PAGE_LIMIT"] = "10"
        logger.info("PAGE_LIMIT not set in env. Defaulting to 10 pages of rankings to avoid rate limiting.")
    else:
        logger.info(f"Using PAGE_LIMIT = {os.getenv('PAGE_LIMIT')} from env.")

    contests = get_existing_contests()
    logger.info(f"Found {len(contests)} contests in the database to process.")

    processed_count = 0
    skipped_count = 0

    try:
        for idx, contest_slug in enumerate(contests, 1):
            logger.info(f"\n--- [{idx}/{len(contests)}] Processing contest: {contest_slug} ---")
            
            if check_questions_scraped(contest_slug):
                logger.info(f"Q1 and Q2 already exist in DB for {contest_slug}. Skipping.")
                skipped_count += 1
                continue

            logger.info(f"Fetching questions list for {contest_slug}...")
            try:
                questions, mapping = get_questions(contest_slug)
                # Keep only first two questions (Q1 and Q2)
                q1_q2 = questions[:2]
                
                if len(q1_q2) < 2:
                    logger.warning(f"Contest {contest_slug} has fewer than 2 questions. Skipping.")
                    skipped_count += 1
                    continue

                logger.info(f"Scraping Q1 ({q1_q2[0].name}) and Q2 ({q1_q2[1].name}) submissions...")
                contest_obj, submissions = get_all_submissions(contest_slug, q1_q2, mapping)
                
                logger.info(f"Fetched {len(submissions)} submissions. Saving to DB...")
                save_api(contest_obj, q1_q2, submissions)
                
                processed_count += 1
                logger.info(f"Successfully processed {contest_slug}.")
                
                # Small delay between contests
                time.sleep(2)
            except Exception as e:
                logger.error(f"Failed to process contest {contest_slug}: {e}")
                logger.info("Sleeping for 10 seconds before next attempt to allow cooldown...")
                time.sleep(10)
    finally:
        logger.info("Closing Playwright browser...")
        close_playwright()

    logger.info(f"\nMigration complete! Processed: {processed_count}, Skipped: {skipped_count}, Total: {len(contests)}")

if __name__ == "__main__":
    main()
