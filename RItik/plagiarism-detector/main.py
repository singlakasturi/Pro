from detectors.ast_detector import ASTDetector

class LeetCodePlagiarismChecker(PlagiarismDetector):
    def compare_contest_profiles(self, profile1, profile2, contest_id=None):
        """
        Compare two users' submissions in a contest
        :param contest_id: If None, compares all common problems
        :return: Dictionary of {problem_id: similarity_score}
        """
        results = {}
        
        # Get all common problems between users
        problems1 = {sub['problem_id'] for sub in profile1.submissions}
        problems2 = {sub['problem_id'] for sub in profile2.submissions}
        common_problems = problems1 & problems2
        
        if contest_id:
            common_problems = [p for p in common_problems if p.startswith(contest_id)]
        
        for problem_id in common_problems:
            # Get all submissions for this problem from each user
            subs1 = [s for s in profile1.submissions if s['problem_id'] == problem_id]
            subs2 = [s for s in profile2.submissions if s['problem_id'] == problem_id]
            
            # Compare all submission pairs
            max_sim = 0
            for sub1 in subs1:
                for sub2 in subs2:
                    sim = self.detector.compare(sub1['code'], sub2['code'])
                    if sim > max_sim:
                        max_sim = sim
            
            results[problem_id] = max_sim
        
        return results
class ProgrammerProfile:
    def __init__(self, username):
        self.username = username
        self.submissions = []  # Stores (code, problem_id, timestamp) tuples
    
    def add_submission(self, code, problem_id, timestamp=None):
        """Add a LeetCode submission to the profile"""
        from datetime import datetime
        timestamp = timestamp or datetime.now()
        self.submissions.append({
            'code': code,
            'problem_id': problem_id,
            'timestamp': timestamp
        })