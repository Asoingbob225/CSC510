# Hello Workflow - Initial Issues

This document contains 8 tiny tasks designed to ensure every teammate can run the full workflow. Each task should be created as a separate GitHub Issue and assigned to different teammates.

---

## Issue 1: Install Development Prerequisites

**Title:** Install Development Prerequisites (Bun, uv, Python)

**Description:**
Set up the required development tools on your local machine to work on the proj2 full-stack application.

**Tasks:**
- [ ] Install Bun (v1.2.21 or later) following https://bun.sh/install
- [ ] Install uv following https://docs.astral.sh/uv/getting-started/installation/
- [ ] Verify Python 3.9+ is installed
- [ ] Run `bun --version` to confirm Bun installation
- [ ] Run `uv --version` to confirm uv installation
- [ ] Run `python --version` to confirm Python version

**Acceptance Criteria:**
- All three tools (Bun, uv, Python) are installed and versions can be verified via command line
- Screenshot of terminal showing all three version commands succeeding

**Closes:** #[ISSUE_NUMBER]

---

## Issue 2: Set Up Frontend Dependencies

**Title:** Install and Verify proj2 Frontend Dependencies

**Description:**
Install all required dependencies for the React + TypeScript frontend application.

**Tasks:**
- [ ] Navigate to `CSC510/proj2` directory
- [ ] Run `bun install` in the root directory
- [ ] Navigate to `CSC510/proj2/frontend` directory
- [ ] Run `bun install` in the frontend directory
- [ ] Verify `node_modules` folder is created
- [ ] Check that no errors occurred during installation

**Acceptance Criteria:**
- All dependencies are installed successfully without errors
- `node_modules` directories exist in both root and frontend folders
- Screenshot of successful installation output

**Closes:** #[ISSUE_NUMBER]

---

## Issue 3: Set Up Backend Dependencies

**Title:** Install and Verify proj2 Backend Dependencies

**Description:**
Install all required Python dependencies for the FastAPI backend application.

**Tasks:**
- [ ] Navigate to `CSC510/proj2/backend` directory
- [ ] Run `uv sync` to install Python dependencies
- [ ] Verify `.venv` or virtual environment is created
- [ ] Check that `fastapi` is installed correctly
- [ ] Verify no errors occurred during installation

**Acceptance Criteria:**
- Python dependencies are installed successfully without errors
- Virtual environment is created
- Screenshot of successful `uv sync` output

**Closes:** #[ISSUE_NUMBER]

---

## Issue 4: Run the Full Development Server

**Title:** Start and Verify Full-Stack Development Server

**Description:**
Run both the frontend and backend servers concurrently and verify they communicate properly.

**Tasks:**
- [ ] Navigate to `CSC510/proj2` directory
- [ ] Run `bun dev` to start both servers
- [ ] Verify backend starts on port 8000
- [ ] Verify frontend starts on port 5173
- [ ] Open browser to `http://localhost:5173`
- [ ] Confirm "Hello World" message appears on the page

**Acceptance Criteria:**
- Both servers start without errors
- Frontend successfully fetches data from backend API
- Browser displays "Hello World" message
- Screenshot of working application in browser

**Closes:** #[ISSUE_NUMBER]

---

## Issue 5: Add a New API Endpoint

**Title:** Create a New "Greeting" API Endpoint in Backend

**Description:**
Add a new FastAPI endpoint that returns a personalized greeting.

**Tasks:**
- [ ] Open `proj2/backend/index.py`
- [ ] Add a new GET endpoint `/api/greeting` that accepts a `name` query parameter
- [ ] Return JSON: `{"greeting": "Hello, {name}!"}`
- [ ] Test the endpoint by visiting `http://localhost:8000/api/greeting?name=YourName`
- [ ] Verify the response is correct

**Example Code:**
```python
@app.get("/api/greeting")
def get_greeting(name: str = "Guest"):
    return {"greeting": f"Hello, {name}!"}
```

**Acceptance Criteria:**
- New endpoint is added to `index.py`
- Endpoint returns correct JSON format
- Endpoint works with and without the name parameter
- Screenshot of browser/curl showing successful API response

**Closes:** #[ISSUE_NUMBER]

---

## Issue 6: Display Greeting in Frontend

**Title:** Add UI Component to Display Personalized Greeting

**Description:**
Create a new React component that fetches and displays the personalized greeting from the new API endpoint.

**Tasks:**
- [ ] Open `proj2/frontend/src/App.tsx`
- [ ] Add a text input field for entering a name
- [ ] Add a button to fetch the greeting
- [ ] Display the greeting message from the API response
- [ ] Test the functionality by entering different names

**Acceptance Criteria:**
- Input field and button are visible in the UI
- Clicking the button fetches data from `/api/greeting`
- Greeting message is displayed on the page
- UI is styled consistently with existing design
- Screenshot of working UI with greeting displayed

**Closes:** #[ISSUE_NUMBER]

---

## Issue 7: Run Frontend Linter

**Title:** Verify and Fix Frontend Code Quality with ESLint

**Description:**
Run the frontend linter to check code quality and fix any issues.

**Tasks:**
- [ ] Navigate to `proj2/frontend` directory
- [ ] Run `bun run lint` to check for linting errors
- [ ] Review any errors or warnings
- [ ] Fix any linting issues found
- [ ] Re-run linter to confirm all issues are resolved

**Acceptance Criteria:**
- Linter runs successfully
- All linting errors are fixed (or justified if ignored)
- Screenshot of clean linter output

**Closes:** #[ISSUE_NUMBER]

---

## Issue 8: Update Project Documentation

**Title:** Document the Hello Workflow in README

**Description:**
Update the proj2 README with a "Quick Start" section that summarizes the workflow.

**Tasks:**
- [ ] Open `proj2/README.md`
- [ ] Add a "Quick Start" section at the top
- [ ] Document the 4-step workflow: install prerequisites, install dependencies, run server, verify
- [ ] Include links to the detailed setup sections
- [ ] Review for clarity and completeness

**Example Section:**
```markdown
## Quick Start

1. **Install Prerequisites:** Bun, uv, Python 3.9+ (see [Prerequisites](#prerequisites))
2. **Install Dependencies:** Run `bun install` in root and frontend, `uv sync` in backend
3. **Start Servers:** Run `bun dev` from proj2 root directory
4. **Verify:** Open http://localhost:5173 and confirm the app is running
```

**Acceptance Criteria:**
- README includes a clear Quick Start section
- All steps are accurate and easy to follow
- Links to detailed sections work correctly
- Changes are committed to the repository

**Closes:** #[ISSUE_NUMBER]

---

## Notes for Team Leads

- Assign one issue per teammate
- Each teammate should create a PR that references their issue using "Closes #X"
- Review PRs to ensure acceptance criteria are met
- This workflow ensures everyone can:
  - Set up their development environment
  - Run the application
  - Make code changes
  - Test and verify their work
  - Follow proper Git workflow
