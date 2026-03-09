@echo off
REM Medical AI Assistant - Startup Script for Windows
REM This script automatically sets up and starts both backend (FastAPI) and frontend (Vite) servers

setlocal enabledelayedexpansion

echo.
echo ============================================
echo Medical AI Assistant - Setup & Services
echo ============================================
echo.

REM Check if venv exists, if not create it
if not exist ".\.env\Scripts\python.exe" (
    echo [1/4] Creating virtual environment...
    python -m venv .env
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment!
        echo Please ensure Python is installed and in your PATH
        pause
        exit /b 1
    )
    echo Virtual environment created successfully!
)

REM Install/upgrade backend requirements
echo [2/4] Installing Python dependencies...
call .\.env\Scripts\pip install -q --upgrade pip
call .\.env\Scripts\pip install -q -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies!
    pause
    exit /b 1
)
echo Python dependencies installed successfully!

REM Install frontend dependencies
echo [3/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install -q
    if errorlevel 1 (
        echo ERROR: Failed to install npm dependencies!
        echo Please ensure Node.js is installed
        pause
        exit /b 1
    )
)
cd /d "%~dp0"
echo Frontend dependencies ready!

echo [4/4] Starting services...
echo.
echo ============================================
echo Services starting in separate windows...
echo ============================================
echo.

echo Starting backend (FastAPI on port 8000)...
start "Backend - Medical AI" cmd /k ".\.env\Scripts\python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

REM Give backend a moment to start before starting frontend
timeout /t 2 /nobreak > nul

echo Starting frontend (Vite on port 5173)...
start "Frontend - Medical AI" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================
echo ✓ Services started successfully!
echo ============================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo Docs:     http://localhost:8000/docs
echo.
echo Close the backend or frontend windows to stop them.
echo Press any key to close this setup window...
pause

endlocal

