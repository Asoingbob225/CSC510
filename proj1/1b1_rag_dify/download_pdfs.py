import os
import requests

# Directory to save PDFs
download_dir = "assets/pdfs"
os.makedirs(download_dir, exist_ok=True)

pdf_links_path = "assets/pdf_links.txt"

with open(pdf_links_path, "r", encoding="utf-8") as f:
    links = [line.strip() for line in f if line.strip()]

for url in links:
    filename = url.split("/")[-1].split("?")[0]
    save_path = os.path.join(download_dir, filename)
    try:
        print(f"Downloading: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        with open(save_path, "wb") as pdf_file:
            pdf_file.write(response.content)
        print(f"Saved to: {save_path}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")
