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
# Remove --accept-data-loss to prevent accidental data loss
npx prisma db push
if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Failed to connect to the database or schema conflict."
    echo "Please check the error message above."
    echo ""
    exit 1
fi

echo "Creating Admin User..."
node promote-admin.js

if [ -f ".seeded" ]; then
    echo "Data already seeded. Skipping..."
else
    echo "Seeding StarTech Data (This may take a while)..."
    node seed-startech.js
    if [ $? -eq 0 ]; then
        touch .seeded
        echo "Seeding completed."
    fi
fi

if [ -f ".specs-migrated" ]; then
    echo "Specs already migrated. Skipping..."
else
    echo "Migrating Specifications to Attributes..."
    node scripts/migrate-specs.js
    if [ $? -eq 0 ]; then
        touch .specs-migrated
        echo "Migration completed."
    fi
fi

echo ""
echo "[3/4] Starting Development Server..."
echo "The app will be available at http://localhost:3000"
echo ""
npm run dev
