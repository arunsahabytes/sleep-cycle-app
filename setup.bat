@echo off
echo 🚀 Setting up Sleep Cycle App...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Create .env files in both backend/ and frontend/ directories
echo 2. Start the backend: cd backend ^&^& npm run dev
echo 3. Start the frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 The app will be available at:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo.
pause
