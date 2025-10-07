#!/bin/bash

# Sora Studio - Server Startup Script

echo "🎬 Starting Sora Studio..."
echo ""

# Check if .env file exists and has API key
if [ -f ".env" ]; then
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo "✅ Found API key in .env file"
    else
        echo "⚠️  Warning: No API key found in .env file"
        echo "   Edit .env and add: OPENAI_API_KEY=sk-your-key-here"
    fi
else
    echo "⚠️  No .env file found"
    echo "   Copy .env.example to .env and add your API key"
fi

echo ""
echo "🚀 Starting web server on http://localhost:8000"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the Python HTTP server
python3 -m http.server 8000
