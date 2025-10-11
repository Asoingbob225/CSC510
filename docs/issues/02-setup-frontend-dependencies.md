# Install and Verify proj2 Frontend Dependencies

**Labels:** `good first issue`, `hello-workflow`, `frontend`, `setup`

## Description
Install all required dependencies for the React + TypeScript frontend application.

## Tasks
- [ ] Navigate to `CSC510/proj2` directory
- [ ] Run `bun install` in the root directory
- [ ] Navigate to `CSC510/proj2/frontend` directory
- [ ] Run `bun install` in the frontend directory
- [ ] Verify `node_modules` folder is created
- [ ] Check that no errors occurred during installation

## Acceptance Criteria
- ✅ All dependencies are installed successfully without errors
- ✅ `node_modules` directories exist in both root and frontend folders
- ✅ Screenshot of successful installation output
- ✅ No security vulnerabilities reported

## Commands to Run
```bash
cd CSC510/proj2
bun install

cd frontend
bun install

# Verify
ls -la node_modules | head -10
```

## Troubleshooting
If you encounter issues:
- Make sure Bun is installed (see Issue #1)
- Try removing `node_modules` and `bun.lock`, then run `bun install` again
- Check that you're in the correct directory

Closes #[ISSUE_NUMBER]
