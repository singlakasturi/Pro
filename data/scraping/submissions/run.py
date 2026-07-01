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
SCRAPEDO_TOKEN = os.getenv("SCRAPEDO_TOKEN")
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
_playwright_storage_path = None


def init_playwright():
    global _playwright_page, _playwright_context, _playwright_browser, _playwright_started, _playwright_storage_path
    if _playwright_page is not None:
        return
    
    from playwright.sync_api import sync_playwright
    _playwright_started = sync_playwright().start()
    
    _playwright_storage_path = os.getenv("LEETCODE_STORAGE_STATE") or "storage/leetcode-state.json"
    if not os.path.exists(_playwright_storage_path) and os.path.exists("../scraper-worker/storage/leetcode-state.json"):
        _playwright_storage_path = "../scraper-worker/storage/leetcode-state.json"
        
    headless = os.getenv("HEADLESS", "true").lower() == "true"
    launch_options = {"headless": headless}
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    context_options = {
        "user_agent": user_agent
    }
    if os.path.exists(_playwright_storage_path):
        context_options["storage_state"] = _playwright_storage_path
        
    _playwright_browser = _playwright_started.chromium.launch(**launch_options)
    _playwright_context = _playwright_browser.new_context(**context_options)
    _playwright_page = _playwright_context.new_page()


def close_playwright():
    global _playwright_page, _playwright_context, _playwright_browser, _playwright_started, _playwright_storage_path
    try:
        if _playwright_context and _playwright_storage_path:
            os.makedirs(os.path.dirname(_playwright_storage_path), exist_ok=True)
            _playwright_context.storage_state(path=_playwright_storage_path)
            logger.info(f"Saved updated LeetCode session storage state to {_playwright_storage_path}")
    except Exception as e:
        logger.error(f"Failed to save LeetCode storage state: {e}")

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
    
    is_main = (threading.current_thread() == threading.main_thread())
    use_playwright = is_main and not _playwright_failed and not OXYLABS_CREDENTIALS and not SCRAPEDO_TOKEN
    if use_playwright:
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
    if SCRAPEDO_TOKEN:
        import base64
        auth = base64.b64encode(f"{SCRAPEDO_TOKEN}:".encode()).decode()
        headers["Proxy-Authorization"] = f"Basic {auth}"
    delay = 1
    for i in range(MAX_RETRIES):
        try:
            headers["user-agent"] = USER_AGENT_ROTATOR.get_random_user_agent()
            if not OXYLABS_CREDENTIALS and not SCRAPEDO_TOKEN:
                request = urllib.request.Request(url, headers=headers)
                response = urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SEC)
                return json.loads(response.read().decode())
            elif OXYLABS_CREDENTIALS:
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
            else:
                proxy_url = f"http://{SCRAPEDO_TOKEN}:@proxy.scrape.do:8080"
                proxy = urllib.request.ProxyHandler(
                    {
                        "http": proxy_url,
                        "https": proxy_url,
                    }
                )
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                https_handler = urllib.request.HTTPSHandler(context=ctx)
                opener = urllib.request.build_opener(proxy, https_handler)
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
    if SCRAPEDO_TOKEN:
        import base64
        auth = base64.b64encode(f"{SCRAPEDO_TOKEN}:".encode()).decode()
        headers["Proxy-Authorization"] = f"Basic {auth}"
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
    elif SCRAPEDO_TOKEN:
        proxy_url = f"http://{SCRAPEDO_TOKEN}:@proxy.scrape.do:8080"
        proxy = urllib.request.ProxyHandler(
            {
                "http": proxy_url,
                "https": proxy_url,
            }
        )
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        https_handler = urllib.request.HTTPSHandler(context=ctx)
        opener = urllib.request.build_opener(proxy, https_handler)
        
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


csv_write_lock = threading.Lock()

