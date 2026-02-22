@echo off
git add .
git commit -m "Supabase Migration, Auth Stabilization, and Cinematic UI"
git remote add origin https://github.com/swappy999/ArchNext--temp
git fetch origin
git rebase origin/main
git push origin main
