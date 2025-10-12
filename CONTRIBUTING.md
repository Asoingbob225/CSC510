# Contributing to CSC510

Thank you for considering contributing to this project!

## Development Setup

### Prerequisites

- Python 3.9+ (for proj2/backend)
- Python 3.13+ (for proj1/1b1_rag_dify)
- [uv](https://docs.astral.sh/uv/) package manager

### Setting Up Your Development Environment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Asoingbob225/CSC510.git
   cd CSC510
   ```

2. **Install uv (if not already installed):**
   ```bash
   pip install uv
   ```

3. **Install project dependencies:**

   For proj2/backend:
   ```bash
   cd proj2/backend
   uv sync --dev
   ```

   For proj1/1b1_rag_dify:
   ```bash
   cd proj1/1b1_rag_dify
   uv sync --dev
   ```

## Running Tests

### Running Tests with Coverage

We use `pytest` for testing and `coverage` for measuring test coverage.

#### For proj2/backend:

```bash
cd proj2/backend

# Run tests with coverage
uv run coverage run -m pytest

# View coverage report in terminal
uv run coverage report

# Generate HTML coverage report
uv run coverage html
# Open htmlcov/index.html in your browser

# Generate XML coverage report (used by CI)
uv run coverage xml
```

#### For proj1/1b1_rag_dify:

First, create a `.env` file with test credentials:
```bash
cd proj1/1b1_rag_dify
cp .env.example .env
# Edit .env with your test values
```

Then run tests:
```bash
# Run tests with coverage
uv run coverage run -m pytest

# View coverage report in terminal
uv run coverage report

# Generate HTML coverage report
uv run coverage html
# Open htmlcov/index.html in your browser

# Generate XML coverage report (used by CI)
uv run coverage xml
```

### Running Tests Without Coverage

If you just want to run tests quickly without coverage:

```bash
uv run pytest
```

## Code Coverage

We use [Codecov](https://codecov.io/) to track code coverage across the project. Coverage reports are automatically generated and uploaded when you push to the repository.

### Viewing Coverage Reports

- **Public Coverage Dashboard:** Visit [Codecov for CSC510](https://codecov.io/gh/Asoingbob225/CSC510)
- **Local HTML Report:** Run `uv run coverage html` and open `htmlcov/index.html`

### Coverage Goals

- We aim for at least 80% code coverage
- All new code should include corresponding tests
- Pull requests should not significantly decrease overall coverage

## Pull Request Guidelines

1. **Fork the repository** and create your branch from `main`
2. **Write tests** for any new functionality
3. **Run tests and coverage** locally before submitting
4. **Ensure all tests pass** and coverage is maintained or improved
5. **Update documentation** if you're changing functionality
6. **Create a pull request** with a clear description of your changes

## Code Style

- We use `ruff` for Python linting and formatting
- Run `uv run ruff check .` to check for issues
- Run `uv run ruff format .` to auto-format code

## Questions?

If you have questions or need help, please open an issue in the repository.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (AGPL-3.0).
