# Codecov Integration Checklist

This checklist tracks the completion status of Codecov integration for the repository.

## ✅ Completed Tasks

- [x] **Workflow Configuration**
  - [x] `.github/workflows/test-coverage.yml` exists and is properly configured
  - [x] Workflow runs on push to main and pull requests
  - [x] Frontend tests run and generate coverage (lcov.info)
  - [x] Backend tests run and generate coverage (coverage.xml)
  - [x] Artifacts uploaded for both frontend and backend
  - [x] Coverage upload step properly downloads both artifacts
  - [x] Workflow uses `codecov/codecov-action@v5`
  - [x] Workflow references `CODECOV_TOKEN` from secrets

- [x] **Codecov Configuration**
  - [x] `codecov.yml` exists at repository root
  - [x] Coverage range set to 70-100%
  - [x] CI pass requirement enabled
  - [x] PR comments configured
  - [x] Flags configured for frontend and backend

- [x] **Documentation**
  - [x] Comprehensive setup guide created (`proj2/docs/6-DEPLOYMENT/codecov-setup.md`)
  - [x] Quick reference guide created (`CODECOV_SETUP_REQUIRED.md`)
  - [x] Deployment README updated with reference
  - [x] Step-by-step instructions provided
  - [x] Troubleshooting section included
  - [x] Security best practices documented

- [x] **Badge Configuration**
  - [x] Codecov badge added to `proj2/README.md`
  - [x] Badge URL points to correct repository
  - [x] Badge links to Codecov dashboard

## ⚠️ Pending Tasks (Requires Manual Action)

- [ ] **Repository Secret Setup** (REQUIRED)
  - [ ] Obtain Codecov upload token from codecov.io
  - [ ] Add `CODECOV_TOKEN` to GitHub repository secrets
  - [ ] Verify secret name is exactly `CODECOV_TOKEN` (case-sensitive)

- [ ] **Verification** (After secret is added)
  - [ ] Trigger a workflow run
  - [ ] Verify workflow completes successfully
  - [ ] Check coverage upload step in workflow logs
  - [ ] Verify coverage appears in Codecov dashboard
  - [ ] Verify badge displays coverage percentage (not "unknown")
  - [ ] Check that PR comments work on test PR

## 📝 Instructions for Repository Administrator

### Step 1: Get Codecov Token

1. Visit https://codecov.io
2. Sign in with GitHub account
3. Navigate to `Asoingbob225/CSC510` repository
4. Go to Settings → Upload Token
5. Copy the token

### Step 2: Add Secret to GitHub

1. Go to https://github.com/Asoingbob225/CSC510/settings/secrets/actions
2. Click "New repository secret"
3. Name: `CODECOV_TOKEN`
4. Value: [paste token from Step 1]
5. Click "Add secret"

### Step 3: Verify

1. Push a commit or manually trigger workflow
2. Check Actions tab for successful completion
3. Visit https://codecov.io/gh/Asoingbob225/CSC510
4. Verify coverage data appears

## 📚 Reference Documentation

- **Detailed Guide**: `proj2/docs/6-DEPLOYMENT/codecov-setup.md`
- **Quick Reference**: `CODECOV_SETUP_REQUIRED.md`
- **Workflow File**: `.github/workflows/test-coverage.yml`
- **Codecov Config**: `codecov.yml`

## 🔍 Verification Commands

After secret is added, run these to verify:

```bash
# Check that coverage files are generated locally
cd proj2
bun run --filter frontend coverage
ls -la frontend/coverage/lcov.info

cd backend
uv run -m pytest --cov --cov-report=xml
ls -la coverage.xml
```

## 📊 Expected Results

After successful setup:

1. **Workflow**: Upload step shows "✅ Codecov report uploaded successfully"
2. **Badge**: Displays coverage percentage (e.g., "85%")
3. **Dashboard**: Coverage data visible at https://codecov.io/gh/Asoingbob225/CSC510
4. **PR Comments**: Codecov bot posts coverage diffs on pull requests

## 🚨 Important Notes

- The token must be added as a **Repository secret**, not an Environment secret
- The secret name **must** be exactly `CODECOV_TOKEN` (case-sensitive)
- This is a one-time setup; the token persists across workflow runs
- The token is encrypted and cannot be retrieved after saving

## 📅 Timeline

- **Setup Time**: 5-10 minutes
- **Priority**: High (blocks automated coverage reporting)
- **Type**: One-time configuration

## ✅ Sign-off

- [ ] Repository administrator has completed secret setup
- [ ] Verification tests passed
- [ ] Team notified of successful integration
- [ ] Documentation reviewed and approved

---

**Status**: Ready for secret setup  
**Last Updated**: October 22, 2025  
**Next Action**: Repository administrator to add CODECOV_TOKEN secret
