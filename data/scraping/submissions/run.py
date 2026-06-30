import concurrent.futures
import csv
import json
import logging
import os
import re
import ssl
import sys
import urllib.request
from random import randint
from threading import Event, Thread
from time import sleep
from typing import List, Tuple

import boto3
from api_client import Client
from api_client.api.contest_controller import add_contest
from api_client.api.question_controller import add_question
from api_client.api.submission_controller import add_submissions
from api_client.models.contest import Contest
from api_client.models.question import Question
from api_client.models.question_dto import QuestionDTO
from api_client.models.submission import Submission
from api_client.models.submission_dto import SubmissionDTO
from api_client.types import Response
from dotenv import load_dotenv
from random_user_agent.params import OperatingSystem, SoftwareName
from random_user_agent.user_agent import UserAgent

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scraping/submissions")
logger.setLevel(os.getenv("LOG_LEVEL") or logging.INFO)


CONTEST_BASE_URL = "https://leetcode.com/contest"
CONTEST_API_URL = "https://leetcode.com/contest/api/ranking"
SUBMISSIONS_API_URL = "https://leetcode.com/api/submissions"
HEADERS = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
    "referer": "https://leetcode.com/contest",
}


def load_cookies_from_storage():
    paths = [
        os.getenv("LEETCODE_STORAGE_STATE"),
        "storage/leetcode-state.json",
        "../scraper-worker/storage/leetcode-state.json"
    ]
    for storage_path in paths:
        if storage_path and os.path.exists(storage_path):
            try:
                with open(storage_path, "r") as f:
                    data = json.load(f)
                    cookies = data.get("cookies", [])
                    cookie_strings = []
                    csrf_token = None
                    for cookie in cookies:
                        name = cookie.get("name")
                        value = cookie.get("value")
                        domain = cookie.get("domain", "")
                        if name and value and "leetcode.com" in domain:
                            cookie_strings.append(f"{name}={value}")
                            if name == "csrftoken":
                                csrf_token = value
                    
                    cookie_header = "; ".join(cookie_strings)
                    return cookie_header, csrf_token
            except Exception as e:
                logger.error(f"Failed to load cookies from storage state {storage_path}: {e}")
    return None, None


# Add session cookies if available
cookie_header, csrf_token = load_cookies_from_storage()
if cookie_header:
    HEADERS["cookie"] = cookie_header
    if csrf_token:
        HEADERS["x-csrf-token"] = csrf_token
else:
    leetcode_session = os.getenv("LEETCODE_SESSION")
    leetcode_csrf = os.getenv("LEETCODE_CSRF_TOKEN")
    cookies = []
    if leetcode_session:
        cookies.append(f"LEETCODE_SESSION={leetcode_session}")
    if leetcode_csrf:
        cookies.append(f"csrftoken={leetcode_csrf}")
        HEADERS["x-csrf-token"] = leetcode_csrf

    if cookies:
        HEADERS["cookie"] = "; ".join(cookies)

PAGE_LIMIT = int(os.getenv("PAGE_LIMIT") or 100)
NUM_WORKERS = 10
MAX_RETRIES = 50
REQUEST_TIMEOUT_SEC = 15

OXYLABS_CREDENTIALS = os.getenv("OXYLABS_CREDENTIALS")
USER_AGENT_ROTATOR = UserAgent(
    software_names=[SoftwareName.CHROME.value, SoftwareName.FIREFOX.value],
    operating_systems=[OperatingSystem.WINDOWS.value, OperatingSystem.MACOS.value],
    limit=200,
)

API_CLIENT = None
if os.getenv("API_BASE_URL"):
    admin_token = os.getenv("ADMIN_SECRET_KEY")
    headers = {}
    if admin_token:
        headers["X-Admin-Token"] = admin_token
    API_CLIENT = Client(
        base_url=str(os.getenv("API_BASE_URL")),
        headers=headers
    )


import threading
import time

_playwright_lock = threading.Lock()
_playwright_failed = False
_playwright_page = None
_playwright_context = None
_playwright_browser = None
_playwright_started = None


