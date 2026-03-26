@echo off
:: ═══════════════════════════════════════════════════
::  Reality Loop Simulator — One-Click Launcher
::  Windows version
:: ═══════════════════════════════════════════════════

title Reality Loop Simulator — by Chadi0x

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║    REALITY LOOP SIMULATOR  v2.0          ║
echo  ║    Your future is predictable.           ║
echo  ║                                          ║
echo  ║    Dev: Chadi0x - The Maker. Legend.     ║
echo  ╚══════════════════════════════════════════╝
echo.

:: ── Check Python ──────────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python not found. Install from https://python.org
    pause
    exit /b 1
)
echo  [OK] Python found.

:: ── Check Node ────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
echo  [OK] Node.js found.
echo.

:: ── Backend setup ─────────────────────────────────
echo  Setting up backend...
cd backend

if not exist "venv" (
    echo  Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo  Installing Python dependencies...
pip install -q -r requirements.txt
echo  [OK] Backend ready.
echo.

:: ── Frontend setup ────────────────────────────────
echo  Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo  Installing npm packages (first time, ~30s)...
    npm install --silent
)
echo  [OK] Frontend ready.
echo.

:: ── Start backend in a new window ────────────────
echo  Starting backend on port 8000...
cd ..\backend
start "RLS Backend — Chadi0x" cmd /k "venv\Scripts\activate && uvicorn main:app --port 8000"

timeout /t 3 /nobreak >nul

:: ── Start frontend ─────────────────────────────
echo  Starting frontend...
cd ..\frontend

start "" "http://localhost:5173"

npm run dev

pause
