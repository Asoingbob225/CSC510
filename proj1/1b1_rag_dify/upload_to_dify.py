import os
import requests
from dotenv import load_dotenv
import time
import json

# Load environment variables from .env file
load_dotenv()

# Configuration from environment variables
DIFY_API_KEY = os.getenv("DIFY_API_KEY")
DIFY_BASE_URL = os.getenv("DIFY_BASE_URL", "https://localhost")
DATASET_ID = os.getenv("DATASET_ID")

MAX_CHARACTER_TOKEN_LIMIT = 1500  # Maximum characters per segment
EMBEDDING_MODEL = "nomic-embed-text"
EMBEDDING_MODEL_PROVIDER = "ollama"


if not DIFY_API_KEY:
    raise ValueError("DIFY_API_KEY not found in environment variables!")
if not DATASET_ID:
    raise ValueError("DATASET_ID not found in environment variables!")

headers = {"Authorization": f"Bearer {DIFY_API_KEY}"}

# Directories containing files to upload
md_dir = "assets/mds"
pdf_dir = "assets/pdfs"


def check_document_status(batch_id):
    """Check document processing status using batch ID"""
    url = (
        f"{DIFY_BASE_URL}/v1/datasets/{DATASET_ID}/documents/{batch_id}/indexing-status"
    )

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to check status for batch {batch_id}: {e}")
        return None


def monitor_processing_progress(batch_id, file_name):
    """Monitor document processing progress in real-time"""
    print(f"Monitoring processing progress for {file_name}...")

    while True:
        status_data = check_document_status(batch_id)
        if not status_data:
            break

        documents = status_data.get("data", [])
        if not documents:
            break

        doc = documents[0]  # Assuming single document
        status = doc.get("indexing_status", "unknown")
        completed_segments = doc.get("completed_segments", 0)
        total_segments = doc.get("total_segments", 0)

        if status == "completed":
            print(
                f"✅ {file_name} processing completed! ({completed_segments}/{total_segments} segments)"
            )
            break
        elif status == "error":
            error_msg = doc.get("error", "Unknown error")
            print(f"❌ {file_name} processing failed: {error_msg}")
            break
        elif status in ["indexing", "parsing", "cleaning", "splitting"]:
            progress = (
                f"({completed_segments}/{total_segments} segments)"
                if total_segments > 0
                else ""
            )
            print(f"🔄 {file_name} status: {status} {progress}")
        else:
            print(f"⏳ {file_name} status: {status}")

        time.sleep(5)  # Check every 5 seconds


def upload_file_to_dify(file_path, file_name):
    """Upload a single file to Dify knowledge base"""
    url = f"{DIFY_BASE_URL}/v1/datasets/{DATASET_ID}/document/create-by-file"

    # Configuration for document processing
    data_config = {
        "indexing_technique": "high_quality",
        "doc_form": "text_model",
        "process_rule": {
            "mode": "custom",
            "rules": {
                "pre_processing_rules": [
                    {"id": "remove_extra_spaces", "enabled": True},
                    {"id": "remove_urls_emails", "enabled": True},
                ],
                "segmentation": {
                    "separator": "\n\n",
                    "max_tokens": MAX_CHARACTER_TOKEN_LIMIT,
                },
            },
        },
        "retrieval_model": {
            "search_method": "semantic_search",
            "reranking_enable": False,
            "top_k": 5,
            "score_threshold_enabled": False,
        },
        "embedding_model": EMBEDDING_MODEL,
        "embedding_model_provider": EMBEDDING_MODEL_PROVIDER,
    }

    try:
        with open(file_path, "rb") as file:
            files = {
                "file": file,
            }
            payload = {"data": json.dumps(data_config)}

            print(f"Uploading: {file_name}")
            response = requests.post(
                url, headers=headers, files=files, data=payload, timeout=120
            )
            response.raise_for_status()

            result = response.json()
            document_id = result.get("document", {}).get("id", "unknown")
            batch_id = result.get("batch", "")

            print(f"Successfully uploaded: {file_name} (Document ID: {document_id})")

            # Monitor processing progress if batch_id is available
            if batch_id:
                monitor_processing_progress(batch_id, file_name)
            else:
                print(
                    f"⚠️  No batch ID returned for {file_name}, skipping progress monitoring"
                )

            return document_id

    except Exception as e:
        print(f"Failed to upload {file_name}: {e}")
        return None


def upload_files_from_directory(directory, file_extension):
    """Upload all files with specified extension from directory"""
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist!")
        return

    files = [f for f in os.listdir(directory) if f.endswith(file_extension)]
    print(f"Found {len(files)} {file_extension} files in {directory}")

    successful_uploads = 0
    for file_name in files:
        file_path = os.path.join(directory, file_name)
        document_id = upload_file_to_dify(file_path, file_name)
        if document_id:
            successful_uploads += 1

        # Add a delay between uploads
        time.sleep(3)

    print(
        f"Successfully uploaded {successful_uploads}/{len(files)} {file_extension} files"
    )


if __name__ == "__main__":
    print("Starting file upload to Dify knowledge base...")
    print(f"Dataset ID: {DATASET_ID}")

    # Upload markdown files
    print("\n--- Uploading Markdown files ---")
    upload_files_from_directory(md_dir, ".md")

    # Upload PDF files
    print("\n--- Uploading PDF files ---")
    upload_files_from_directory(pdf_dir, ".pdf")

    print("\nUpload process completed!")