def init_playwright():
    global _playwright_page, _playwright_context, _playwright_browser, _playwright_started
    if _playwright_page is not None:
        return
    
    from playwright.sync_api import sync_playwright
    _playwright_started = sync_playwright().start()
    
    storage_path = os.getenv("LEETCODE_STORAGE_STATE") or "storage/leetcode-state.json"
    if not os.path.exists(storage_path) and os.path.exists("../scraper-worker/storage/leetcode-state.json"):
        storage_path = "../scraper-worker/storage/leetcode-state.json"
        
    launch_options = {"headless": False}
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    context_options = {
        "user_agent": user_agent
    }
    if os.path.exists(storage_path):
        context_options["storage_state"] = storage_path
        
    _playwright_browser = _playwright_started.chromium.launch(**launch_options)
    _playwright_context = _playwright_browser.new_context(**context_options)
    _playwright_page = _playwright_context.new_page()


def close_playwright():
    global _playwright_page, _playwright_context, _playwright_browser, _playwright_started
    try:
        if _playwright_browser:
            _playwright_browser.close()
        if _playwright_started:
            _playwright_started.stop()
    except Exception:
        pass
    _playwright_browser = None
    _playwright_context = None
    _playwright_page = None
    _playwright_started = None


def wait_for_cloudflare(page):
    for _ in range(12):
        try:
            title = page.title()
            body = page.locator("body").inner_text(timeout=2000)
        except Exception:
            title = ""
            body = ""
        challenged = "Just a moment" in title or "Just a moment" in body or "Enable JavaScript and cookies" in body
        if not challenged:
            return
        time.sleep(5)


def get(url: str, headers_override=None) -> dict:
    global _playwright_failed
    headers_override = headers_override or {}
    
    if not _playwright_failed:
        try:
            with _playwright_lock:
                init_playwright()
                
                # Make sure we are on the leetcode domain
                base_url = "https://leetcode.com"
                if _playwright_page.url == "about:blank" or "leetcode.com" not in _playwright_page.url:
                    _playwright_page.goto(base_url)
                    wait_for_cloudflare(_playwright_page)
                
                # Evaluate fetch in page context
                fetch_js = """
                async (targetUrl) => {
                    const response = await fetch(targetUrl);
                    if (!response.ok) {
                        throw new Error('HTTP status ' + response.status);
                    }
                    return await response.json();
                }
                """
                result = _playwright_page.evaluate(fetch_js, url)
                return result
        except Exception as e:
            logger.warning(f"Playwright fetch failed for {url}: {e}")
            if "HTTP status" not in str(e):
                _playwright_failed = True
            raise e
            
    # Fallback to urllib
    headers = HEADERS.copy()
    for k in headers_override:
        headers[k] = headers_override[k]
    delay = 1
    for i in range(MAX_RETRIES):
        try:
            headers["user-agent"] = USER_AGENT_ROTATOR.get_random_user_agent()
            if not OXYLABS_CREDENTIALS:
                request = urllib.request.Request(url, headers=headers)
                response = urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SEC)
                return json.loads(response.read().decode())
            else:
                proxy_url = f"http://customer-{OXYLABS_CREDENTIALS}@pr.oxylabs.io:7777"
                proxy = urllib.request.ProxyHandler(
                    {
                        "http": proxy_url,
                        "https": proxy_url,
                    }
                )
                opener = urllib.request.build_opener(proxy)
                request = urllib.request.Request(url, headers=headers)
                response = opener.open(request, timeout=REQUEST_TIMEOUT_SEC)
                return json.loads(response.read().decode())
        except Exception as e:
            logger.error(f"Failed to fetch {url} (try {i}): {e}")
            sleep(randint(1, delay))
            delay = min(delay * 2, 30)  # exponential backoff
    logger.error(f"Something went wrong, could not fetch {url} for {MAX_RETRIES} times")
    raise Exception(f"Failed to fetch {url} after {MAX_RETRIES} retries")


def get_slug(title: str) -> str:
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug.strip('-')


def fetch_frontend_id(title_slug: str):
    context = ssl._create_unverified_context()
    url = "https://leetcode.com/graphql"
    query = """
    query questionTitle($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
      }
    }
    """
    payload = {
        "query": query,
        "variables": {"titleSlug": title_slug}
    }
    headers = {
        "user-agent": USER_AGENT_ROTATOR.get_random_user_agent(),
        "content-type": "application/json",
        "accept": "application/json",
        "referer": f"https://leetcode.com/problems/{title_slug}/"
    }
    opener = None
    if OXYLABS_CREDENTIALS:
        proxy_url = f"http://customer-{OXYLABS_CREDENTIALS}@pr.oxylabs.io:7777"
        proxy = urllib.request.ProxyHandler(
            {
                "http": proxy_url,
                "https": proxy_url,
            }
        )
        opener = urllib.request.build_opener(proxy)
        
    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method="POST")
        if opener:
            response = opener.open(req, timeout=REQUEST_TIMEOUT_SEC)
        else:
            response = urllib.request.urlopen(req, context=context, timeout=REQUEST_TIMEOUT_SEC)
        with response:
            data = json.loads(response.read().decode())
            q = data.get("data", {}).get("question")
            if q:
                return q.get("questionFrontendId")
    except Exception as e:
        logger.error(f"Failed to fetch frontend ID for {title_slug}: {e}")
    return None


