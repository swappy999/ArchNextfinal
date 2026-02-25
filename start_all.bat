@echo off
echo [ArchNext] Cleaning up old processes...

:: Kill any hanging node processes to free port 3000
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 >nul

:: Clear the Next.js lock and cache
if exist "frontend\.next" (
    echo [ArchNext] Clearing Next.js cache...
    rmdir /s /q "frontend\.next"
)

echo.
echo [ArchNext] Starting Backend...
start "Backend API" cmd /k "cd backend && venv\Scripts\python.exe -m pip install -r requirements.txt && venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"

timeout /t 3 >nul

echo [ArchNext] Starting Frontend...
start "Frontend App" cmd /k "cd frontend && npm install --legacy-peer-deps && npm run dev"

echo.
echo [ArchNext] Systems launching!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
