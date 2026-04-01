import PyPDF2

pdf_path = r"c:\Users\lithi\OneDrive\Desktop\FarmtrustA\Group 18_Capstone Project Proposal Final.pdf"

with open(pdf_path, 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    print(text)