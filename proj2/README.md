# proj2

A full-stack application with a React + TypeScript frontend and FastAPI backend.

## Project Structure

```
proj2/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # FastAPI Python backend
└── package.json       # Root package configuration
```

## Development Setup

Follow these steps to set up the project for local development:

### Prerequisites

Make sure you have the following installed on your system:

- **[Bun](https://bun.sh)** (v1.2.21 or later) - JavaScript runtime and package manager
- **[uv](https://github.com/astral-sh/uv)** - Fast Python package installer
- **Python** (>=3.9)

#### Installing Prerequisites

**Install Bun:**

```bash
curl -fsSL https://bun.sh/install | bash
```

See also https://bun.com/docs/installation

**Install uv:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

See also https://docs.astral.sh/uv/getting-started/installation/

### VS Code Extensions (Recommended)

Install the following extensions in Visual Studio Code for the best development experience:

1. **[Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)** (`esbenp.prettier-vscode`)
   - Auto-formats JavaScript/TypeScript code
   - Already configured in this project

2. **[Ruff](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)** (`charliermarsh.ruff`)
   - Fast Python linter and formatter
   - Replaces multiple tools (flake8, black, isort, etc.)

3. **[Python Envy](https://marketplace.visualstudio.com/items?itemName=teticio.python-envy)**
   - Automatically activates Python virtual environments in monorepos
   - Essential for this project structure

4. **[Tailwind editor setup](https://tailwindcss.com/docs/editor-setup)**

### Initial Setup

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd CSC510/proj2
   ```

2. **Install root dependencies:**

   ```bash
   bun install
   ```

   This installs the root dependencies including `concurrently` for running both servers simultaneously.

3. **Install frontend dependencies:**

   ```bash
   cd frontend
   bun install
   cd ..
   ```

   The frontend uses Bun as its package manager (monorepo setup).

4. **Set up the backend Python environment:**
   ```bash
   cd backend
   uv sync
   cd ..
   ```

### Running the Application

#### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
bun dev
```

This will start:

- **Frontend** at `http://localhost:5173` (Vite dev server)
- **Backend** at `http://localhost:8000` (FastAPI server)

#### Running Servers Separately

**Run frontend only:**

```bash
bun dev:frontend
```

**Run backend only:**

```bash
bun dev:backend
```

### Project Details

#### Frontend

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Package Manager:** Bun (monorepo setup)
- **Dev Server:** Hot Module Replacement (HMR) enabled
- **Location:** `frontend/`

#### Backend

- **Framework:** FastAPI
- **Python Version:** >=3.9
- **Package Manager:** uv
- **Location:** `backend/`

## Troubleshooting

- If you encounter port conflicts, check that ports 5173 and 8000 are available
- For Python dependency issues, try removing `backend/uv.lock` and running `uv sync` again
- For frontend issues, try deleting `node_modules` and `bun.lock`, then run `bun install` again

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.
