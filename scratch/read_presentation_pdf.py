import pdfplumber

with pdfplumber.open("docs/Final Presentation for IT Project 5 (1).pdf") as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i, page in enumerate(pdf.pages):
        print(f"--- PAGE {i+1} ---")
        text = page.extract_text()
        print(text if text else "[EMPTY PAGE]")
