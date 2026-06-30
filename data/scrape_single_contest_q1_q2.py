import os
import sys
import argparse
import time
import logging
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
logger = logging.getLogger("migration/scrape_single")

def main():
    parser = argparse.ArgumentParser(description="Scrape Q1 and Q2 for a single contest.")
    parser.add_argument("contest_slug", help="The slug of the contest to scrape (e.g., weekly-contest-508)")
    args = parser.parse_args()

    contest_slug = args.contest_slug
    logger.info(f"Starting single scrape for contest: {contest_slug}")

    if not os.getenv("PAGE_LIMIT"):
        os.environ["PAGE_LIMIT"] = "40"  # Match user's requested PAGE_LIMIT

    logger.info(f"Using PAGE_LIMIT = {os.getenv('PAGE_LIMIT')}")

    try:
        logger.info(f"Fetching questions list for {contest_slug}...")
        questions, mapping = get_questions(contest_slug)
        q1_q2 = questions[:2]
        
        if len(q1_q2) < 2:
            logger.error(f"Contest {contest_slug} has fewer than 2 questions.")
            return

        logger.info(f"Scraping Q1 ({q1_q2[0].name}) and Q2 ({q1_q2[1].name}) submissions...")
        contest_obj, submissions = get_all_submissions(contest_slug, q1_q2, mapping)
        
        logger.info(f"Fetched {len(submissions)} submissions. Saving to DB...")
        save_api(contest_obj, q1_q2, submissions)
        logger.info(f"Successfully scraped and saved Q1 and Q2 for {contest_slug}!")
    except Exception as e:
        logger.error(f"Failed to process contest {contest_slug}: {e}")
    finally:
        logger.info("Closing Playwright browser...")
        close_playwright()

if __name__ == "__main__":
    main()
