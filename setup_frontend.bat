@echo off
echo [ArchNext] Installing frontend dependencies...
cd frontend
npm install

echo.
echo [ArchNext] Starting frontend dev server...
npm run dev
