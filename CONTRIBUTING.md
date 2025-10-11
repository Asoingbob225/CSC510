# Contributing to CSC510

Thank you for your interest in contributing to this project! This guide will help you get started.

## Code Style and Quality

We use automated tools to maintain code quality and consistent style across the project.

### Python Code Style

For Python projects (in `proj1/1b1_rag_dify` and `proj2/backend`), we use:

- **[Black](https://black.readthedocs.io/)** - The uncompromising Python code formatter
- **[Flake8](https://flake8.pycqa.org/)** - Python linting tool for style guide enforcement

#### Running the Linters Locally

Before submitting a pull request, make sure your code passes all linting checks:

1. **Install dependencies** (if you haven't already):
   ```bash
   cd proj2/backend  # or proj1/1b1_rag_dify
   uv sync --dev
   ```

2. **Format your code with Black**:
   ```bash
   uv run black .
   ```

3. **Check your code with Flake8**:
   ```bash
   uv run flake8 .
   ```

4. **Verify formatting with Black** (without making changes):
   ```bash
   uv run black --check .
   ```

#### Configuration Files

- **Black configuration**: Found in `pyproject.toml` under `[tool.black]`
  - Line length: 88 characters
  - Target Python versions are specified per project
  
- **Flake8 configuration**: Found in `.flake8` files
  - Max line length: 88 characters (matching Black)
  - Ignores certain rules that conflict with Black (E203, W503)

### Continuous Integration (CI)

All pull requests are automatically checked by our CI pipeline:

- **Flake8**: Ensures code follows Python style guidelines
- **Black**: Verifies code is properly formatted

**CI will fail if:**
- Your code has style violations detected by Flake8
- Your code is not formatted according to Black's standards

**To fix CI failures:**
1. Run `uv run black .` to auto-format your code
2. Run `uv run flake8 .` to check for any remaining issues
3. Fix any issues reported by Flake8
4. Commit and push your changes

## Development Workflow

1. Fork the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Run linters locally (see above)
5. Commit your changes with clear, descriptive messages
6. Push to your fork
7. Submit a pull request

## Questions?

If you have any questions about contributing, feel free to open an issue for discussion.
