@echo off
echo ==========================================
echo       E-Commerce App Setup & Run
echo ==========================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Setting up Database (Migrations)...
echo Attempting to connect to MySQL at localhost:3306...
call npx prisma db push --accept-data-loss
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to connect to the database.
    echo Please ensure:
    echo 1. MySQL Server is installed and RUNNING.
    echo 2. You have created a database named 'ecommerce_db' (optional, Prisma can create it).
    echo 3. The credentials in .env are correct (default: root, no password).
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Seeding Database and Migrating Specifications...

echo Creating Admin User...
node --env-file=.env scripts/seed/promote-admin.js

if exist .seeded (
    echo Data already seeded. Skipping...
) else (
    echo Seeding StarTech Data (This may take a while)...
    node scripts/seed/seed-startech.js
    if %ERRORLEVEL% EQU 0 (
        echo. > .seeded
        echo Seeding completed.
    )
)

if exist .specs-migrated (
    echo Specs already migrated. Skipping...
) else (
    echo Migrating Specifications to Attributes...
    node scripts/seed/migrate-specs.js
    if %ERRORLEVEL% EQU 0 (
        echo. > .specs-migrated
        echo Migration completed.
    )
)

echo.
echo [4/4] Starting Development Server...
echo The app will be available at http://localhost:3000
echo.
call npm run dev

