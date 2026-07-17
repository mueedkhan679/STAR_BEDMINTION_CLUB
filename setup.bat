@echo off
echo ============================================
echo Star Badminton Club - Setup Script
echo ============================================
echo.

echo Step 1: Installing root dependencies...
npm install
if %errorlevel% neq 0 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Installing server dependencies...
cd server
npm install
if %errorlevel% neq 0 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Installing client dependencies...
cd ../client
npm install
if %errorlevel% neq 0 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running
echo 2. Create database 'star_badminton_db'
echo 3. Run: cd server ^&^& npx prisma db push
echo 4. Run: npm run dev
echo.
pause