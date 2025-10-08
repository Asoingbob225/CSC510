# CI/CD Pipeline Documentation

This project has automated CI/CD workflows using GitHub Actions that test the frontend, backend, and their integration.

## Workflows

### 1. Frontend CI/CD (`.github/workflows/frontend-ci.yml`)

**Triggers:** Changes to `proj2/frontend/**`, `proj2/package.json`, `proj2/tsconfig.json`

**Steps:**
- ✅ Setup Node.js 20 with npm caching
- ✅ Install dependencies with `npm ci`
- ✅ Run ESLint linting with `npm run lint`
- ✅ Type checking with TypeScript `tsc --noEmit`
- ✅ Run tests with `npm test`
- ✅ Build production bundle with `npm run build`
- ✅ Verify build artifacts exist
- ✅ Upload build artifacts for 30 days

### 2. Backend CI/CD (`.github/workflows/backend-ci.yml`)

**Triggers:** Changes to `proj2/backend/**`

**Steps:**
- ✅ Setup Python 3.9
- ✅ Install uv package manager with caching
- ✅ Install dependencies with `uv sync`
- ✅ Run linting with Ruff `uv run ruff check .`
- ✅ Run formatting check with Ruff `uv run ruff format --check .`
- ✅ Install test dependencies with `uv sync --group test`
- ✅ Run custom tests with `uv run python test_api.py`
- ✅ Test FastAPI app imports
- ✅ Test API endpoints by starting server and making HTTP requests

### 3. Integration Tests (`.github/workflows/integration-tests.yml`)

**Triggers:** Changes to `proj2/**`

**Steps:**
- ✅ Setup Node.js 20 and Python 3.9
- ✅ Install both frontend and backend dependencies
- ✅ Run comprehensive integration test script (`integration-test.sh`)

The integration test script performs:
- 🚀 Start backend FastAPI server on port 8000
- ⏳ Wait for backend to be ready and responding
- 🧪 Test backend API endpoint directly
- 🏗️ Build frontend with `npm run build`
- 🔧 Start frontend preview server on port 5173
- ⏳ Wait for frontend to be ready
- 🧪 Test frontend serves valid HTML content
- 🧪 Test frontend-backend proxy integration
- 🧹 Automatic cleanup of processes

## Test Coverage

### Frontend Tests
- **Linting:** ESLint configuration checks
- **Type Safety:** TypeScript compilation without errors
- **Build Process:** Vite production build
- **Placeholder:** Basic test command (ready for future test framework)

### Backend Tests
- **Linting:** Ruff code quality checks
- **Formatting:** Ruff code formatting verification
- **Unit Tests:** FastAPI TestClient integration tests
- **Import Tests:** Module import verification
- **API Tests:** Live HTTP endpoint testing

### Integration Tests
- **Server Communication:** Backend-frontend HTTP communication
- **Proxy Configuration:** Vite proxy setup verification
- **Build Artifacts:** Frontend build output validation
- **End-to-End:** Complete application startup and basic functionality

## How to Run Locally

### Frontend Tests
```bash
cd proj2/frontend
npm install
npm run lint
npm run test
npm run build
```

### Backend Tests
```bash
cd proj2/backend
uv sync --group test
uv run ruff check .
uv run ruff format --check .
uv run python test_api.py
```

### Integration Tests
```bash
# From project root
./integration-test.sh
```

## Adding New Tests

### Frontend
- Add test files in `proj2/frontend/src/` with `.test.ts` or `.test.tsx` extensions
- Install a testing framework like Vitest or Jest
- Update the `test` script in `package.json`

### Backend
- Add test files in `proj2/backend/` with `test_*.py` naming
- Use pytest for more advanced testing
- Tests should use FastAPI's TestClient for API testing

### Integration
- Add new test scenarios to `integration-test.sh`
- Consider adding browser-based testing with tools like Playwright
- Test different deployment scenarios

## Continuous Integration Benefits

- ✅ **Automated Quality Assurance:** Every commit is automatically tested
- ✅ **Early Bug Detection:** Issues caught before reaching production
- ✅ **Code Consistency:** Enforced linting and formatting standards
- ✅ **Integration Validation:** Frontend-backend communication verified
- ✅ **Build Verification:** Ensures deployable artifacts are created
- ✅ **Developer Confidence:** Clear feedback on code changes