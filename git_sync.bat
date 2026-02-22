@echo off
rem Remove any nested Git repositories to avoid submodule issues
if exist "backend\.git" rmdir /s /q "backend\.git"
if exist "frontend\.git" rmdir /s /q "frontend\.git"
if exist "blockchain\.git" rmdir /s /q "blockchain\.git"

rem Unstage the gitlink for backend and add it as a normal folder
git rm --cached backend >nul 2>&1
git add .

rem Commit with a single-word message if shell escaping is failing
git commit -m "Migration_to_Supabase_and_Auth_Stabilization_Complete"

rem Push to the remote main branch
git push origin main
