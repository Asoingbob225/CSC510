# Start and Verify Full-Stack Development Server

**Labels:** `good first issue`, `hello-workflow`, `testing`

## Description
Run both the frontend and backend servers concurrently and verify they communicate properly.

## Prerequisites
- Issue #1 completed (Prerequisites installed)
- Issue #2 completed (Frontend dependencies installed)
- Issue #3 completed (Backend dependencies installed)

## Tasks
- [ ] Navigate to `CSC510/proj2` directory
- [ ] Run `bun dev` to start both servers
- [ ] Verify backend starts on port 8000
- [ ] Verify frontend starts on port 5173
- [ ] Open browser to `http://localhost:5173`
- [ ] Confirm "Hello World" message appears on the page

## Acceptance Criteria
- ✅ Both servers start without errors
- ✅ Backend is accessible at `http://localhost:8000/api`
- ✅ Frontend successfully fetches data from backend API
- ✅ Browser displays "Hello World" message
- ✅ Screenshot of working application in browser
- ✅ No console errors in browser developer tools

## Commands to Run
```bash
cd CSC510/proj2
bun dev

# In another terminal, test the backend directly
curl http://localhost:8000/api

# Open browser to http://localhost:5173
```

## Expected Output
- Backend console: "INFO: Uvicorn running on http://127.0.0.1:8000"
- Frontend console: "VITE v... ready in ... ms"
- Browser: Page showing "Hello World" in large, bold, underlined text

## Troubleshooting
- If ports are in use, check with `lsof -i :5173` and `lsof -i :8000`
- Make sure both dependencies are installed (Issues #2 and #3)
- Check browser console for any errors

Closes #[ISSUE_NUMBER]
