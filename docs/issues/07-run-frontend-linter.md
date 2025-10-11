# Verify and Fix Frontend Code Quality with ESLint

**Labels:** `good first issue`, `hello-workflow`, `frontend`, `code-quality`

## Description
Run the frontend linter to check code quality and fix any issues. This ensures your code follows best practices and maintains consistency.

## Prerequisites
- Issue #6 completed (Frontend component added)

## Tasks
- [ ] Navigate to `proj2/frontend` directory
- [ ] Run `bun run lint` to check for linting errors
- [ ] Review any errors or warnings
- [ ] Fix any linting issues found
- [ ] Re-run linter to confirm all issues are resolved

## Acceptance Criteria
- ✅ Linter runs successfully
- ✅ All linting errors are fixed (or justified if ignored)
- ✅ Code follows ESLint rules configured in the project
- ✅ Screenshot of clean linter output
- ✅ No warnings about unused variables or imports

## Commands to Run

```bash
cd CSC510/proj2/frontend
bun run lint

# If there are auto-fixable issues, you can try:
# (Note: Check if your ESLint config supports this)
bun run lint -- --fix
```

## Common Linting Issues and Fixes

### Unused Variables
```tsx
// ❌ Bad: greeting is declared but never used
const [greeting, setGreeting] = useState('');

// ✅ Good: Remove unused variable or use it
const [, setGreeting] = useState(''); // If not reading
// or use the greeting variable in your JSX
```

### Missing Dependencies in useEffect
```tsx
// ❌ Bad: name is used but not in dependency array
useEffect(() => {
  fetchGreeting(name);
}, []);

// ✅ Good: Add name to dependencies
useEffect(() => {
  fetchGreeting(name);
}, [name, fetchGreeting]);
```

### Prefer const over let
```tsx
// ❌ Bad: Using let when value never changes
let apiUrl = '/api/greeting';

// ✅ Good: Use const
const apiUrl = '/api/greeting';
```

## Expected Output

A successful lint run should show:
```
✓ All files passed linting
```

Or if using ESLint directly:
```
$ eslint .
```

## Tips
- ESLint configuration is in `eslint.config.js` in the frontend directory
- Some warnings can be addressed by adding proper types
- Read the error messages carefully - they usually suggest fixes
- Don't disable rules unless absolutely necessary and document why

Closes #[ISSUE_NUMBER]
