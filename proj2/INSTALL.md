# Development Setup

Thank you for your interest in contributing! This guide provides all the information you need to get the project running and make your first contribution.

## Project Structure

```
proj2/
├── frontend/          # React + TypeScript + Vite frontend
├── backend/           # FastAPI Python backend
├── setup.sh           # Automated setup script (recommended)
└── package.json       # Root package configuration
```

## Quick Setup (Recommended) ⚡

### Automated Installation

The fastest way to get started is using our automated setup script:

```bash
# Clone the repository
git clone <repository-url>
cd CSC510/proj2

# Run the automated setup script
./setup.sh
```

**What the script does:**
1. ✅ Verifies prerequisites (Bun, uv, Python)
2. 📦 Installs all dependencies (root, frontend, backend)
3. 🔐 Generates a secure random JWT secret key
4. 🗄️ Creates and initializes the database
5. 🌱 Seeds sample data (restaurants, allergens, admin user)

> [!IMPORTANT] .ENV SETTING
> Please remember to set your Gemini API keys in the `backend/.env` to use the AI features.

**Sample Credentials:**
- Email: `admin@example.com`
- Password: `Admin123!@#`

After setup completes, start the development servers:

```bash
bun dev
```

This will start:
- **Frontend** at `http://localhost:5173` (Vite dev server)
- **Backend** at `http://localhost:8000` (FastAPI server)

---

## Manual Setup

If you prefer to set up the project manually or need more control over the process, follow these detailed steps:

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

4. **Set up the backend Python environment and backend project in editable mode:**

   ```bash
   cd backend
   uv sync
   uv pip install -e .
   cd ..
   ```

5. **Initialize the database with sample data:**

   ```bash
   cd backend
   
   # Copy environment configuration
   cp .env.example .env
   
   # IMPORTANT: Edit .env and set a secure JWT_SECRET_KEY, and GEMINI_API_KEY
   # Replace 'your-secret-key-here-change-in-production-min-32-chars'
   # with a random string of at least 32 characters
   # You can generate one with: openssl rand -hex 32
   
   # Create database file
   uv run python scripts/db_initialize/create_init_database.py
   
   # Apply database migrations
   uv run alembic upgrade head
   
   # Seed database with sample data
   uv run python scripts/db_initialize/create_init_database.py --seed
   
   cd ..
   ```

   **What gets seeded:**
   - Admin user (email: `admin@example.com`, password: `Admin123!@#`)
   - 38 allergens (FDA Big 9 + common allergens)
   - 15 sample restaurants with 4 menu items each
   - 7 days of wellness logs for the admin user

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

### Common Issues

- **Port conflicts:** Check that ports 5173 and 8000 are available
- **Python dependency issues:** Try removing `backend/uv.lock` and running `uv sync` again
- **Frontend issues:** Try deleting `node_modules` and `bun.lock`, then run `bun install` again
- **Database errors:** Delete `backend/proj2.db` and re-run the database initialization steps
- **JWT errors:** Ensure your `.env` file has a valid `JWT_SECRET_KEY` (at least 32 characters)

### Getting Help

If you encounter issues not covered here:
1. Check existing [GitHub Issues](https://github.com/Asoingbob225/CSC510/issues)
2. Review our [Contributing Guide](CONTRIBUTING.md)
3. Open a new issue with:
   - Steps to reproduce
   - Error messages
   - Your environment (OS, Python version, Bun version)

---

## Next Steps

Once your development environment is set up:

1. **Explore the codebase:**
   - `frontend/src/` - React components and pages
   - `backend/src/eatsential/` - FastAPI application code
   - `docs/` - Project documentation

2. **Run tests:**
   ```bash
   # Frontend tests
   cd frontend && bunx vitest
   
   # Backend tests
   cd backend && uv run pytest
   ```

3. **Read the documentation:**
   - [Contributing Guide](CONTRIBUTING.md)
   - [Code of Conduct](CODE_OF_CONDUCT.md)
   - [Project Documentation](docs/)

Happy coding! 🚀
