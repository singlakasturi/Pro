from utils.code_normalizer import normalize_code
from Levenshtein import ratio

class ASTDetector:
    def compare(self, code1, code2):
        """Compare two code samples using AST normalization"""
        norm1 = normalize_code(code1)
        norm2 = normalize_code(code2)
        return ratio(norm1, norm2) * 100  # Convert to percentage