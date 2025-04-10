from detectors.ast_detector import ASTDetector

# Test with simple known code
detector = ASTDetector()
code1 = "def add(a,b): return a+b"
code2 = "def sum(x,y): return x+y"

similarity = detector.compare(code1, code2)
print(f"Test similarity: {similarity:.1f}%")  # Should show ~95%