def get_questions(contest_slug: str) -> Tuple[List[QuestionDTO], dict]:
    response = get(
        f"{CONTEST_API_URL}/{contest_slug}/?pagination=1&region=global",
        {"Referer": f"{CONTEST_BASE_URL}/{contest_slug}/ranking/1/"},
    )
    questions = []
    mapping = {}
    for i, question in enumerate(response["questions"]):
        title = question["title"]
        slug = get_slug(title)
        actual_num_str = fetch_frontend_id(slug)
        if not actual_num_str:
            sleep(0.5)
            actual_num_str = fetch_frontend_id(slug)
        
        internal_id = int(question["question_id"])
        actual_num = int(actual_num_str) if actual_num_str else internal_id
        mapping[internal_id] = actual_num
        
        questions.append(
            QuestionDTO(
                id=actual_num,
                name=title,
                number_in_contest=i + 1,
                contest_slug=contest_slug,
                number=actual_num,
                description="",
            )
        )
    return questions, mapping


def get_submissions(contest_slug: str, page: int) -> dict:
    return get(
        f"{CONTEST_API_URL}/{contest_slug}/?pagination={page}&region=global",
        {"Referer": f"{CONTEST_BASE_URL}/{contest_slug}/ranking/{page}/"},
    )


def get_submission_with_code(submission_id: str, contest_slug: str, page: int) -> dict:
    return get(
        f"https://leetcode.com/api/submissions/{submission_id}",
        {"Referer": f"{CONTEST_BASE_URL}/{contest_slug}/ranking/{page}/"},
    )


def save_api(contest: Contest, questions: List[QuestionDTO], submissions: List[SubmissionDTO]):
    assert API_CLIENT, "API_CLIENT should be set"
    logger.info("Creating contest")
    add_contest.sync_detailed(client=API_CLIENT, contest=contest)
    logger.info("Creating questions")
    for question in questions:
        add_question.sync_detailed(client=API_CLIENT, body=question)
    logger.info("Creating submissions")
    add_submissions.sync_detailed(client=API_CLIENT, body=submissions)

    logger.info("Running plagiarism checks for each question")
    api_base = os.getenv("API_BASE_URL") or "http://localhost:8080"
    for question in questions:
        qid = question.id
        logger.info(f"Triggering plagiarism check for Q{qid} ...")
        try:
            url = f"{api_base}/api/v1/plagiarism/run/{qid}"
            req = urllib.request.Request(url, method="POST", data=b"")
            req.add_header("Content-Type", "application/json")
            admin_token = os.getenv("ADMIN_SECRET_KEY")
            if admin_token:
                req.add_header("X-Admin-Token", admin_token)
            resp = urllib.request.urlopen(req, timeout=300)
            body = json.loads(resp.read().decode())
            logger.info(f"Successfully ran plagiarism check for Q{qid}: found {len(body)} matches")
        except Exception as e:
            logger.error(f"Failed to run plagiarism check for Q{qid}: {e}")


def save_local(submissions: List[SubmissionDTO]):
    logger.info("Saving result locally")
    with open("submissions.csv", "w") as file:
        submission = submissions[0]
        header = submission.to_dict().keys()
        csv.writer(file).writerow(header)
        csv.writer(file).writerows([submission.to_dict().values() for submission in submissions])


