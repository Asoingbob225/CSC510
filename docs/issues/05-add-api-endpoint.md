# Create a New "Greeting" API Endpoint in Backend

**Labels:** `good first issue`, `hello-workflow`, `backend`, `enhancement`

## Description
Add a new FastAPI endpoint that returns a personalized greeting. This task helps you learn how to add backend functionality.

## Prerequisites
- Issue #4 completed (Dev server runs successfully)

## Tasks
- [ ] Open `proj2/backend/index.py`
- [ ] Add a new GET endpoint `/api/greeting` that accepts a `name` query parameter
- [ ] Return JSON: `{"greeting": "Hello, {name}!"}`
- [ ] Test the endpoint using curl or browser
- [ ] Verify the response is correct with and without the name parameter

## Implementation Guide

Add this function to `proj2/backend/index.py`:

```python
@app.get("/api/greeting")
def get_greeting(name: str = "Guest"):
    """
    Return a personalized greeting.
    
    Args:
        name: The name to greet (default: "Guest")
    
    Returns:
        JSON with greeting message
    """
    return {"greeting": f"Hello, {name}!"}
```

## Acceptance Criteria
- ✅ New endpoint is added to `index.py`
- ✅ Endpoint returns correct JSON format
- ✅ Default parameter works: `/api/greeting` returns "Hello, Guest!"
- ✅ Custom name works: `/api/greeting?name=Alice` returns "Hello, Alice!"
- ✅ Screenshot of browser/curl showing successful API response
- ✅ Code follows existing style in the file

## Testing Your Changes

```bash
# Start the dev server
cd CSC510/proj2
bun dev

# In another terminal, test the endpoint
curl http://localhost:8000/api/greeting
# Expected: {"greeting":"Hello, Guest!"}

curl "http://localhost:8000/api/greeting?name=Alice"
# Expected: {"greeting":"Hello, Alice!"}

# Or open in browser:
# http://localhost:8000/api/greeting?name=YourName
```

## Tips
- FastAPI automatically generates interactive API docs at `http://localhost:8000/docs`
- You can test your endpoint there too!
- Remember to save the file and FastAPI will auto-reload

Closes #[ISSUE_NUMBER]
