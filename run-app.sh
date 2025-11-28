#!/bin/bash

echo "=========================================="
echo "       E-Commerce App Setup & Run"
echo "=========================================="
echo ""

echo "[1/3] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error installing dependencies."
    exit 1
fi

echo ""
echo "[2/4] Setting up Database (Migrations & Seeding)..."
echo "Attempting to connect to MySQL at localhost:3306..."
# Use --accept-data-loss to automate schema updates
npx prisma db push --accept-data-loss
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Failed to connect to the database."
    echo "Please ensure:"
    echo "1. MySQL Server is installed and RUNNING."
    echo "2. The credentials in .env are correct."
    echo ""
    exit 1
fi

echo "Creating Admin User..."
node promote-admin.js

if [ -f ".seeded" ]; then
    echo "Data already seeded. Skipping to prevent re-insertion of deleted items..."
else
    echo "Seeding StarTech Data (This may take a while)..."
    node seed-startech.js
    if [ $? -eq 0 ]; then
        touch .seeded
        echo "Seeding completed. Created .seeded marker file."
    else
        echo "Seeding failed. Will retry next time."
    fi
fi

echo ""
echo "[3/4] Starting Development Server..."
echo "The app will be available at http://localhost:3000"
echo ""
npm run dev
