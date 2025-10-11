# CSC510

[![CI/CD Pipeline](https://github.com/Asoingbob225/CSC510/actions/workflows/ci.yml/badge.svg)](https://github.com/Asoingbob225/CSC510/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Asoingbob225/CSC510/branch/main/graph/badge.svg)](https://codecov.io/gh/Asoingbob225/CSC510)

Repo for CSC510 - Software Engineering. I was told by instructor to make public, non-NCSU, repo

## Getting Started

### Prerequisites

- **Python** (>=3.9) for backend projects
- **[Bun](https://bun.sh)** (v1.2.21 or later) for proj2 frontend/backend orchestration
- **[uv](https://github.com/astral-sh/uv)** - Fast Python package installer

#### Installing Prerequisites

**Install Bun:**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Install uv:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Installation

**Clone the repository:**

```bash
git clone https://github.com/Asoingbob225/CSC510.git
cd CSC510
```

**For proj2 (Full-stack application):**

```bash
cd proj2
# Install root dependencies
bun install
# Install frontend dependencies
cd frontend && bun install && cd ..
# Set up backend Python environment
cd backend && uv sync && cd ..
```

**For proj1/1b1_rag_dify:**

```bash
cd proj1/1b1_rag_dify
uv sync
```

### Running Tests

**proj2 - Frontend:**

```bash
cd proj2/frontend
bun run lint
bun run build
```

**proj2 - Backend:**

```bash
cd proj2/backend
uv run ruff check .
```

**proj1/1b1_rag_dify:**

```bash
cd proj1/1b1_rag_dify
uv run ruff check .
```

### Running the Applications

**proj2 - Full-stack application:**

Run both frontend and backend simultaneously:

```bash
cd proj2
bun dev
```

This starts:
- **Frontend** at `http://localhost:5173`
- **Backend** at `http://localhost:8000`

**proj1/1b1_rag_dify:**

See [proj1/1b1_rag_dify/README.md](proj1/1b1_rag_dify/README.md) for detailed setup instructions.
