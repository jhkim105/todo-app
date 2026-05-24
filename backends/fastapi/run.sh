#!/bin/bash

# Exit on error
set -e

echo "========================================"
echo "🚀 Starting FastAPI Backend Setup & Run"
echo "========================================"

# Determine directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 1. Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating python virtual environment (venv)..."
    python3 -m venv venv
fi

# 2. Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# 3. Install/upgrade dependencies
echo "📥 Installing dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. Start the Uvicorn ASGI server
echo "⚡ Starting Uvicorn server on http://localhost:8000..."
echo "Swagger UI will be available at: http://localhost:8000/docs"
echo "========================================"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
