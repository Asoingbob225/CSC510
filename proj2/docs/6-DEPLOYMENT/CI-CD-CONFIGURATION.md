# Eatsential Deployment & CI/CD Configuration

## 🚀 Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React/Vite)  │    │   (FastAPI)     │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React 19      │────│ • FastAPI       │────│ • PostgreSQL    │
│ • TypeScript    │    │ • Python 3.9+  │    │ • Redis Cache   │  
│ • Tailwind CSS  │    │ • Pydantic      │    │ • OpenAI API    │
│ • Vite Build    │    │ • Uvicorn       │    │ • RAG Vector DB │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 CI/CD Pipeline Overview

The `eatsential-ci-cd.yml` workflow provides comprehensive automation:

### 1. Code Quality Checks
```yaml
# Frontend Checks
- TypeScript type checking (tsc --noEmit)
- ESLint code style checking
- Prettier format validation

# Backend Checks  
- Ruff Python code analysis
- Bandit security vulnerability scanning
- Dependency security audit
```

### 2. Automated Testing
```yaml
# Frontend Testing
- Vitest unit tests + React Testing Library
- Component rendering tests
- User interaction tests
- Coverage reporting

# Backend Testing
- Pytest unit tests
- FastAPI endpoint testing  
- Data model validation
- API integration tests
```

### 3. API Documentation Generation
```yaml
# Auto-generation Process
1. Start FastAPI server
2. Download OpenAPI JSON specification
3. Generate ReDoc static documentation
4. Upload documentation artifacts
```

### 4. Build & Deployment
```yaml
# Frontend Build
- Vite production build
- Static asset optimization
- Build artifact validation

# Backend Preparation  
- Python dependency packaging
- Docker image build (optional)
- Environment configuration
```

## 🔧 Local Development Setup

### Frontend Development Server
```bash
cd proj2
bun install                      # Install dependencies
bun run --filter frontend dev   # Start dev server (http://localhost:5173)
```

### Backend Development Server
```bash
cd proj2/backend
uv sync                          # Install Python dependencies
uv run uvicorn index:app --reload  # Start dev server (http://localhost:8000)
```

### Start Both Frontend & Backend
```bash
# In proj2 directory
bun run dev                      # Can be configured to start both simultaneously
```

## 📱 API Documentation Access

After starting the backend server, access API documentation via:

| URL | Description | Features |
|-----|-------------|----------|
| `http://localhost:8000/docs` | Swagger UI | Interactive API testing |
| `http://localhost:8000/redoc` | ReDoc Documentation | Beautiful API docs |
| `http://localhost:8000/openapi.json` | OpenAPI Specification | JSON format specification |

## 🧪 Testing Commands

### Frontend Testing
```bash
cd proj2
bun run --filter frontend test        # Run tests
bun run --filter frontend coverage    # Generate coverage report
```

### Backend Testing  
```bash
cd proj2/backend
uv run pytest                         # Run all tests
uv run pytest --cov                   # Generate coverage report
uv run pytest -v                      # Verbose test output
```

## 🔒 Security Configuration

### Environment Variables
```bash
# .env file example (do not commit to Git)
DATABASE_URL=postgresql://user:pass@localhost/eatsential
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-xxx...
JWT_SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Production Security
```yaml
# GitHub Secrets Configuration
CODECOV_TOKEN          # Code coverage reporting
DATABASE_URL           # Production database connection
OPENAI_API_KEY         # OpenAI API key
JWT_SECRET_KEY         # JWT signing key
SENTRY_DSN            # Error monitoring (optional)
```

## � Deployment Strategies

### Development Environment
- **Trigger**: Push to `develop` branch
- **Target**: Development server
- **Database**: Development environment database
- **Features**: Auto-deployment for internal testing

### Production Environment  
- **Trigger**: Push to `main` branch
- **Target**: Production server
- **Database**: Production environment database  
- **Features**: Manual approval, stable and reliable

### Container Deployment (Docker)
```dockerfile
# Frontend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]

# Backend Dockerfile  
FROM python:3.9-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync
COPY . .
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "index:app", "--host", "0.0.0.0"]
```

## 📈 CI/CD Optimization

### 1. Caching Strategy
```yaml
# Dependency caching
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/pyproject.toml') }}

- uses: actions/cache@v4  
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
```

### 2. Conditional Deployment
```yaml
# Run only on specific file changes
on:
  push:
    paths: 
      - 'proj2/backend/**'
      - 'proj2/frontend/**'
      - '.github/workflows/**'
```

## 🎯 Next Steps & Improvements

1. **Performance Testing**: Add Lighthouse CI for frontend performance
2. **Enhanced Security**: Container security scanning and dependency vulnerability checks
3. **Automated Deployment**: Integrate AWS/Azure/GCP auto-deployment
4. **Monitoring & Alerts**: Application performance monitoring and alerting
5. **Blue-Green Deployment**: Zero-downtime deployment strategy

---

**This configuration provides enterprise-grade CI/CD pipeline for Eatsential project, ensuring code quality and deployment reliability!** 🚀