def append_local_csv(submissions: List[SubmissionDTO]):
    if not submissions:
        return
    file_exists = os.path.exists("submissions.csv")
    with open("submissions.csv", "a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        if not file_exists:
            header = submissions[0].to_dict().keys()
            writer.writerow(header)
        for submission in submissions:
            writer.writerow(submission.to_dict().values())


def sync_local_submissions_to_db():
    if not API_CLIENT:
        return
    if not os.path.exists("submissions.csv"):
        return
    logger.info("Found local submissions.csv. Syncing to DB...")
    try:
        submissions = []
        with open("submissions.csv", "r", newline="", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                try:
                    sub_dict = {
                        "id": int(row["id"]),
                        "code": row["code"],
                        "language": row["language"],
                        "date": int(row["date"]),
                        "userSlug": row["userSlug"],
                        "page": int(row["page"]),
                        "questionId": int(row["questionId"])
                    }
                    submissions.append(SubmissionDTO.from_dict(sub_dict))
                except Exception as e:
                    logger.error(f"Error parsing row in submissions.csv: {e}")
        
        if submissions:
            logger.info(f"Syncing {len(submissions)} submissions to DB...")
            resp = add_submissions.sync_detailed(client=API_CLIENT, body=submissions)
            if resp.status_code == 200:
                logger.info("Successfully synced local submissions to DB. Deleting local submissions.csv.")
                os.remove("submissions.csv")
            else:
                logger.warning(f"Failed to sync submissions to DB, response code: {resp.status_code}")
    except Exception as e:
        logger.error(f"Failed to sync local submissions to DB: {e}")


def run_plag_async(save_threads, questions):
    logger.info("Plagiarism thread: Waiting for all page-saving threads to complete...")
    for t in save_threads:
        t.join()
    logger.info("Plagiarism thread: All submissions are saved to the database. Running plagiarism checks...")
    
    if API_CLIENT:
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



def query_existing_submissions(question_id: int) -> List[int]:
    if not API_CLIENT:
        return []
    url = f"{API_CLIENT._base_url}/contests/dummy/questions/{question_id}"
    logger.info(f"Querying existing submissions from: {url}")
    try:
        req = urllib.request.Request(url, method="GET")
        if hasattr(API_CLIENT, "_headers") and API_CLIENT._headers and "X-Admin-Token" in API_CLIENT._headers:
            req.add_header("X-Admin-Token", API_CLIENT._headers["X-Admin-Token"])
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                subs = json.loads(resp.read().decode())
                ids = []
                for sub in subs:
                    val = sub.get("submissionId") or sub.get("id")
                    if val is not None:
                        ids.append(int(val))
                return ids
    except Exception as e:
        logger.error(f"Failed to query existing submissions for Q{question_id} from {url}: {e}")
    return []


def get_all_submissions(contest_slug: str, lookup_questions: List[QuestionDTO], mapping: dict) -> Tuple[Contest, List[SubmissionDTO], List[threading.Thread]]:
    logger.info(f"Fetching submissions for contest {contest_slug}")
    
    # Query existing submissions in the DB to avoid double fetching
    existing_ids = set()
    if API_CLIENT:
        for q in lookup_questions:
            try:
                ids = query_existing_submissions(q.id)
                existing_ids.update(ids)
            except Exception as e:
                logger.error(f"Failed to query existing submissions for Q{q.id}: {e}")
    logger.info(f"Found {len(existing_ids)} existing submissions in DB.")

    # Remove existing submissions.csv if we are not using the DB to start fresh
    if not API_CLIENT and os.path.exists("submissions.csv"):
        try:
            os.remove("submissions.csv")
            logger.info("Removed existing local submissions.csv")
        except Exception as e:
            logger.warning(f"Could not remove local submissions.csv: {e}")

    lookup_actual_ids = [question.id for question in lookup_questions]
    lookup_internal_ids = [int_id for int_id, act_id in mapping.items() if act_id in lookup_actual_ids]
    contest = None
    submissions: List[SubmissionDTO] = []
    submissions_lock = threading.Lock()
    save_threads = []
    i = 1
    
    while True:
        response = get_submissions(contest_slug, i)
        if i > PAGE_LIMIT or not response["submissions"]:  # pages are over
            break
        logger.info(f"Processing page {i}")
        
        # Initialize contest/questions on first page rank retrieval
        if not contest and response.get("total_rank"):
            first_user = response["total_rank"][0]
            contest = Contest(id=first_user["contest_id"], slug=contest_slug)
            contest["participantCount"] = response.get("user_num", 0)
            
            if API_CLIENT:
                logger.info("Creating contest in DB...")
                try:
                    add_contest.sync_detailed(client=API_CLIENT, contest=contest)
                    logger.info("Creating questions in DB...")
                    for question in lookup_questions:
                        add_question.sync_detailed(client=API_CLIENT, body=question)
                except Exception as e:
                    logger.error(f"Failed to initialize contest/questions in DB: {e}")

        page_submissions = []
        count = 0
        for user_submissions, user in zip(response["submissions"], response["total_rank"]):
            for question_id in user_submissions:
                if int(question_id) not in lookup_internal_ids:
                    continue
                count += 1
                if user_submissions[question_id]["data_region"] == "CN":
                    continue
                
                # Check for duplicate using the contest-specific submission ID ('id')
                sub_id = user_submissions[question_id].get("id")
                if sub_id and int(sub_id) in existing_ids:
                    continue
                
                user_submissions[question_id]["userSlug"] = user["user_slug"]
                user_submissions[question_id]["page"] = i
                user_submissions[question_id]["questionId"] = mapping[int(question_id)]
                if "id" not in user_submissions[question_id] and "submission_id" in user_submissions[question_id]:
                    user_submissions[question_id]["id"] = user_submissions[question_id]["submission_id"]
                page_submissions.append(user_submissions[question_id])
                
        # 0 submissions for the problems we are interested in (in practice, Q3 and Q4 -- hence, we can stop here)
        if count == 0:
            logger.info("No more submissions for the questions we are interested in, stopping")
            break
            
        if not page_submissions:
            logger.info(f"All submissions on page {i} already scraped. Skipping.")
            i += 1
            continue

        # Concurrent fetching using ThreadPoolExecutor
        page_dtos = []
        
        def fetch_one(submission):
            try:
                if not OXYLABS_CREDENTIALS and not SCRAPEDO_TOKEN:
                    time.sleep(0.5)  # respect rate limits if no proxies are active
                code = get_submission_with_code(submission["submission_id"], contest_slug, i)
                if code:
                    submission["language"] = code["lang"]
                    submission["code"] = code["code"]
                    return SubmissionDTO.from_dict(submission)
            except Exception as e:
                logger.error(f"Failed to fetch submission {submission['submission_id']}: {e}")
            return None

        # Fetch codes concurrently
        max_workers = int(os.getenv("CONCURRENT_WORKERS") or (15 if OXYLABS_CREDENTIALS else (5 if SCRAPEDO_TOKEN else 3)))
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(fetch_one, sub) for sub in page_submissions]
            for future in concurrent.futures.as_completed(futures):
                dto = future.result()
                if dto:
                    page_dtos.append(dto)

        # Thread to save this page's submissions
        if page_dtos:
            with submissions_lock:
                submissions.extend(page_dtos)
                
            def save_job(dtos_to_save, page_num):
                saved_to_db = False
                if API_CLIENT:
                    logger.info(f"[Thread] Saving {len(dtos_to_save)} submissions from page {page_num} to DB...")
                    try:
                        resp = add_submissions.sync_detailed(client=API_CLIENT, body=dtos_to_save)
                        if resp.status_code == 200:
                            logger.info(f"[Thread] Successfully saved page {page_num} submissions to DB.")
                            saved_to_db = True
                        else:
                            logger.warning(f"[Thread] Failed to save page {page_num} submissions to DB (status {resp.status_code}). Falling back to local CSV.")
                    except Exception as e:
                        logger.error(f"[Thread] Failed to save page {page_num} submissions to DB: {e}. Falling back to local CSV.")
                
                if not saved_to_db:
                    logger.info(f"[Thread] Saving {len(dtos_to_save)} submissions from page {page_num} locally...")
                    with csv_write_lock:
                        append_local_csv(dtos_to_save)

            save_thread = threading.Thread(target=save_job, args=(page_dtos.copy(), i), daemon=False)
            save_thread.start()
            save_threads.append(save_thread)

        logger.info(f"Fetched and queued saving for {len(page_dtos)} submissions from page {i}")
        i += 1
        
    return (contest, submissions, save_threads)


global_save_threads = []

def process_contest(contest_slug: str) -> List[str]:
    logger.info(f"Processing contest {contest_slug}")
    questions, mapping = get_questions(contest_slug)
    contest, submissions, save_threads = get_all_submissions(contest_slug, questions, mapping)
    
    if API_CLIENT:
        logger.info(f"Spawning plagiarism thread for {contest_slug}")
        plag_thread = threading.Thread(
            target=run_plag_async,
            args=(save_threads, questions),
            daemon=False
        )
        plag_thread.start()
        global_save_threads.append(plag_thread)
    else:
        for t in save_threads:
            t.join()
        logger.info(f"Successfully processed contest {contest_slug} locally.")
        
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

    if API_CLIENT:
        sync_local_submissions_to_db()

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

