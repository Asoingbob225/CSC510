# 🚀 Quick Start: Add Codecov Token (5 Minutes)

This is a streamlined guide to add the Codecov token to enable automated coverage reporting.

---

## ✅ Prerequisites

- [ ] You have **admin access** to this GitHub repository
- [ ] You have access to [codecov.io](https://codecov.io)

---

## 📋 Step-by-Step Instructions

### Step 1: Get Your Codecov Token (2 minutes)

1. **Open Codecov**: Go to https://codecov.io
2. **Sign In**: Use your GitHub account
3. **Find Repository**: 
   - Click on your username/organization
   - Search for `Asoingbob225/CSC510`
   - If not found, click "Add new repository" and select it
4. **Get Token**:
   - Once in the repository, click **Settings**
   - Find "Repository Upload Token" section
   - Click to reveal and **copy** the token
   - It looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Step 2: Add Token to GitHub (2 minutes)

1. **Open Repository Settings**:
   - Go to: https://github.com/Asoingbob225/CSC510/settings/secrets/actions
   - OR navigate: Repository → Settings → Secrets and variables → Actions

2. **Create New Secret**:
   - Click the **"New repository secret"** button (green, top right)

3. **Enter Details**:
   ```
   Name: CODECOV_TOKEN
   Value: [paste the token you copied]
   ```
   
   ⚠️ **Important**: The name must be **exactly** `CODECOV_TOKEN` (case-sensitive)

4. **Save**:
   - Click **"Add secret"**
   - You should see `CODECOV_TOKEN` in the list with value `***`

### Step 3: Verify It Works (1 minute)

**Option A: Push a Test Commit**
```bash
git commit --allow-empty -m "test: verify codecov integration"
git push
```

**Option B: Manual Workflow Trigger**
1. Go to: https://github.com/Asoingbob225/CSC510/actions
2. Click "CI & Test Coverage"
3. Click "Run workflow" → "Run workflow"

**Check Results:**
1. Wait for workflow to complete (~2-3 minutes)
2. Click on the workflow run
3. Go to "upload-coverage" job
4. Check "Upload coverage to Codecov" step
5. Should see: ✅ Success with upload confirmation

---

## 🎉 Success Indicators

After successful setup:

✅ Workflow completes without errors  
✅ Badge shows coverage percentage: ![codecov](https://codecov.io/gh/Asoingbob225/CSC510/branch/main/graph/badge.svg)  
✅ Coverage visible at: https://codecov.io/gh/Asoingbob225/CSC510  
✅ Codecov bot comments on pull requests

---

## ❌ Troubleshooting

### Error: "Token not found"
- **Fix**: Double-check the secret name is `CODECOV_TOKEN` (exact, case-sensitive)
- **Fix**: Verify the secret is added as a "Repository secret", not "Environment secret"

### Badge shows "unknown"
- **Fix**: Wait 2-3 minutes for first coverage upload to process
- **Fix**: Check workflow logs to ensure upload succeeded

### Workflow step skipped
- **Fix**: Ensure secret was added before the workflow run
- **Fix**: Re-run the workflow after adding the secret

---

## 📚 Need More Help?

Detailed documentation with troubleshooting:
- **Full Guide**: [`proj2/docs/6-DEPLOYMENT/codecov-setup.md`](proj2/docs/6-DEPLOYMENT/codecov-setup.md)
- **Checklist**: [`CODECOV_CHECKLIST.md`](CODECOV_CHECKLIST.md)

---

## 🔐 Security Notes

- ✅ Tokens are encrypted and secure
- ✅ Tokens cannot be retrieved after saving
- ✅ Only workflows can access the token
- ⚠️ Never commit tokens to code
- ⚠️ Never share tokens in chat/email

---

**Time Required:** 5 minutes  
**Difficulty:** Easy  
**Type:** One-time setup  

---

Last updated: October 22, 2025
