from datetime import datetime
from leetcode_api import LeetCodeAPI  # From the file above

class ProgrammerProfile:
    def __init__(self, username):
        self.username = username
        self.submissions = []  # Stores {code, problem, timestamp}
    
    def load_leetcode_data(self, limit=10):
        """Fetch and store user's recent submissions"""
        api = LeetCodeAPI()
        submissions = api.get_user_submissions(self.username, limit)
        
        for code in submissions:
            self.add_submission(
                code=code,
                problem_id=self.extract_problem_id(code),
                timestamp=datetime.now()
            )
    
    def extract_problem_id(self, code):
        """Extract problem identifier from code (simplified)"""
        return hash(code)  # Replace with actual problem detection