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
    
    def get_user_submissions(self, username):
        query = """
        query recentSubmissions($username: String!) {
            recentSubmissionList(username: $username) {
                title
                titleSlug
                timestamp
                statusDisplay
                lang
                code
            }
        }
        """
        response = self.session.post(
            'https://leetcode.com/graphql',
            json={'query': query, 'variables': {'username': username}}
        )
        return response.json()['data']['recentSubmissionList']