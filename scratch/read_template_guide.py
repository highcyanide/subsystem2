import pdfplumber

with pdfplumber.open("docs/template-guide.pdf") as pdf:
    print(f"Total pages in template-guide.pdf: {len(pdf.pages)}")
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        print(f"\n==================== SLIDE {i+1} ====================")
        if text:
            lines = [line.strip() for line in text.split("\n") if line.strip()]
            print("\n".join(lines[:15]))  # print up to first 15 lines per slide
        else:
            print("[EMPTY OR IMAGE ONLY]")
