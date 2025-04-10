from detectors.ast_detector import ASTDetector

class PlagiarismDetector:
    def __init__(self):
        self.detector = ASTDetector()
    
    def compare_two_files(self, file1_path, file2_path):
        """Compare two code files directly"""
        with open(file1_path) as f1, open(file2_path) as f2:
            code1, code2 = f1.read(), f2.read()
        return self.detector.compare(code1, code2)
    
    def compare_two_snippets(self, code1, code2):
        """Compare two code strings directly"""
        return self.detector.compare(code1, code2)

if __name__ == "__main__":
    detector = PlagiarismDetector()
    
    # Example 1: Compare code strings
    # code1 = "def add(a,b): return a+b"
    code1 = "public class Solution { public int longestPalindrome(String s, String t) { int maxLen = 0, m = s.length(), n = t.length(); for (int i = 0; i < m; i++) for (int j = i; j < m; j++) { String sSub = s.substring(i, j + 1); for (int k = 0; k < n; k++) for (int l = k; l < n; l++) { String tSub = t.substring(k, l + 1); String combined = sSub + tSub; if (isPalindrome(combined)) maxLen = Math.max(maxLen, combined.length()); } } for (int i = 0; i < m; i++) for (int j = i; j < m; j++) { String sSub = s.substring(i, j + 1); if (isPalindrome(sSub)) maxLen = Math.max(maxLen, sSub.length()); } for (int i = 0; i < n; i++) for (int j = i; j < n; j++) { String tSub = t.substring(i, j + 1); if (isPalindrome(tSub)) maxLen = Math.max(maxLen, tSub.length()); } return maxLen == 0 ? 1 : maxLen; } private boolean isPalindrome(String str) { int left = 0, right = str.length() - 1; while (left < right) if (str.charAt(left++) != str.charAt(right--)) return false; return true; } }"
    code2 = "public class Solution { public int longestPalindrome(String s, String t) { int maxLen = 0, m = s.length(), n = t.length(); for (int i = 0; i < m; i++) for (int j = i; j < m; j++) { String sSub = s.substring(i, j + 1); for (int k = 0; k < n; k++) for (int l = k; l < n; l++) { String tSub = t.substring(k, l + 1), combined = sSub + tSub; if (isPalindrome(combined)) maxLen = Math.max(maxLen, combined.length()); } } for (int i = 0; i < m; i++) for (int j = i; j < m; j++) { String sSub = s.substring(i, j + 1); if (isPalindrome(sSub)) maxLen = Math.max(maxLen, sSub.length()); } for (int i = 0; i < n; i++) for (int j = i; j < n; j++) { String tSub = t.substring(i, j + 1); if (isPalindrome(tSub)) maxLen = Math.max(maxLen, tSub.length()); } return maxLen == 0 ? 1 : maxLen; } private boolean isPalindrome(String str) { int left = 0, right = str.length() - 1; while (left < right) if (str.charAt(left++) != str.charAt(right--)) return false; return true; } }"
    # code2 = "def sum(x,y): return x+y"
    print(f"Similarity: {detector.compare_two_snippets(code1, code2):.1f}%")
    
    # Example 2: Compare files (create test1.py and test2.py first)
    # print(f"File similarity: {detector.compare_two_files('test1.py', 'test2.py'):.1f}%")