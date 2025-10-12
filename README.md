[![CI/CD Pipeline](https://github.com/Asoingbob225/CSC510/actions/workflows/ci.yml/badge.svg)](https://github.com/Asoingbob225/CSC510/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Asoingbob225/CSC510/branch/main/graph/badge.svg)](https://codecov.io/gh/Asoingbob225/CSC510)

# CSC510

Repo for CSC510 - Software Engineering. 

## 🚀 Hello Workflow - Get Started

New to the project? Complete the **Hello Workflow** to ensure you can run the full development workflow!

- **🎯 Quick Reference**: [docs/QUICK_REFERENCE.md](./docs/QUICK_REFERENCE.md) - Start here!
- **📋 View All Issues**: [HELLO_WORKFLOW_ISSUES.md](./HELLO_WORKFLOW_ISSUES.md)
- **📚 Visual Guide**: [docs/WORKFLOW_VISUAL_GUIDE.md](./docs/WORKFLOW_VISUAL_GUIDE.md)
- **👥 For Team Leads**: [docs/TEAM_LEAD_GUIDE.md](./docs/TEAM_LEAD_GUIDE.md)
- **⚡ Quick Create**: Run `./create-issues.sh` to create all issues automatically
- **📁 Issue Templates**: Browse [docs/issues/](./docs/issues/) for individual issue templates

### Quick Start for Team Members

1. **Choose your issue** - Team lead will assign one of 8 hello workflow issues
2. **Complete the tasks** - Follow the issue checklist
3. **Submit your PR** - Reference your issue with "Closes #X"
4. **Get it reviewed** - Ensure acceptance criteria are met

## 📂 Project Structure

- **proj1/** - RAG/Dify knowledge base project
- **proj2/** - Full-stack application (React + TypeScript + FastAPI)
- **docs/** - Documentation and workflow guides



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
## Code Coverage

We use Codecov to track test coverage. View the coverage report at: https://codecov.io/gh/Asoingbob225/CSC510

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on running tests and coverage locally.
