import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
JINA_API_KEY = os.getenv("JINA_API_KEY")

if not JINA_API_KEY:
    raise ValueError("JINA_API_KEY not found in environment variables!")

headers = {"Authorization": f"Bearer {JINA_API_KEY}"}

normal_links_path = "assets/normal_links.txt"
md_dir = "assets/mds"
os.makedirs(md_dir, exist_ok=True)

with open(normal_links_path, "r", encoding="utf-8") as f:
    links = [line.strip() for line in f if line.strip() and line.startswith("http")]

for url in links:
    try:
        print(f"Fetching: {url}")
        api_url = f"https://r.jina.ai/{url}"
        response = requests.get(api_url, headers=headers, timeout=60)
        response.raise_for_status()
        # Use the domain and last path as filename
        domain = url.split("/")[2].replace(".", "_")
        last_path = url.rstrip("/").split("/")[-1][:40]
        if not last_path:
            last_path = "index"
        filename = f"{domain}_{last_path}.md"
        save_path = os.path.join(md_dir, filename)
        with open(save_path, "w", encoding="utf-8") as md_file:
            md_file.write(response.text)
        print(f"Saved to: {save_path}")
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
