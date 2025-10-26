# CI/CD Pipeline Documentation

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** CI/CD Pipeline Configuration  
**Version:** 1.0  
**Date:** October 22, 2025  
**Status:** Implementation Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Pipeline Architecture](#2-pipeline-architecture)
3. [GitHub Actions Workflows](#3-github-actions-workflows)
4. [Environment Configuration](#4-environment-configuration)
5. [Deployment Strategy](#5-deployment-strategy)
6. [Monitoring and Notifications](#6-monitoring-and-notifications)
7. [Security Considerations](#7-security-considerations)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Overview

### 1.1 Purpose

This document defines the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Eatsential platform, ensuring code quality, automated testing, and reliable deployments.

### 1.2 Pipeline Goals

1. **Automated Testing:** Run all tests on every commit
2. **Code Quality:** Enforce linting and formatting standards
3. **Security Scanning:** Detect vulnerabilities early
4. **Automated Deployment:** Deploy to staging/production automatically
5. **Fast Feedback:** Provide quick feedback to developers

### 1.3 Technology Stack

- **CI/CD Platform:** GitHub Actions
- **Container Registry:** GitHub Container Registry
- **Deployment Targets:**
  - Staging: Vercel (Frontend), Railway (Backend)
  - Production: Vercel (Frontend), AWS ECS (Backend)

---

## 2. Pipeline Architecture

### 2.1 Pipeline Stages

```mermaid
graph LR
    A[Code Push] --> B[Lint & Format]
    B --> C[Build]
    C --> D[Unit Tests]
    D --> E[Integration Tests]
    E --> F[Security Scan]
    F --> G{Branch?}
    G -->|PR| H[Preview Deploy]
    G -->|main| I[Staging Deploy]
    I --> J[E2E Tests]
    J --> K{Manual Approval}
    K -->|Approved| L[Production Deploy]
```

### 2.2 Branch Strategy

| Branch      | Purpose      | Auto Deploy | Environment |
| ----------- | ------------ | ----------- | ----------- |
| `main`      | Stable code  | Yes         | Staging     |
| `develop`   | Integration  | Yes         | Dev         |
| `feature/*` | Features     | No          | -           |
| `hotfix/*`  | Urgent fixes | Yes         | Staging     |
| `release/*` | Release prep | Yes         | Staging     |

---

## 3. GitHub Actions Workflows

### 3.1 Main CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'

jobs:
  # Frontend Checks
  frontend-lint:
    name: Frontend Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        working-directory: ./frontend
        run: bun install

      - name: Run ESLint
        working-directory: ./frontend
        run: bun run lint

      - name: Check Prettier formatting
        working-directory: ./frontend
        run: bun run format:check

  frontend-test:
    name: Frontend Tests
    runs-on: ubuntu-latest
    needs: frontend-lint
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        working-directory: ./frontend
        run: bun install

      - name: Run tests
        working-directory: ./frontend
        run: bun test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./frontend/coverage/lcov.info
          flags: frontend

  frontend-build:
    name: Frontend Build
    runs-on: ubuntu-latest
    needs: frontend-test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        working-directory: ./frontend
        run: bun install

      - name: Build application
        working-directory: ./frontend
        run: bun run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: frontend/dist

  # Backend Checks
  backend-lint:
    name: Backend Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        working-directory: ./backend
        run: uv sync

      - name: Run Ruff
        working-directory: ./backend
        run: uv run ruff check src tests

      - name: Check Black formatting
        working-directory: ./backend
        run: uv run black --check src tests

      - name: Run mypy
        working-directory: ./backend
        run: uv run mypy src

  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest
    needs: backend-lint
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: eatsential_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        working-directory: ./backend
        run: uv sync

      - name: Run migrations
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost/eatsential_test
        run: uv run alembic upgrade head

      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost/eatsential_test
        run: uv run pytest --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
          flags: backend

  # Security Scanning
  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Frontend dependency audit
        working-directory: ./frontend
        run: npm audit --audit-level=high

      - name: Backend dependency check
        working-directory: ./backend
        run: |
          pip install safety
          uv pip freeze | safety check --stdin

  # Documentation Check
  docs-check:
    name: Documentation Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check markdown formatting
        run: |
          npm install -g prettier
          prettier --check "docs/**/*.md"

      - name: Check for broken links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          folder-path: 'docs'
```

### 3.2 Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy-frontend:
    name: Deploy Frontend
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        working-directory: ./frontend
        run: bun install

      - name: Build application
        working-directory: ./frontend
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_ENVIRONMENT: ${{ github.event.inputs.environment || 'staging' }}
        run: bun run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          production: ${{ github.event.inputs.environment == 'production' }}

  deploy-backend:
    name: Deploy Backend
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/backend:${{ github.sha }}
            ghcr.io/${{ github.repository }}/backend:${{ github.event.inputs.environment || 'staging' }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to Railway (Staging)
        if: github.event.inputs.environment != 'production'
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: eatsential-backend

      - name: Deploy to AWS ECS (Production)
        if: github.event.inputs.environment == 'production'
        run: |
          # AWS ECS deployment script
          echo "Deploying to production..."
          # Implementation depends on AWS setup

  run-e2e-tests:
    name: E2E Tests
    needs: [deploy-frontend, deploy-backend]
    runs-on: ubuntu-latest
    if: github.event.inputs.environment != 'production'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install Playwright
        run: |
          npm install -g playwright
          playwright install chromium

      - name: Run E2E tests
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
        run: |
          cd e2e
          npm install
          npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: e2e-test-results
          path: e2e/test-results
```

### 3.3 PR Checks Workflow

Create `.github/workflows/pr-checks.yml`:

```yaml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  pr-title:
    name: PR Title Check
    runs-on: ubuntu-latest
    steps:
      - name: Check PR title
        uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            style
            refactor
            test
            chore
            perf
            ci
          requireScope: false

  size-check:
    name: PR Size Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check PR size
        uses: CodelyTV/pr-size-labeler@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          xs_max_size: 10
          s_max_size: 100
          m_max_size: 500
          l_max_size: 1000
          message_if_xl: >
            This PR is very large. Please consider breaking it down into smaller PRs.

  preview-deploy:
    name: Preview Deployment
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-comment: true
          working-directory: ./frontend
```

---

## 4. Environment Configuration

### 4.1 GitHub Secrets

Required secrets for each environment:

#### Organization Secrets

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
RAILWAY_TOKEN
CODECOV_TOKEN
```

#### Environment-Specific Secrets

**Staging:**

```
API_URL=https://staging-api.eatsential.com
DATABASE_URL=postgresql://...
SECRET_KEY=...
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

**Production:**

```
API_URL=https://api.eatsential.com
DATABASE_URL=postgresql://...
SECRET_KEY=...
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SENTRY_DSN=...
```

### 4.2 Docker Configuration

Create `backend/Dockerfile`:

```dockerfile
# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Set Python path
ENV PYTHONPATH=/app/src
ENV PATH="/app/.venv/bin:$PATH"

# Run migrations and start server
CMD alembic upgrade head && \
    uvicorn eatsential.index:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers ${WORKERS:-4}
```

---

## 5. Deployment Strategy

### 5.1 Deployment Environments

| Environment | Purpose         | URL                    | Auto Deploy          |
| ----------- | --------------- | ---------------------- | -------------------- |
| Development | Feature testing | dev.eatsential.com     | Yes (develop branch) |
| Staging     | Pre-production  | staging.eatsential.com | Yes (main branch)    |
| Production  | Live users      | eatsential.com         | Manual approval      |

### 5.2 Deployment Process

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant CI as CI/CD
    participant Staging as Staging
    participant Prod as Production

    Dev->>GH: Push to feature branch
    GH->>CI: Trigger CI pipeline
    CI->>CI: Run tests & checks
    CI->>Dev: Report status

    Dev->>GH: Merge to main
    GH->>CI: Trigger deployment
    CI->>Staging: Deploy to staging
    CI->>CI: Run E2E tests
    CI->>Dev: Notify success

    Dev->>CI: Approve production
    CI->>Prod: Deploy to production
    CI->>Dev: Notify completion
```

### 5.3 Rollback Strategy

```yaml
# Rollback workflow
name: Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to rollback to (git SHA)'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          # Implement rollback logic
          echo "Rolling back ${{ inputs.environment }} to ${{ inputs.version }}"
```

---

## 6. Monitoring and Notifications

### 6.1 Slack Integration

Create `.github/workflows/notify.yml`:

```yaml
name: Notifications

on:
  workflow_run:
    workflows: ['CI Pipeline', 'Deploy Pipeline']
    types: [completed]

jobs:
  notify:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Pipeline Failed!
            Workflow: ${{ github.event.workflow_run.name }}
            Branch: ${{ github.event.workflow_run.head_branch }}
            Commit: ${{ github.event.workflow_run.head_sha }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 6.2 Monitoring Dashboard

```yaml
# Status badge in README
[![CI Pipeline](https://github.com/Asoingbob225/CSC510/actions/workflows/ci.yml/badge.svg)](https://github.com/Asoingbob225/CSC510/actions/workflows/ci.yml)
[![Deploy Pipeline](https://github.com/Asoingbob225/CSC510/actions/workflows/deploy.yml/badge.svg)](https://github.com/Asoingbob225/CSC510/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/Asoingbob225/CSC510/branch/main/graph/badge.svg)](https://codecov.io/gh/Asoingbob225/CSC510)
```

---

## 7. Security Considerations

### 7.1 Security Scanning

```yaml
# SAST scanning with CodeQL
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  with:
    languages: javascript, python

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```

### 7.2 Dependency Updates

```yaml
# Dependabot configuration
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/frontend'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10

  - package-ecosystem: 'pip'
    directory: '/backend'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 10
```

### 7.3 Secret Scanning

```yaml
# Pre-commit hooks
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Build Failures

```bash
# Check workflow logs
gh workflow view ci.yml

# Re-run failed jobs
gh run rerun <run-id> --failed

# Debug locally
act -j frontend-test
```

#### Deployment Issues

```bash
# Check deployment status
vercel ls

# Rollback Vercel deployment
vercel rollback <deployment-url>

# Check Railway logs
railway logs
```

### 8.2 Performance Optimization

```yaml
# Cache dependencies
- name: Cache Bun dependencies
  uses: actions/cache@v3
  with:
    path: ~/.bun
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}

- name: Cache Python dependencies
  uses: actions/cache@v3
  with:
    path: ~/.cache/uv
    key: ${{ runner.os }}-uv-${{ hashFiles('**/uv.lock') }}
```

### 8.3 Debugging Workflows

```yaml
# Enable debug logging
- name: Debug step
  run: |
    echo "::debug::Debug message"
    echo "Event: ${{ toJson(github.event) }}"
  env:
    ACTIONS_STEP_DEBUG: true
```

---

## Appendix A: Implementation Checklist

- [ ] Create `.github/workflows/` directory
- [ ] Implement CI workflow
- [ ] Implement deployment workflow
- [ ] Configure GitHub secrets
- [ ] Set up Vercel project
- [ ] Set up Railway project
- [ ] Configure Codecov
- [ ] Set up Slack notifications
- [ ] Configure Dependabot
- [ ] Add status badges to README
- [ ] Test all workflows
- [ ] Document team access

---

## Appendix B: Cost Estimates

| Service        | Free Tier       | Estimated Monthly Cost |
| -------------- | --------------- | ---------------------- |
| GitHub Actions | 2,000 min/month | $0                     |
| Vercel         | 100GB bandwidth | $0                     |
| Railway        | $5 credit       | $5-10                  |
| AWS ECS        | Limited         | $20-50                 |
| Codecov        | Open source     | $0                     |

**Total Estimated Cost:** $25-60/month for production
