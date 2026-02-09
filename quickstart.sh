#!/bin/bash

echo "======================================"
echo "Advanced Accounting System - Quick Start"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials"
    echo ""
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if PostgreSQL is accessible
echo "🔍 Checking database connection..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client found"
else
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed."
fi

echo ""
echo "======================================"
echo "Next Steps:"
echo "======================================"
echo "1. Edit .env file with your database credentials"
echo "2. Create database: createdb accounting_db"
echo "3. Run migrations: npm run migrate"
echo "4. Seed sample data: npm run seed"
echo "5. Start the server: npm start"
echo ""
echo "For detailed instructions, see SETUP.md"
echo "For usage examples, see EXAMPLES.md"
echo "For API docs, see API.md"
echo ""
echo "Default admin credentials after seeding:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "======================================"
