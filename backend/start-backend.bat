@echo off
cd /d "%~dp0"
echo Freeing port 4001 if in use...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 4001 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul
echo Starting backend on http://localhost:4001
node app.js
pause
