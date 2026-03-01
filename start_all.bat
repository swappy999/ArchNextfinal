@echo off
setlocal enabledelayedexpansion

:: Set colors for a premium terminal feel
color 0B
echo.
echo  █████╗ ██████╗  ██████╗██╗  ██╗███╗   ██╗███████╗██╗  ██╗████████╗
echo ██╔══██╗██╔══██╗██╔════╝██║  ██║████╗  ██║██╔════╝╚██╗██╔╝╚══██╔══╝
echo ███████║██████╔╝██║     ███████║██╔██╗ ██║█████╗   ╚███╔╝    ██║   
echo ██╔══██║██╔══██╗██║     ██╔══██║██║╚██╗██║██╔══╝   ██╔██╗    ██║   
echo ██║  ██║██║  ██║╚██████╗██║  ██║██║ ╚████║███████╗██╔╝ ██╗   ██║   
echo ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝   
echo.
echo ─────────────────────────────────────────────────────────────────
echo  [SYSTEM] INITIALIZING ARCHON INTELLIGENCE ECOSYSTEM
echo ─────────────────────────────────────────────────────────────────

:: 0. Free Network Ports (Prevents Zombie Locks)
echo [0/4] Purging residual network locks (Ports 3000, 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 /nobreak >nul


:: 1. Database Health Check
echo [1/4] Verifying Cloud Intelligence Database...
cd backend
venv\Scripts\python.exe verify_db.py
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Database connection failed.
    pause
    exit /b
)

:: 2. Seed Market Data (Ensures Marketplace is never "Offline")
echo [2/4] Seeding Neural Market Intelligence (SQL)...
venv\Scripts\python.exe seed_market.py >nul 2>&1

:: 3. Launch Backend
echo [3/4] Powering up Hyper-Speed API (Port 8000)...
start "ArchNext - Backend Engine" cmd /k "venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"

:: 4. Launch Frontend
echo [4/4] Synchronizing Neural Interface (Port 3000)...
cd ..
start "ArchNext - Visual Core" cmd /k "cd frontend && npm run dev"

echo.
echo ─────────────────────────────────────────────────────────────────
echo [STATUS] SYSTEMS ACTIVE
echo - Backend:  http://localhost:8000
echo - Frontend: http://localhost:3000
echo ─────────────────────────────────────────────────────────────────
echo.
echo Core orchestration complete. Keep this window open.
echo Press any key to terminate all sessions...
pause >nul
taskkill /F /FI "WINDOWTITLE eq ArchNext*" /T >nul 2>&1
