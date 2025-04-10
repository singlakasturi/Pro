from setuptools import setup, find_packages

setup(
    name="plagiarism-detector",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "astor>=0.8.1",
        "networkx>=3.1",
        "numpy>=1.24.3",
        "scikit-learn>=1.3.0",
        "python-levenshtein>=0.21.1"
    ],
    python_requires=">=3.8",
)