def get_all_submissions(contest_slug: str, lookup_questions: List[QuestionDTO], mapping: dict) -> Tuple[Contest, List[SubmissionDTO]]:
    logger.info(f"Fetching submissions for contest {contest_slug}")
    lookup_actual_ids = [question.id for question in lookup_questions]
    lookup_internal_ids = [int_id for int_id, act_id in mapping.items() if act_id in lookup_actual_ids]
    contest = None
    submissions: List[SubmissionDTO] = []
    i = 1
    while True:
        response = get_submissions(contest_slug, i)
        if i > PAGE_LIMIT or not response["submissions"]:  # pages are over
            break
        logger.info(f"Processing page {i}")
        page_submissions = []
        count = 0
        for user_submissions, user in zip(response["submissions"], response["total_rank"]):
            for question_id in user_submissions:
                if int(question_id) not in lookup_internal_ids:
                    continue
                count += 1
                if user_submissions[question_id]["data_region"] == "CN":
                    continue
                if not contest:
                    contest = Contest(id=user["contest_id"], slug=contest_slug)
                    contest["participantCount"] = response.get("user_num", 0)
                user_submissions[question_id]["userSlug"] = user["user_slug"]
                user_submissions[question_id]["page"] = i
                user_submissions[question_id]["questionId"] = mapping[int(question_id)]
                page_submissions.append(user_submissions[question_id])
        # 0 submissions for the problems we are interested in (in practice, Q3 and Q4 -- hence, we can stop here)
        if count == 0:
            logger.info("No more submissions for the questions we are interested in, stopping")
            break
        for submission in page_submissions:
            try:
                time.sleep(0.5)
                code = get_submission_with_code(submission["submission_id"], contest_slug, i)
                if code:
                    submission["language"] = code["lang"]
                    submission["code"] = code["code"]
                    submission["page"] = i
                    submissions.append(SubmissionDTO.from_dict(submission))
            except Exception as e:
                logger.error(f"Failed to fetch submission {submission['submission_id']}: {e}")
        logger.info(f"Fetched {len(page_submissions)} submissions from page {i}")
        i += 1
    assert contest
    return (contest, submissions)


def save_async(contest, questions, submissions):
    try:
        save_api(contest, questions, submissions)
    except Exception as e:
        logger.error(f"Failed to save contest data asynchronously: {e}")

global_save_threads = []

def process_contest(contest_slug: str) -> List[str]:
    logger.info(f"Processing contest {contest_slug}")
    questions, mapping = get_questions(contest_slug)
    contest, submissions = get_all_submissions(contest_slug, questions, mapping)
    if API_CLIENT:
        logger.info(f"Saving {len(submissions)} submissions asynchronously for {contest_slug}")
        import threading
        thread = threading.Thread(
            target=save_async,
            args=(contest, questions, submissions),
            daemon=False
        )
        thread.start()
        global_save_threads.append(thread)
    else:
        logger.info(f"Saving {len(submissions)} submissions locally")
        save_local(submissions)
    return [question.name for question in questions]


def setup_heartbeat():
    stopped = Event()

    def loop():
        while not stopped.wait(60):
            client = boto3.client("stepfunctions")
            client.send_task_heartbeat(
                taskToken=os.environ["TASK_TOKEN"],
            )

    Thread(target=loop, daemon=True).start()
    return stopped.set


def handler(event, context):
    contest_slug = os.environ["CONTEST_SLUG"]
    if os.environ.get("TASK_TOKEN"):
        setup_heartbeat()

    if ".." in contest_slug:
        import re
        parts = contest_slug.split("..")
        start_slug = parts[0].strip()
        end_slug = parts[1].strip()

        start_match = re.search(r'(.*?)-(\d+)$', start_slug)
        end_match = re.search(r'(.*?)-(\d+)$', end_slug)

        if start_match and end_match and start_match.group(1) == end_match.group(1):
            base_slug = start_match.group(1)
            start_num = int(start_match.group(2))
            end_num = int(end_match.group(2))

            for num in range(start_num, end_num + 1):
                slug = f"{base_slug}-{num}"
                try:
                    logger.info(f"Processing contest in range: {slug}")
                    process_contest(slug)
                except Exception as e:
                    logger.error(f"Failed to process contest {slug}: {e}")
        else:
            logger.error(f"Invalid contest range format: {contest_slug}")
    else:
        process_contest(contest_slug)

    if global_save_threads:
        logger.info(f"Waiting for {len(global_save_threads)} background saving threads to finish...")
        for thread in global_save_threads:
            thread.join()
        logger.info("All background saving threads finished.")

    if os.environ.get("TASK_TOKEN"):
        result = {
            "contest-slug": contest_slug,
        }
        client = boto3.client("stepfunctions")
        client.send_task_success(
            taskToken=os.environ["TASK_TOKEN"],
            output=json.dumps(result),
        )


if __name__ == "__main__":
    try:
        handler({}, None)
    finally:
        close_playwright()

