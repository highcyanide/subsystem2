import os
import sys

print("Python version:", sys.version)
try:
    import pptx
    print("python-pptx available!")
except ImportError:
    print("python-pptx not available")

try:
    import pypdf
    print("pypdf available!")
except ImportError:
    pass

try:
    import pdfplumber
    print("pdfplumber available!")
except ImportError:
    pass
