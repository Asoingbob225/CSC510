# Add UI Component to Display Personalized Greeting

**Labels:** `good first issue`, `hello-workflow`, `frontend`, `enhancement`

## Description
Create a new React component that fetches and displays the personalized greeting from the new API endpoint. This task helps you learn how to add frontend functionality and connect to the backend.

## Prerequisites
- Issue #5 completed (Greeting API endpoint created)

## Tasks
- [ ] Open `proj2/frontend/src/App.tsx`
- [ ] Add a text input field for entering a name
- [ ] Add a button to fetch the greeting
- [ ] Add state management for the name and greeting
- [ ] Display the greeting message from the API response
- [ ] Test the functionality by entering different names

## Implementation Guide

Modify `proj2/frontend/src/App.tsx` to add greeting functionality. Here's a suggested implementation:

```tsx
import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetch('/api')
      .then((response) => response.json())
      .then((data) => setMessage(data['The server is running']));
  }, []);

  const fetchGreeting = async () => {
    const response = await fetch(`/api/greeting?name=${name || 'Guest'}`);
    const data = await response.json();
    setGreeting(data.greeting);
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8">
      <div>
        <h1 className="text-3xl font-bold underline">{message}</h1>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="rounded border border-gray-300 px-4 py-2"
          />
          <button
            onClick={fetchGreeting}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Greet Me
          </button>
        </div>
        {greeting && (
          <p className="text-xl font-semibold text-green-600">{greeting}</p>
        )}
      </div>
    </div>
  );
}

export default App;
```

## Acceptance Criteria
- ✅ Input field and button are visible in the UI
- ✅ Clicking the button fetches data from `/api/greeting`
- ✅ Greeting message is displayed on the page
- ✅ UI is styled consistently with existing design (using Tailwind CSS)
- ✅ Empty input defaults to "Guest"
- ✅ Screenshot of working UI with greeting displayed
- ✅ No console errors in browser developer tools

## Testing Your Changes

```bash
# Start the dev server (if not already running)
cd CSC510/proj2
bun dev

# Open browser to http://localhost:5173
# 1. Try clicking "Greet Me" without entering a name
# 2. Enter a name and click "Greet Me"
# 3. Try different names
# 4. Check browser console for errors (F12)
```

## Tips
- React state updates are asynchronous
- Tailwind CSS classes are already configured in the project
- The Vite proxy automatically forwards `/api` requests to the backend
- Use browser DevTools to debug if something doesn't work

Closes #[ISSUE_NUMBER]
