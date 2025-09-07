# 1b1-rag

## Prerequisites

Please install Dify first. Refer to the official documentation: [Dify Installation Guide](https://docs.dify.ai/en/getting-started/install-self-hosted/readme)

## Build your knowledge base in Dify

### Quick Start

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd 1b1_rag
```

2. **Install and use uv (recommended)**

```bash
pip install uv  # if not installed
uv venv         # create virtual environment
uv sync         # install all dependencies from pyproject.toml/uv.lock
```

Or use standard venv/pip with pyproject.toml if you prefer.

3. **Environment configuration**

Create a Dify knowledge base using the Dify GUI.

Edit a `.env` file:

```
DIFY_API_KEY=your-dify-api-key
DIFY_BASE_URL=http://localhost  # or your Dify server address
DATASET_ID=your-dify-dataset-id
```

4. **Configure Embedding Model Provider**

This project uses [Ollama](https://ollama.com/) as the default embedding model provider for Dify. If you want to use Ollama, please follow the steps below.

**Alternatively, you can configure your own text embedding API in Dify (such as OpenAI, Azure, or any compatible provider). If you have already set up another embedding model provider in Dify, you can skip the Ollama steps.**

**Ollama Setup Steps:**

1. **Install Ollama**

   - Download and install Ollama from: https://ollama.com/download
   - Start the Ollama service on your machine.

2. **Download the embedding model**

   - For example, to use `nomic-embed-text`:
     ```bash
     ollama pull nomic-embed-text
     ```

3. **Configure Ollama in Dify**

   - Go to Dify Admin Panel → Model Management → Embedding Models.
   - Add a new embedding model provider, select "Ollama" and fill in the required details (host, port, model name, etc).
   - Test the connection to ensure Dify can access your local Ollama service.

4. **Run batch upload**

You can edit the knowledge base setting in the top of `upload_to_dify.py`

```bash
uv run main.py
```

This will upload all `.md` files in `assets/mds` and all `.pdf` files in `assets/pdfs` to your Dify knowledge base.

## Step 5: Import DSL

Import the provided `.dsl` file in Dify to quickly set up recommended prompts and workflows for this knowledge base.

---

## Notes

- Make sure your Dify server is running and accessible.
- Check your dataset permissions and API key validity.
- For more details, see the code comments.
