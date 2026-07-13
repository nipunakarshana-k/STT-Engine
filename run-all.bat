@echo off
title STT Engine Launcher
echo ========================================================
echo        STT Engine AI-Powered Workspace Launcher
echo ========================================================
echo.

REM Check if Python virtual environment exists
if not exist "backend\venv" (
    echo [WARNING] Python virtual environment not found in backend/venv.
    echo Creating virtual environment and installing dependencies...
    python -m venv backend/venv
    call backend\venv\Scripts\pip install -r backend/requirements.txt
)

REM Check if Prisma DB exists, run sync if not
if not exist "prisma\dev.db" (
    echo [INFO] Syncing database schema...
    call npx prisma db push
)

echo [1/2] Starting FastAPI backend on http://127.0.0.1:8000...
start "STT Engine Backend (FastAPI)" cmd /k "cd backend && venv\Scripts\python -m uvicorn main:app --reload --port 8000"

echo [2/2] Starting Next.js frontend on http://127.0.0.1:3000...
echo.
npm run dev
