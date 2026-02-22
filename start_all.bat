@echo off
echo [ArchNext] Starting...

start "Backend API" cmd /k "cd backend && uvicorn app.main:app --reload --port 8000"
timeout /t 5 >nul

start "Frontend App" cmd /k "cd frontend && npm run dev"

echo.
echo [ArchNext] Systems launching!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause
