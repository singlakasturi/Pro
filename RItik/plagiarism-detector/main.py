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
    code1 = "int mian() {return 1+2}"
    code2 = "int main() {return 2+3}"
    # code2 = "def sum(x,y): return x+y"
    print(f"Similarity: {detector.compare_two_snippets(code1, code2):.1f}%")
    
    # Example 2: Compare files (create test1.py and test2.py first)
    print(f"File similarity: {detector.compare_two_files('test1.py', 'test2.py'):.1f}%")