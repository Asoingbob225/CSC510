# ⚠️ ACTION REQUIRED: Codecov Setup

## Quick Start

The repository is configured for automated code coverage reporting with Codecov, but requires a one-time setup step.

### What's Needed

Add the `CODECOV_TOKEN` secret to the GitHub repository to enable coverage uploads.

### Setup Instructions

**Step 1: Get the Token**
- Visit [codecov.io](https://codecov.io) and sign in with GitHub
- Navigate to the `Asoingbob225/CSC510` repository
- Copy the Upload Token from Settings

**Step 2: Add to GitHub**
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `CODECOV_TOKEN` (exact, case-sensitive)
4. Value: [paste the token]
5. Click **Add secret**

**Step 3: Verify**
- Trigger a workflow run (push a commit or manual run)
- Check that the coverage badge in `proj2/README.md` displays correctly
- Visit [Codecov dashboard](https://codecov.io/gh/Asoingbob225/CSC510) to view reports

### Detailed Guide

For complete step-by-step instructions with troubleshooting, see:
**[proj2/docs/6-DEPLOYMENT/codecov-setup.md](proj2/docs/6-DEPLOYMENT/codecov-setup.md)**

### Current Status

- ✅ Workflow configured: `.github/workflows/test-coverage.yml`
- ✅ Codecov config: `codecov.yml`
- ✅ Badge added: `proj2/README.md`
- ⚠️ **Missing**: `CODECOV_TOKEN` secret

### Time Required

Approximately **5-10 minutes** for someone with repository admin access.

---

**Priority:** High  
**Type:** One-time setup  
**Who:** Repository administrator
