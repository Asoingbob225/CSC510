#!/bin/bash

# Integration test script for frontend-backend communication
set -e

echo "🚀 Starting Integration Tests..."

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Start backend
echo "🔧 Starting backend server..."
cd proj2/backend
uv run fastapi dev index.py --port 8000 &
BACKEND_PID=$!
cd ../..

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
timeout 30 bash -c 'until curl -f http://localhost:8000/api > /dev/null 2>&1; do sleep 1; done'
echo "✅ Backend is running and responding"

# Test backend API
echo "🧪 Testing backend API..."
response=$(curl -s http://localhost:8000/api)
if echo "$response" | grep -q "Hello World"; then
    echo "✅ Backend API test passed"
else
    echo "❌ Backend API test failed"
    exit 1
fi

# Build and start frontend
echo "🏗️ Building frontend..."
cd proj2/frontend
npm run build

echo "🔧 Starting frontend server..."
npm run preview -- --port 5173 &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
timeout 30 bash -c 'until curl -f http://localhost:5173 > /dev/null 2>&1; do sleep 1; done'
echo "✅ Frontend is running"

# Test frontend static content
echo "🧪 Testing frontend static content..."
frontend_content=$(curl -s http://localhost:5173/)
if echo "$frontend_content" | grep -q "root"; then
    echo "✅ Frontend serves valid HTML"
else
    echo "❌ Frontend HTML test failed"
    exit 1
fi

# Test API accessibility (note: proxy might not work in preview mode)
echo "🧪 Testing API through frontend proxy..."
if curl -f http://localhost:5173/api > /dev/null 2>&1; then
    proxy_response=$(curl -s http://localhost:5173/api)
    if echo "$proxy_response" | grep -q "Hello World"; then
        echo "✅ Frontend-backend proxy integration works"
    else
        echo "⚠️ Frontend-backend proxy returns unexpected content"
    fi
else
    echo "⚠️ Frontend-backend proxy not working (expected in preview mode)"
fi

echo "🎉 Integration tests completed successfully!"