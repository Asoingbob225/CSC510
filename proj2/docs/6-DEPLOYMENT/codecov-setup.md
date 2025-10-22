# Codecov Setup Guide

**Project:** Eatsential - Precision Nutrition Platform  
**Document Type:** Codecov Integration Configuration  
**Version:** 1.0  
**Date:** October 22, 2025  
**Status:** Setup Required

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Obtaining Codecov API Key](#3-obtaining-codecov-api-key)
4. [Adding Secret to GitHub Repository](#4-adding-secret-to-github-repository)
5. [Verification](#5-verification)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Overview

### 1.1 Purpose

This guide provides step-by-step instructions for setting up Codecov integration to enable automated code coverage reporting for the Eatsential project.

### 1.2 What is Codecov?

Codecov is a code coverage tool that helps track and visualize test coverage across your codebase. It integrates with GitHub Actions to automatically upload coverage reports and provide insights through badges, graphs, and PR comments.

### 1.3 Current Configuration

The repository is already configured to use Codecov:

- ✅ Workflow file: `.github/workflows/test-coverage.yml`
- ✅ Configuration file: `codecov.yml` in repository root
- ✅ Badge in README: `proj2/README.md` (line 6)
- ⚠️ **Missing:** `CODECOV_TOKEN` secret in repository settings

---

## 2. Prerequisites

Before proceeding, ensure you have:

- [ ] Admin access to the GitHub repository (`Asoingbob225/CSC510`)
- [ ] Access to the Codecov dashboard for this repository
- [ ] The Codecov API token (obtained in step 3)

---

## 3. Obtaining Codecov API Key

### 3.1 For Repository Admins

If you are the repository owner or have admin access:

1. **Go to Codecov:**
   - Visit [codecov.io](https://codecov.io)
   - Sign in with your GitHub account

2. **Navigate to Repository:**
   - Click on your profile/organization
   - Find and select the `Asoingbob225/CSC510` repository
   - If the repository is not listed, click "Add new repository" and select it

3. **Get Upload Token:**
   - Once in the repository dashboard, go to **Settings**
   - Look for the "Upload token" or "Repository Upload Token" section
   - Copy the token (it will look like a UUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 3.2 For Team Members

If you are a team member without Codecov access:

1. Contact the repository owner or project lead
2. Request the Codecov upload token
3. Alternatively, ask for access to be added to the Codecov organization

---

## 4. Adding Secret to GitHub Repository

### 4.1 Step-by-Step Instructions

1. **Navigate to Repository Settings:**
   ```
   https://github.com/Asoingbob225/CSC510/settings
   ```
   Or manually:
   - Go to the repository on GitHub
   - Click on **Settings** (top menu bar)

2. **Access Secrets Section:**
   - In the left sidebar, click **Secrets and variables**
   - Click **Actions** from the dropdown

3. **Add New Secret:**
   - Click the **New repository secret** button (green button in the top right)

4. **Enter Secret Details:**
   - **Name:** `CODECOV_TOKEN` (must be exactly this, case-sensitive)
   - **Value:** Paste the Codecov upload token you obtained in step 3
   - Click **Add secret**

### 4.2 Visual Guide

```
GitHub Repository
└── Settings
    └── Secrets and variables
        └── Actions
            └── New repository secret
                ├── Name: CODECOV_TOKEN
                └── Value: [paste your token here]
```

### 4.3 Important Notes

- ⚠️ The secret name **must** be exactly `CODECOV_TOKEN` (case-sensitive)
- ⚠️ The token will only be visible when you first create it
- ⚠️ Repository secrets are encrypted and cannot be retrieved once saved
- ✅ Secrets are automatically available to all GitHub Actions workflows

---

## 5. Verification

### 5.1 Verify Secret is Added

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. You should see `CODECOV_TOKEN` listed under "Repository secrets"
3. The value will show as `***` (hidden for security)

### 5.2 Test with GitHub Actions

After adding the secret, trigger a workflow run to test:

**Method 1: Push a commit**
```bash
# Make a trivial change and push
git commit --allow-empty -m "test: trigger CI to verify Codecov integration"
git push
```

**Method 2: Manually trigger workflow**
1. Go to **Actions** tab in GitHub
2. Select **CI & Test Coverage** workflow
3. Click **Run workflow** → **Run workflow**

### 5.3 Check Workflow Logs

1. Go to the **Actions** tab
2. Click on the running workflow
3. Navigate to the **upload-coverage** job
4. Check the **Upload coverage to Codecov** step
5. Successful output should show:
   ```
   ✅ Codecov report uploaded successfully
   ```

### 5.4 Verify Badge

After a successful workflow run:

1. Check the README badge at the top of `proj2/README.md`:
   ```markdown
   [![codecov](https://codecov.io/gh/Asoingbob225/CSC510/branch/main/graph/badge.svg)](https://codecov.io/gh/Asoingbob225/CSC510)
   ```

2. The badge should display the current coverage percentage (e.g., "85%")

3. Clicking the badge should take you to the Codecov dashboard for this repository

---

## 6. Troubleshooting

### 6.1 Common Issues

#### Issue: "Token not found" error in workflow

**Symptoms:**
```
Error: Codecov token not found. Please provide via input or CODECOV_TOKEN environment variable
```

**Solutions:**
- Verify the secret name is exactly `CODECOV_TOKEN` (case-sensitive)
- Confirm the secret exists in repository settings
- Check that the secret is a Repository secret, not an Environment secret
- Re-add the secret if necessary

#### Issue: Badge shows "unknown" coverage

**Symptoms:**
- Badge displays "unknown" instead of coverage percentage
- Badge image fails to load

**Solutions:**
- Verify at least one successful coverage upload has completed
- Check Codecov dashboard to ensure reports are being received
- Wait a few minutes for Codecov to process the coverage data
- Clear browser cache and reload the page

#### Issue: Workflow succeeds but no coverage on Codecov

**Symptoms:**
- Workflow shows successful completion
- No coverage data appears in Codecov dashboard

**Solutions:**
- Verify the coverage files are being generated correctly:
  - Frontend: `proj2/frontend/coverage/lcov.info`
  - Backend: `proj2/backend/coverage.xml`
- Check that artifacts are being uploaded in the workflow
- Review Codecov logs for any processing errors

### 6.2 Testing Coverage Locally

To ensure coverage reports are generated correctly:

**Frontend:**
```bash
cd proj2
bun run --filter frontend coverage
ls -la frontend/coverage/lcov.info  # Should exist
```

**Backend:**
```bash
cd proj2/backend
uv run -m pytest --cov --cov-report=xml
ls -la coverage.xml  # Should exist
```

### 6.3 Workflow Configuration Reference

The current workflow configuration (`.github/workflows/test-coverage.yml`) includes:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    flags: frontend,backend
    name: proj2-backend-coverage
  env:
    CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

This configuration:
- Uses Codecov action v5
- Tags uploads with `frontend` and `backend` flags
- Uses the `CODECOV_TOKEN` from repository secrets

### 6.4 Getting Help

If you encounter issues not covered here:

1. **Check Codecov Documentation:**
   - [Codecov GitHub Actions](https://docs.codecov.com/docs/github-actions)
   - [Codecov Upload Token](https://docs.codecov.com/docs/adding-the-codecov-token)

2. **Check Workflow Logs:**
   - Go to Actions tab → Select failed run → Review logs

3. **Contact Team:**
   - Open an issue in the repository
   - Contact the project maintainer

---

## Appendix A: Security Best Practices

### A.1 Secret Management

- ✅ **DO** store the token as a GitHub secret
- ✅ **DO** limit access to repository settings to admins only
- ✅ **DO** rotate tokens periodically (every 6-12 months)
- ❌ **DON'T** commit tokens to the repository
- ❌ **DON'T** share tokens in chat, email, or documentation
- ❌ **DON'T** use the same token across multiple repositories

### A.2 Token Rotation

To rotate the Codecov token:

1. Generate a new token in Codecov dashboard
2. Update the `CODECOV_TOKEN` secret in GitHub with the new value
3. Invalidate the old token in Codecov settings

---

## Appendix B: Configuration Files

### B.1 codecov.yml

The repository includes a `codecov.yml` configuration file at the root:

```yaml
codecov:
  require_ci_to_pass: yes

coverage:
  precision: 2
  round: down
  range: "70...100"

  status:
    project:
      default:
        target: auto
        threshold: 1%
        informational: false
    patch:
      default:
        target: auto
        threshold: 1%
        informational: false

comment:
  layout: "reach,diff,flags,tree"
  behavior: default
  require_changes: no
```

This configuration:
- Requires CI to pass before accepting coverage reports
- Sets coverage range from 70% to 100%
- Allows 1% threshold variation
- Posts coverage comments on pull requests

### B.2 Workflow Integration

The test-coverage workflow runs on:
- Push to `main` branch
- Pull requests to `main` branch

Coverage is collected from:
- Frontend: Vitest with lcov reporter
- Backend: pytest with coverage.py

---

## Status Checklist

Use this checklist to track setup progress:

- [ ] Codecov account created/accessed
- [ ] Repository added to Codecov
- [ ] Upload token obtained from Codecov dashboard
- [ ] `CODECOV_TOKEN` secret added to GitHub repository
- [ ] Secret name verified (exactly `CODECOV_TOKEN`)
- [ ] Test workflow triggered
- [ ] Workflow upload step successful
- [ ] Coverage report visible in Codecov dashboard
- [ ] README badge displaying coverage percentage
- [ ] Documentation reviewed by team

---

**Last Updated:** October 22, 2025  
**Maintained By:** DevOps Team  
**Review Frequency:** Quarterly
