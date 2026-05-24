#!/bin/bash

# Exit on error
set -e

echo "========================================"
echo "🚀 Starting NestJS Backend Setup & Run"
echo "========================================"

# Determine directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 1. Generate Prisma Client
echo "🔮 Generating Prisma Client from schema.prisma..."
npx prisma generate

# 2. Start the NestJS dev server
echo "⚡ Starting NestJS development server on http://localhost:3333..."
echo "========================================"
npm run start:dev
