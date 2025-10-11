# Install and Verify proj2 Backend Dependencies

**Labels:** `good first issue`, `hello-workflow`, `backend`, `setup`

## Description
Install all required Python dependencies for the FastAPI backend application.

## Tasks
- [ ] Navigate to `CSC510/proj2/backend` directory
- [ ] Run `uv sync` to install Python dependencies
- [ ] Verify `.venv` or virtual environment is created
- [ ] Check that `fastapi` is installed correctly
- [ ] Verify no errors occurred during installation

## Acceptance Criteria
- ✅ Python dependencies are installed successfully without errors
- ✅ Virtual environment is created in the backend directory
- ✅ Screenshot of successful `uv sync` output
- ✅ Can import fastapi in Python environment

## Commands to Run
```bash
cd CSC510/proj2/backend
uv sync

# Verify
ls -la .venv/
uv run python -c "import fastapi; print(fastapi.__version__)"
```

## Troubleshooting
If you encounter issues:
- Make sure uv is installed (see Issue #1)
- Try removing `uv.lock` and running `uv sync` again
- Verify Python 3.9+ is installed
- Check that you're in the correct directory

Closes #[ISSUE_NUMBER]
