import ast
import astor

def normalize_code(code):
    """Normalize code by removing variable/function names"""
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            # Rename all variables to 'var'
            if isinstance(node, ast.Name) and not isinstance(node.ctx, ast.Load):
                node.id = 'var'
            # Rename all functions to 'func'
            elif isinstance(node, ast.FunctionDef):
                node.name = 'func'
        return astor.to_source(tree)
    except Exception:
        return code  # Return original if parsing fails