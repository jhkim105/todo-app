#!/bin/bash

# Exit on error
set -e

echo "========================================"
echo "🚀 Starting Flask Backend Setup & Run"
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

# 4. Start the Flask server
echo "⚡ Starting Flask dev server on http://localhost:5000..."
echo "========================================"
python app.py
