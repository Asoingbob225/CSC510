# Code Coverage Setup Guide

This document explains the code coverage integration that has been implemented for the CSC510 repository.

## What Has Been Implemented

### 1. Testing Infrastructure

#### Test Files Created:
- **proj2/backend/test_index.py** - Tests for the FastAPI backend
  - Tests the `/api` endpoint
  - Achieves 100% coverage of `index.py`
  
- **proj1/1b1_rag_dify/test_upload_to_dify.py** - Tests for the Dify upload module
  - Tests environment variable loading
  - Tests error handling for non-existent directories
  - Achieves ~35% coverage of `upload_to_dify.py` (baseline tests)

#### Dependencies Added:
Both `pyproject.toml` files have been updated with:
- `pytest>=8.3.4` - Testing framework
- `pytest-cov>=6.0.0` - Pytest plugin for coverage
- `coverage>=7.6.10` - Coverage measurement tool

### 2. Configuration Files

#### .coveragerc
- Defines what source code to measure
- Excludes test files, virtual environments, and frontend code
- Configures XML output format for CI/CD
- Sets up exclusion patterns for common non-testable code

#### codecov.yml
- Configures Codecov behavior
- Sets coverage precision and rounding
- Defines status check thresholds
- Configures PR comment format

#### pytest.ini
- Configures pytest test discovery
- Sets up verbose output
- Defines test file patterns

#### .gitignore
- Excludes coverage reports from version control
- Excludes virtual environments
- Excludes common Python build artifacts

### 3. GitHub Actions Workflow

**File:** `.github/workflows/test-coverage.yml`

**Features:**
- Runs on push and pull requests to `main` and `develop` branches
- Separate jobs for both projects:
  - `test-proj2-backend` (Python 3.9)
  - `test-proj1-rag` (Python 3.13)
- Uses `uv` for fast dependency management
- Generates coverage reports in XML format
- Uploads coverage to Codecov with separate flags for each project

### 4. Documentation

#### CONTRIBUTING.md
Comprehensive guide for contributors covering:
- Development environment setup
- How to run tests locally
- How to generate coverage reports
- Code style guidelines
- Pull request guidelines

#### README.md Updates
- Added Codecov badge
- Added link to coverage dashboard
- Added link to CONTRIBUTING.md

## How to Use Locally

### For proj2/backend:

```bash
cd proj2/backend

# Install dependencies
uv sync --dev

# Run tests
uv run pytest -v

# Run tests with coverage
uv run coverage run -m pytest

# View coverage report
uv run coverage report

# Generate HTML coverage report
uv run coverage html
# Then open htmlcov/index.html in your browser
```

### For proj1/1b1_rag_dify:

```bash
cd proj1/1b1_rag_dify

# Create .env file (required for tests)
echo "DIFY_API_KEY=test-key" > .env
echo "DATASET_ID=test-dataset-id" >> .env
echo "DIFY_BASE_URL=https://test.local" >> .env

# Install dependencies
uv sync --dev

# Run tests
uv run pytest -v

# Run tests with coverage
uv run coverage run -m pytest

# View coverage report
uv run coverage report

# Generate HTML coverage report
uv run coverage html
# Then open htmlcov/index.html in your browser
```

## Setting Up Codecov (Repository Owner)

To enable coverage reporting in CI, the repository owner needs to:

1. **Sign up at Codecov**
   - Go to https://codecov.io
   - Sign in with GitHub account
   - Authorize Codecov to access the repository

2. **Get the Codecov Token**
   - Navigate to the repository settings in Codecov
   - Copy the `CODECOV_TOKEN` value

3. **Add Token to GitHub Secrets**
   - Go to GitHub repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: Paste the token from Codecov
   - Click "Add secret"

4. **Verify Setup**
   - Create a pull request or push to main/develop
   - The "Python Tests with Coverage" workflow should run
   - Coverage reports should appear on Codecov
   - The badge in README.md should display the current coverage percentage

## Coverage Goals

- **Target:** 80% overall code coverage
- **Minimum:** All new code should be tested
- **PR Requirement:** Coverage should not decrease with new changes

## Troubleshooting

### Tests fail locally but pass in CI
- Ensure you have the correct Python version (3.9 for backend, 3.13 for proj1)
- Run `uv sync --dev` to ensure all dependencies are installed
- Check that virtual environments are activated

### Coverage report shows 0%
- Ensure you're using `coverage run -m pytest`, not just `pytest`
- Check that the source code is in the coverage path (configured in .coveragerc)

### Codecov upload fails in CI
- Verify that `CODECOV_TOKEN` is set in GitHub repository secrets
- Check that the coverage.xml file is being generated
- Review the workflow logs for error messages

## Files Created/Modified

### New Files:
- `.coveragerc` - Coverage configuration
- `.github/workflows/test-coverage.yml` - CI workflow
- `.gitignore` - Git ignore patterns
- `CONTRIBUTING.md` - Contributor guidelines
- `codecov.yml` - Codecov configuration
- `pytest.ini` - Pytest configuration
- `proj2/backend/test_index.py` - Backend tests
- `proj1/1b1_rag_dify/test_upload_to_dify.py` - Proj1 tests

### Modified Files:
- `README.md` - Added coverage badge and documentation
- `proj2/backend/pyproject.toml` - Added test dependencies
- `proj1/1b1_rag_dify/pyproject.toml` - Added test dependencies

## Next Steps for Improvement

1. **Increase Test Coverage**
   - Add more tests for proj1/1b1_rag_dify (currently at ~35%)
   - Test edge cases and error conditions
   - Add integration tests if needed

2. **Coverage Badges**
   - Once Codecov is set up, the badge will automatically update
   - Consider adding per-project badges

3. **Test Organization**
   - Consider creating `tests/` directories as projects grow
   - Separate unit tests from integration tests

4. **Continuous Improvement**
   - Monitor coverage trends over time
   - Set coverage requirements for new PRs
   - Review uncovered code periodically

## References

- [Coverage.py Documentation](https://coverage.readthedocs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Codecov Documentation](https://docs.codecov.com/)
- [uv Documentation](https://docs.astral.sh/uv/)
