import csv


# Input and output file paths
data_path = "assets/Requirements Supplementary Information - Links.xlsx - Sheet1.csv"
normal_links_path = "assets/normal_links.txt"
pdf_links_path = "assets/pdf_links.txt"

normal_links = []
pdf_links = []

with open(data_path, newline="", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        link = row.get("Link", "").strip()
        if not link:
            continue
        if link.lower().endswith(".pdf"):
            pdf_links.append(link)
        else:
            normal_links.append(link)

with open(normal_links_path, "w", encoding="utf-8") as f:
    for link in normal_links:
        f.write(link + "\n")

with open(pdf_links_path, "w", encoding="utf-8") as f:
    for link in pdf_links:
        f.write(link + "\n")

print(f"Normal web links: {len(normal_links)}, PDF web links: {len(pdf_links)}")
