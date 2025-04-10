import os
import requests
from dotenv import load_dotenv

load_dotenv()

class LeetCodeAPI:
    def __init__(self):
        self.session = requests.Session()
        self.session.cookies['LEETCODE_SESSION'] = os.getenv('LEETCODE_SESSION')
        self.session.headers['X-CSRFToken'] = os.getenv('CSRF_TOKEN')
        self.session.headers['Referer'] = 'https://leetcode.com'
        
    def get_user_submissions(self, username, limit=20):
        """Fetch recent submissions with code content"""
        query = """
        query recentAcSubmissions($username: String!, $limit: Int!) {
            recentAcSubmissionList(username: $username, limit: $limit) {
                id
                title
                titleSlug
                timestamp
                lang
            }
        }
        """
        response = self.session.post(
            'https://leetcode.com/graphql',
            json={'query': query, 'variables': {'username': username, 'limit': limit}}
        )
        submission_ids = [sub['id'] for sub in response.json()['data']['recentAcSubmissionList']]
        
        # Fetch code for each submission
        submissions = []
        for sub_id in submission_ids:
            code = self.get_submission_code(sub_id)
            submissions.append(code)
        return submissions

    def get_submission_code(self, submission_id):
        """Fetch actual code for a submission"""
        query = """
        query submissionDetails($submissionId: Int!) {
            submissionDetails(submissionId: $submissionId) {
                code
            }
        }
        """
        response = self.session.post(
            'https://leetcode.com/graphql',
            json={'query': query, 'variables': {'submissionId': int(submission_id)}}
        )
        return response.json()['data']['submissionDetails']['code']